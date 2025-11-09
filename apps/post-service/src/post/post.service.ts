import { Injectable, NotFoundException, ForbiddenException, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy, ClientGrpc } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, PaginationDto } from './dto';
import { EVENTS, CACHE_KEYS, CACHE_TTL, SERVICES } from '@app/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserService, USERSERVICE_SERVICE_NAME } from '@app/proto/user';
import { lastValueFrom } from 'rxjs';
import type { Post as PrismaPost, Comment as PrismaComment, Like as PrismaLike, Tag as PrismaTag, PostTag as PrismaPostTag, PrismaClient } from '../../../../node_modules/.prisma/client-post';
import type { PostResponse, TagResponse, CommentResponse } from '../../../../generated/post';

// Type definitions for Prisma queries with relations
type PostWithRelations = PrismaPost & {
  _count?: {
    likes: number;
    comments: number;
  };
  likes?: Partial<PrismaLike>[];
  postTags?: (PrismaPostTag & {
    tag: PrismaTag;
  })[];
};

type TagWithCount = PrismaTag & {
  _count: {
    postTags: number;
  };
};

type CommentWithReplies = PrismaComment & {
  replies?: PrismaComment[];
  _count?: {
    replies: number;
  };
};

@Injectable()
export class PostService implements OnModuleInit {
  private readonly logger = new Logger(PostService.name);
  private userService: UserService;
  private userServiceInitialized = false;
  private readonly prismaClient: PrismaClient;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('POST_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(SERVICES.USER_SERVICE) private readonly userClient: ClientGrpc,
  ) {
    // Type-safe access to all Prisma models
    this.prismaClient = this.prisma as unknown as PrismaClient;
  }

  async onModuleInit() {
    // Initialize user service with retry logic
    this.logger.log('🔧 Initializing user service connection...');
    
    try {
      this.userService = this.userClient.getService<UserService>(USERSERVICE_SERVICE_NAME);
      this.logger.log('📡 User service client obtained');
      
      // Wait for user-service to be ready (it starts at same time)
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.logger.log('⏳ Waited 3s for user-service startup');
      
      // Test the connection
      try {
        const testResult = await lastValueFrom(
          this.userService.GetUserById({ id: 'connection-test' })
        ).catch(err => {
          this.logger.warn(`Connection test failed: ${err.message}`);
          return null;
        });
        
        this.userServiceInitialized = true;
        this.logger.log('✅ User service connection established and ready!');
      } catch (error) {
        this.logger.warn('⚠️  User service not yet ready, will retry on first request');
      }
    } catch (error) {
      this.logger.error(`❌ Failed to initialize user service: ${error.message}`);
    }
  }
  
  // Ensure user service is ready before making a call
  private async ensureUserServiceReady() {
    if (!this.userService) {
      this.logger.warn('⚠️  User service client not initialized');
      return false;
    }
    
    if (this.userServiceInitialized) {
      return true;
    }
    
    // Try to initialize now
    this.logger.log('🔄 Attempting lazy initialization of user service...');
    try {
      await lastValueFrom(
        this.userService.GetUserById({ id: 'connection-test' })
      ).catch(() => {});
      
      this.userServiceInitialized = true;
      this.logger.log('✅ User service connection verified (lazy init)');
      return true;
    } catch (error) {
      this.logger.warn(`⚠️  User service still not ready: ${error.message}`);
      return false;
    }
  }

  // Helper method to fetch user data
  private async getUserData(userId: string) {
    // Check if user service is ready
    const isReady = await this.ensureUserServiceReady();
    
    if (!isReady) {
      this.logger.warn(`⚠️  User service not ready, returning Anonymous for ${userId}`);
      return {
        id: userId,
        name: 'Anonymous',
        picture: undefined,
        reputation: 0,
      };
    }

    try {
      const user = await lastValueFrom(
        this.userService.GetUserById({ id: userId })
      );
      
      const displayName = user.username || `${user.firstName} ${user.lastName}`.trim() || 'Anonymous';
      this.logger.log(`✅ Fetched user: ${displayName}`);
      
      return {
        id: user.id,
        name: displayName,
        picture: user.avatar || undefined,
        reputation: 0, // TODO: Add reputation system later
      };
    } catch (error) {
      this.logger.error(`❌ Failed to fetch user ${userId}: ${error.message}`);
      return {
        id: userId,
        name: 'Anonymous',
        picture: undefined,
        reputation: 0,
      };
    }
  }

