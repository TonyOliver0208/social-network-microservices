import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaginationDto } from '../../dto';
import { EVENTS, CACHE_KEYS } from '@app/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class LikeLogicService {
  private readonly logger = new Logger(LikeLogicService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('POST_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

    this.rabbitClient.emit(EVENTS.POST_LIKED, {
      postId,
      userId,
      authorId: post.authorId,
    });

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
}
