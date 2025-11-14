import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaginationDto } from '../../dto';
import type { Tag as PrismaTag, PrismaClient } from '../../../../../../node_modules/.prisma/client-post';
import type { PostResponse } from '../../../../../../generated/post';
import { PostViewService } from '../view/post-view.service';

type TagWithCount = PrismaTag & {
  _count: {
    postTags: number;
  };
};

@Injectable()
export class TagLogicService {
  private readonly logger = new Logger(TagLogicService.name);
  private readonly prismaClient: PrismaClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly viewService: PostViewService,
  ) {
    this.prismaClient = this.prisma as unknown as PrismaClient;
  }

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
      postTags.map(async (pt) => await this.viewService.formatPostResponse(pt.post))
    );

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async createTag(name: string, description?: string) {
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
}