  // Helper method to format post for gRPC response
  private async formatPostResponse(post: PostWithRelations) {
    const author = await this.getUserData(post.authorId);
    
    // Get tags if postTags is included
    const tags = post.postTags?.map((pt) => ({
      id: pt.tag.id,
      name: pt.tag.name,
      description: pt.tag.description || '',
      questionsCount: 0, // Will be populated separately if needed
      createdAt: pt.tag.createdAt.toISOString(),
    })) || [];
    
    return {
      id: post.id,
      userId: post.authorId,
      content: post.content,
      mediaUrls: post.mediaUrls || [],
      likesCount: post._count?.likes || 0,
      commentsCount: post._count?.comments || 0,
      visibility: post.privacy,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: author,
      tags: tags,
    };
  }

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<PostResponse> {
    const { tags, ...postData } = createPostDto;
    
    const post = await this.prisma.post.create({
      data: {
        ...postData,
        authorId: userId,
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Handle tags if provided
    if (tags && tags.length > 0) {
      await this.handlePostTags(post.id, tags);
    }

    // Emit event
    this.rabbitClient.emit(EVENTS.POST_CREATED, {
      postId: post.id,
      authorId: userId,
      content: post.content,
      createdAt: post.createdAt,
    });

    // Invalidate feed cache for this user AND public feed
    await this.cacheManager.del(CACHE_KEYS.USER_FEED(userId));
    await this.cacheManager.del(CACHE_KEYS.USER_FEED('')); // Invalidate public feed

    return await this.formatPostResponse(post);
  }

  async getPost(postId: string, userId?: string) {
    const cacheKey = CACHE_KEYS.POST(postId);
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const post = await this.prismaClient.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: userId ? {
          where: { userId },
          select: { id: true },
        } : false,
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    }) as PostWithRelations | null;

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const result = await this.formatPostResponse(post);

    await this.cacheManager.set(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }

  async deletePost(postId: string, userId: string): Promise<{ message: string }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    // Emit event
    this.rabbitClient.emit(EVENTS.POST_DELETED, {
      postId,
      authorId: userId,
      mediaUrls: post.mediaUrls,
    });

    // Invalidate cache
    await this.cacheManager.del(CACHE_KEYS.POST(postId));
    await this.cacheManager.del(CACHE_KEYS.USER_FEED(userId));

    return { message: 'Post deleted successfully' };
  }

  async updatePost(postId: string, userId: string, updatePostDto: UpdatePostDto): Promise<PostResponse> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: updatePostDto,
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Invalidate cache
    await this.cacheManager.del(CACHE_KEYS.POST(postId));
    await this.cacheManager.del(CACHE_KEYS.USER_FEED(userId));

    return await this.formatPostResponse(updatedPost);
  }

  async getFeed(userId: string, pagination: PaginationDto) {
    const cacheKey = CACHE_KEYS.USER_FEED(userId);
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          likes: {
            where: { userId },
            select: { id: true },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    const formattedPosts = await Promise.all(
      posts.map(post => this.formatPostResponse(post))
    );

    const result = {
      posts: formattedPosts,
      total,
      page,
      limit,
    };

    await this.cacheManager.set(cacheKey, result, CACHE_TTL.SHORT);
    return result;
  }

  async getUserPosts(userId: string, pagination: PaginationDto): Promise<{ posts: PostResponse[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count({
        where: { authorId: userId },
      }),
    ]);

    const formattedPosts = await Promise.all(
      posts.map(post => this.formatPostResponse(post))
    );

    return {
      posts: formattedPosts,
      total,
      page,
      limit,
    };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      return { message: 'Post already liked' };
    }

    await this.prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    // Emit event
    this.rabbitClient.emit(EVENTS.POST_LIKED, {
      postId,
      userId,
      authorId: post.authorId,
    });

    // Invalidate cache
    await this.cacheManager.del(CACHE_KEYS.POST(postId));

