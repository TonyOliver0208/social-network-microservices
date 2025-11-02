import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, PaginationDto } from './dto';
import { EVENTS, CACHE_KEYS, CACHE_TTL } from '@app/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('POST_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Helper method to format post for gRPC response
  private formatPostResponse(post: any) {
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
    };
  }

  async createPost(userId: string, createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        ...createPostDto,
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

    // Emit event
    this.rabbitClient.emit(EVENTS.POST_CREATED, {
      postId: post.id,
      authorId: userId,
      content: post.content,
      createdAt: post.createdAt,
    });

    // Invalidate feed cache
    await this.cacheManager.del(CACHE_KEYS.USER_FEED(userId));

    return this.formatPostResponse(post);
  }

  async getPost(postId: string, userId?: string) {
    const cacheKey = CACHE_KEYS.POST(postId);
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const post = await this.prisma.post.findUnique({
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
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const result = this.formatPostResponse(post);

    await this.cacheManager.set(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }

  async updatePost(postId: string, userId: string, updatePostDto: UpdatePostDto) {
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

    return this.formatPostResponse(updatedPost);
  }

  async deletePost(postId: string, userId: string) {
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

    const result = {
      posts: posts.map(post => this.formatPostResponse(post)),
      total,
      page,
      limit,
    };

    await this.cacheManager.set(cacheKey, result, CACHE_TTL.SHORT);
    return result;
  }

  async getUserPosts(userId: string, pagination: PaginationDto) {
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

    return {
      posts: posts.map(post => this.formatPostResponse(post)),
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
