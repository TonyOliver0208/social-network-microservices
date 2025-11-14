import { Injectable, NotFoundException, ForbiddenException, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, PaginationDto } from '../../dto';
import { EVENTS, CACHE_KEYS, CACHE_TTL } from '@app/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Post as PrismaPost, Like as PrismaLike, Tag as PrismaTag, PostTag as PrismaPostTag, PrismaClient } from '../../../../../../node_modules/.prisma/client-post';
import type { PostResponse } from '../../../../../../generated/post';
import { PostViewService } from '../view/post-view.service';

type PostWithRelations = PrismaPost & {
  _count?: {
    likes: number;
    comments: number;
    questionVotes?: number;
  };
  likes?: Partial<PrismaLike>[];
  postTags?: (PrismaPostTag & {
    tag: PrismaTag;
  })[];
  questionVotes?: any[];
  favoriteQuestions?: any[];
};

@Injectable()
export class PostLogicService {
  private readonly logger = new Logger(PostLogicService.name);
  private readonly prismaClient: PrismaClient;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('POST_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly viewService: PostViewService,
  ) {
    this.prismaClient = this.prisma as unknown as PrismaClient;
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

    if (tags && tags.length > 0) {
      await this.handlePostTags(post.id, tags);
    }

    this.rabbitClient.emit(EVENTS.POST_CREATED, {
      postId: post.id,
      authorId: userId,
      content: post.content,
      createdAt: post.createdAt,
    });

    await this.cacheManager.del(CACHE_KEYS.USER_FEED(userId));
    await this.cacheManager.del(CACHE_KEYS.USER_FEED(''));

    return await this.viewService.formatPostResponse(post);
  }

  async getPost(postId: string, userId?: string): Promise<PostResponse> {
    const cacheKey = CACHE_KEYS.POST(postId);
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached as PostResponse;
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
        questionVotes: userId ? {
          where: { userId },
        } : true,
        favoriteQuestions: userId ? {
          where: { userId },
        } : false,
      },
    }) as PostWithRelations | null;

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const result = await this.viewService.formatPostResponse(post, userId);

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

    this.rabbitClient.emit(EVENTS.POST_DELETED, {
      postId,
      authorId: userId,
      mediaUrls: post.mediaUrls,
    });

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

    await this.cacheManager.del(CACHE_KEYS.POST(postId));
    await this.cacheManager.del(CACHE_KEYS.USER_FEED(userId));

    return await this.viewService.formatPostResponse(updatedPost);
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
      posts.map(post => this.viewService.formatPostResponse(post))
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
      posts.map(post => this.viewService.formatPostResponse(post))
    );

    return {
      posts: formattedPosts,
      total,
      page,
      limit,
    };
  }

  async handleUserDeleted(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      select: { id: true },
    });

    for (const post of posts) {
      await this.cacheManager.del(CACHE_KEYS.POST(post.id));
    }

    await this.prisma.post.deleteMany({
      where: { authorId: userId },
    });

    await this.cacheManager.del(CACHE_KEYS.USER_FEED(userId));

    this.logger.log(`Deleted all posts for user ${userId}`);
  }

  private async handlePostTags(postId: string, tagNames: string[]) {
    for (const tagName of tagNames) {
      const normalizedTagName = tagName.trim().toLowerCase();

      let tag = await this.prismaClient.tag.findUnique({
        where: { name: normalizedTagName },
      });

      if (!tag) {
        tag = await this.prismaClient.tag.create({
          data: {
            name: normalizedTagName,
            description: `Questions about ${normalizedTagName}`,
          },
        });
      }

      await this.prismaClient.postTag.create({
        data: {
          postId,
          tagId: tag.id,
        },
      });
    }
  }
}