    return { message: 'Post liked successfully' };
  }

  async unlikePost(postId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!existingLike) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    // Invalidate cache
    await this.cacheManager.del(CACHE_KEYS.POST(postId));

    return { message: 'Post unliked successfully' };
  }

  async getPostLikes(postId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          userId: true,
          createdAt: true,
        },
      }),
      this.prisma.like.count({
        where: { postId },
      }),
    ]);

    return {
      data: likes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createComment(postId: string, userId: string, createCommentDto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (createCommentDto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentDto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        postId,
        authorId: userId,
        parentId: createCommentDto.parentId,
      },
    });

    // Emit event
    this.rabbitClient.emit(EVENTS.COMMENT_CREATED, {
      commentId: comment.id,
      postId,
      authorId: userId,
      content: comment.content,
    });

    // Invalidate cache
    await this.cacheManager.del(CACHE_KEYS.POST(postId));

    return comment;
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    // Invalidate cache
    await this.cacheManager.del(CACHE_KEYS.POST(comment.postId));

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    // Invalidate cache
    await this.cacheManager.del(CACHE_KEYS.POST(comment.postId));

    return { message: 'Comment deleted successfully' };
  }

  async getPostComments(postId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          postId,
          parentId: null, // Only top-level comments
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          replies: {
            take: 3,
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      this.prisma.comment.count({
        where: {
          postId,
          parentId: null,
        },
      }),
    ]);

    return {
      comments: comments.map(comment => ({
        id: comment.id,
        postId: comment.postId,
        userId: comment.authorId,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
      })),
      total,
    };
  }

  // ========== Tag Methods ==========
  
  async getTags(pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [tags, total] = await Promise.all([
      this.prismaClient.tag.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              postTags: true,
            },
          },
        },
      }) as Promise<TagWithCount[]>,
      this.prismaClient.tag.count(),
    ]);

    return {
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        description: tag.description || '',
        questionsCount: tag._count.postTags,
        createdAt: tag.createdAt.toISOString(),
      })),
      total,
    };
  }

  async getPopularTags(limit: number = 5) {
    const tags = await this.prismaClient.tag.findMany({
      take: limit,
      include: {
        _count: {
          select: {
            postTags: true,
          },
        },
      },
      orderBy: {
        postTags: {
          _count: 'desc',
        },
      },
    }) as TagWithCount[];

    return {
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        description: tag.description || '',
        questionsCount: tag._count.postTags,
        createdAt: tag.createdAt.toISOString(),
      })),
      total: tags.length,
    };
  }

  async getPostsByTag(tagName: string, pagination: PaginationDto): Promise<{ posts: PostResponse[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Find tag by name (case-insensitive)
    const tag = await this.prismaClient.tag.findFirst({
      where: {
        name: {
          equals: tagName,
          mode: 'insensitive',
        },
      },
    });

    if (!tag) {
      return {
        posts: [],
        total: 0,
        page,
        limit,
      };
    }

    const [postTags, total] = await Promise.all([
      this.prismaClient.postTag.findMany({
        where: { tagId: tag.id },
        skip,
        take: limit,
        include: {
          post: {
            include: {
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
              postTags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
        orderBy: {
          post: {
            createdAt: 'desc',
          },
        },
      }),
      this.prismaClient.postTag.count({
        where: { tagId: tag.id },
      }),
    ]);

    const posts = await Promise.all(
      postTags.map(async (pt) => await this.formatPostResponse(pt.post))
    );

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async createTag(name: string, description?: string) {
    // Check if tag already exists
    const existingTag = await this.prismaClient.tag.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingTag) {
      return {
        id: existingTag.id,
        name: existingTag.name,
        description: existingTag.description || '',
        questionsCount: 0,
        createdAt: existingTag.createdAt.toISOString(),
      };
    }

    const tag = await this.prismaClient.tag.create({
      data: {
        name: name.toLowerCase(),
        description,
      },
    });

    return {
      id: tag.id,
      name: tag.name,
      description: tag.description || '',
      questionsCount: 0,
      createdAt: tag.createdAt.toISOString(),
    };
  }

  // Modified createPost to handle tags
  private async handlePostTags(postId: string, tagNames: string[]) {
    if (!tagNames || tagNames.length === 0) return;

    for (const tagName of tagNames) {
      try {
        // Find or create tag
        let tag = await this.prismaClient.tag.findFirst({
          where: {
            name: {
              equals: tagName.toLowerCase(),
              mode: 'insensitive',
            },
          },
        });

        if (!tag) {
          tag = await this.prismaClient.tag.create({
            data: {
              name: tagName.toLowerCase(),
            },
          });
        }

        // Create post-tag relation (upsert to avoid duplicate errors)
        await this.prismaClient.postTag.upsert({
          where: {
            postId_tagId: {
              postId,
              tagId: tag.id,
            },
          },
          create: {
            postId,
            tagId: tag.id,
          },
          update: {}, // No update needed if already exists
        });
      } catch (error) {
        this.logger.warn(`Failed to handle tag "${tagName}" for post ${postId}:`, error.message);
        // Continue with next tag instead of failing the entire operation
      }
    }
  }

  async handleUserDeleted(userId: string) {
    // Delete all posts and related data for deleted user
    await this.prisma.post.deleteMany({
      where: { authorId: userId },
    });

    await this.prisma.comment.deleteMany({
      where: { authorId: userId },
    });

    await this.prisma.like.deleteMany({
      where: { userId },
    });
  }
}
