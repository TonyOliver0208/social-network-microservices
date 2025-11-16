import { Injectable, NotFoundException, ForbiddenException, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCommentDto, PaginationDto } from '../../dto';
import { EVENTS, CACHE_KEYS } from '@app/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PostViewService } from '../view/post-view.service';

@Injectable()
export class CommentLogicService {
  private readonly logger = new Logger(CommentLogicService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('POST_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly postViewService: PostViewService,
  ) {}

  async createComment(
    userId: string, 
    createCommentDto: CreateCommentDto & { postId?: string; answerId?: string }
  ) {
    // Verify parent exists (either post or answer)
    if (createCommentDto.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: createCommentDto.postId },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
    } else if (createCommentDto.answerId) {
      // @ts-expect-error - Prisma client regenerated but webpack cache not updated
      const answer = await this.prisma.answer.findUnique({
        where: { id: createCommentDto.answerId },
      });
      if (!answer) {
        throw new NotFoundException('Answer not found');
      }
    } else {
      throw new NotFoundException('Must provide either postId or answerId');
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
        postId: createCommentDto.postId,
        // @ts-expect-error - Prisma client regenerated but webpack cache not updated
        answerId: createCommentDto.answerId,
        authorId: userId,
        parentId: createCommentDto.parentId,
      },
    });

    // TODO: Implement comment event handler in notification service
    // this.rabbitClient.emit(EVENTS.COMMENT_CREATED, {
    //   commentId: comment.id,
    //   postId: createCommentDto.postId,
    //   answerId: createCommentDto.answerId,
    //   authorId: userId,
    //   content: comment.content,
    // });

    // Clear cache for the parent (question)
    if (createCommentDto.postId) {
      await this.cacheManager.del(CACHE_KEYS.POST(createCommentDto.postId));
      await this.cacheManager.del(`${CACHE_KEYS.POST(createCommentDto.postId)}:user:${userId}`);
    } else if (createCommentDto.answerId) {
      // For answer comments, we need to get the questionId
      // @ts-expect-error - Prisma client regenerated but webpack cache not updated
      const answer = await this.prisma.answer.findUnique({
        where: { id: createCommentDto.answerId },
      });
      if (answer) {
        await this.cacheManager.del(CACHE_KEYS.POST(answer.questionId));
        await this.cacheManager.del(`${CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);
      }
    }

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
          parentId: null,
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

    // Fetch all authors in parallel
    const authorIds = [...new Set(comments.map(c => c.authorId))];
    const authorsMap = new Map();
    
    await Promise.all(
      authorIds.map(async (authorId) => {
        const author = await this.postViewService.getUserData(authorId);
        authorsMap.set(authorId, author);
      })
    );

    const formattedComments = comments.map(comment => {
      const author = authorsMap.get(comment.authorId);
      return {
        id: comment.id,
        postId: comment.postId,
        userId: comment.authorId,
        authorName: author?.username || 'Unknown User',
        authorAvatar: author?.avatarUrl || '',
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
      };
    });

    this.logger.log(`[getPostComments] Returning ${formattedComments.length} comments:`, JSON.stringify(formattedComments, null, 2));

    return {
      comments: formattedComments,
      total,
    };
  }
}
