import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CACHE_KEYS } from '@app/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { PrismaClient } from '../../../../../../node_modules/.prisma/client-post';
import { PostViewService } from '../view/post-view.service';

@Injectable()
export class VoteLogicService {
  private readonly logger = new Logger(VoteLogicService.name);
  private readonly prismaClient: PrismaClient;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly viewService: PostViewService,
  ) {
    this.prismaClient = this.prisma as unknown as PrismaClient;
  }

  async voteQuestion(questionId: string, userId: string, voteType: string) {
    try {
      const post = await this.prismaClient.post.findUnique({
        where: { id: questionId },
      });

      if (!post) {
        throw new NotFoundException('Question not found');
      }

      const existingVote = await this.prismaClient.questionVote.findUnique({
        where: {
          postId_userId: {
            postId: questionId,
            userId,
          },
        },
      });

      const normalizedVoteType = voteType?.toUpperCase();

      if (existingVote && existingVote.voteType === normalizedVoteType) {
        await this.prismaClient.questionVote.delete({
          where: { id: existingVote.id },
        });
        
        await this.cacheManager.del(CACHE_KEYS.POST(questionId));
        
        return await this.getQuestionVotes(questionId, userId);
      }

      if (normalizedVoteType === 'UP' || normalizedVoteType === 'DOWN') {
        await this.prismaClient.questionVote.upsert({
          where: {
            postId_userId: {
              postId: questionId,
              userId,
            },
          },
          create: {
            postId: questionId,
            userId,
            voteType: normalizedVoteType as any,
          },
          update: {
            voteType: normalizedVoteType as any,
            updatedAt: new Date(),
          },
        });

        await this.cacheManager.del(CACHE_KEYS.POST(questionId));
        
        return await this.getQuestionVotes(questionId, userId);
      }

      throw new Error('Invalid vote type. Must be "up" or "down"');
    } catch (error) {
      this.logger.error(`Failed to vote on question ${questionId}:`, error);
      throw error;
    }
  }

  async getQuestionVotes(questionId: string, userId?: string) {
    try {
      const [upvotes, downvotes, userVote] = await Promise.all([
        this.prismaClient.questionVote.count({
          where: {
            postId: questionId,
            voteType: 'UP',
          },
        }),
        this.prismaClient.questionVote.count({
          where: {
            postId: questionId,
            voteType: 'DOWN',
          },
        }),
        userId
          ? this.prismaClient.questionVote.findUnique({
              where: {
                postId_userId: {
                  postId: questionId,
                  userId,
                },
              },
            })
          : null,
      ]);

      return {
        success: true,
        upvotes,
        downvotes,
        totalVotes: upvotes - downvotes,
        userVote: userVote ? userVote.voteType.toLowerCase() : null,
      };
    } catch (error) {
      this.logger.error(`Failed to get votes for question ${questionId}:`, error);
      throw error;
    }
  }

  async favoriteQuestion(questionId: string, userId: string, listName?: string) {
    try {
      const post = await this.prismaClient.post.findUnique({
        where: { id: questionId },
      });

      if (!post) {
        throw new NotFoundException('Question not found');
      }

      const effectiveListName = listName || 'default';

      const existingFavorite = await this.prismaClient.favoriteQuestion.findUnique({
        where: {
          postId_userId: {
            postId: questionId,
            userId,
          },
        },
      });

      if (existingFavorite) {
        await this.prismaClient.favoriteQuestion.delete({
          where: { id: existingFavorite.id },
        });
        
        await this.cacheManager.del(CACHE_KEYS.POST(questionId));
        
        return {
          success: true,
          isFavorited: false,
        };
      }

      await this.prismaClient.favoriteQuestion.create({
        data: {
          postId: questionId,
          userId,
          listName: effectiveListName,
        },
      });

      await this.cacheManager.del(CACHE_KEYS.POST(questionId));

      return {
        success: true,
        isFavorited: true,
      };
    } catch (error) {
      this.logger.error(`Failed to favorite question ${questionId}:`, error);
      throw error;
    }
  }

  async unfavoriteQuestion(questionId: string, userId: string) {
    try {
      const favorite = await this.prismaClient.favoriteQuestion.findUnique({
        where: {
          postId_userId: {
            postId: questionId,
            userId,
          },
        },
      });

      if (favorite) {
        await this.prismaClient.favoriteQuestion.delete({
          where: { id: favorite.id },
        });
        
        await this.cacheManager.del(CACHE_KEYS.POST(questionId));
      }

      return {
        success: true,
        isFavorited: false,
      };
    } catch (error) {
      this.logger.error(`Failed to unfavorite question ${questionId}:`, error);
      throw error;
    }
  }

  async getUserFavorites(userId: string, listName?: string, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (listName) {
        where.listName = listName;
      }

      const [favorites, total] = await Promise.all([
        this.prismaClient.favoriteQuestion.findMany({
          where,
          include: {
            post: {
              include: {
                _count: {
                  select: {
                    likes: true,
                    comments: true,
                    questionVotes: true,
                  },
                },
                postTags: {
                  include: {
                    tag: true,
                  },
                },
                questionVotes: {
                  where: { userId },
                },
                favoriteQuestions: {
                  where: { userId },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        this.prismaClient.favoriteQuestion.count({ where }),
      ]);

      const formattedFavorites = await Promise.all(
        favorites.map(async (favorite) => ({
          id: favorite.id,
          questionId: favorite.postId,
          listName: favorite.listName || 'default',
          createdAt: favorite.createdAt.toISOString(),
          question: await this.viewService.formatPostResponse(favorite.post as any),
        }))
      );

      return {
        favorites: formattedFavorites,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get favorites for user ${userId}:`, error);
      throw error;
    }
  }
}
