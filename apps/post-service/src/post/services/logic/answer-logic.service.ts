import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../../../prisma/prisma.service';
import { EVENTS, CACHE_KEYS } from '@app/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PostViewService } from '../view/post-view.service';

@Injectable()
export class AnswerLogicService {
  private readonly logger = new Logger(AnswerLogicService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('POST_SERVICE') private readonly rabbitClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly postViewService: PostViewService,
  ) {}

  async createAnswer(questionId: string, userId: string, content: string) {
    // Verify the question exists
    const question = await this.prisma.post.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Create the answer
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const answer = await this.prisma.answer.create({
      data: {
        content,
        questionId,
        authorId: userId,
      },
    });

    // Emit event for notifications
    this.rabbitClient.emit(EVENTS.COMMENT_CREATED, {
      answerId: answer.id,
      questionId,
      authorId: userId,
      content: answer.content,
    });

    // Clear cache for the question and user-specific cache
    await this.cacheManager.del(CACHE_KEYS.POST(questionId));
    await this.cacheManager.del(`${CACHE_KEYS.POST(questionId)}:user:${userId}`);

    return answer;
  }

  async updateAnswer(answerId: string, userId: string, content: string) {
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (answer.authorId !== userId) {
      throw new ForbiddenException('You can only update your own answers');
    }

    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const updatedAnswer = await this.prisma.answer.update({
      where: { id: answerId },
      data: { content },
    });

    // Clear cache for the question
    await this.cacheManager.del(CACHE_KEYS.POST(answer.questionId));
    await this.cacheManager.del(`${CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);

    return updatedAnswer;
  }

  async deleteAnswer(answerId: string, userId: string) {
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: { question: true },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    // Allow deletion by answer author or question author
    if (answer.authorId !== userId && answer.question.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own answers or answers to your questions');
    }

    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    await this.prisma.answer.delete({
      where: { id: answerId },
    });

    // Clear cache
    await this.cacheManager.del(CACHE_KEYS.POST(answer.questionId));
    await this.cacheManager.del(`${CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);

    return { message: 'Answer deleted successfully' };
  }

  async acceptAnswer(answerId: string, userId: string) {
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: { question: true },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    // Only the question author can accept answers
    if (answer.question.authorId !== userId) {
      throw new ForbiddenException('Only the question author can accept answers');
    }

    // Check if there's already an accepted answer
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const existingAccepted = await this.prisma.answer.findFirst({
      where: {
        questionId: answer.questionId,
        isAccepted: true,
      },
    });

    // If toggling the same answer, unaccept it
    if (existingAccepted && existingAccepted.id === answerId) {
      // @ts-expect-error - Prisma client regenerated but webpack cache not updated
      await this.prisma.answer.update({
        where: { id: answerId },
        data: { isAccepted: false },
      });

      // Clear cache
      await this.cacheManager.del(CACHE_KEYS.POST(answer.questionId));
      await this.cacheManager.del(`${CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);

      return { message: 'Answer unaccepted', isAccepted: false };
    }

    // Unaccept the previous answer if it exists
    if (existingAccepted) {
      // @ts-expect-error - Prisma client regenerated but webpack cache not updated
      await this.prisma.answer.update({
        where: { id: existingAccepted.id },
        data: { isAccepted: false },
      });
    }

    // Accept the new answer
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    await this.prisma.answer.update({
      where: { id: answerId },
      data: { isAccepted: true },
    });

    // Emit event for reputation update
    this.rabbitClient.emit(EVENTS.COMMENT_CREATED, {
      answerId,
      questionId: answer.questionId,
      authorId: answer.authorId,
      isAccepted: true,
    });

    // Clear cache
    await this.cacheManager.del(CACHE_KEYS.POST(answer.questionId));
    await this.cacheManager.del(`${CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);

    return { message: 'Answer accepted', isAccepted: true };
  }

  async voteAnswer(answerId: string, userId: string, voteType: string) {
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    // Cannot vote on your own answer
    if (answer.authorId === userId) {
      throw new BadRequestException('You cannot vote on your own answer');
    }

    // Normalize vote type to uppercase
    const normalizedVoteType = voteType.toUpperCase() as 'UP' | 'DOWN';
    if (normalizedVoteType !== 'UP' && normalizedVoteType !== 'DOWN') {
      throw new BadRequestException('Invalid vote type. Must be "up" or "down"');
    }

    // Check if user already voted
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const existingVote = await this.prisma.answerVote.findUnique({
      where: {
        answerId_userId: {
          answerId,
          userId,
        },
      },
    });

    if (existingVote) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote.voteType === normalizedVoteType) {
        // @ts-expect-error - Prisma client regenerated but webpack cache not updated
        await this.prisma.answerVote.delete({
          where: { id: existingVote.id },
        });

        // Clear cache
        await this.cacheManager.del(CACHE_KEYS.POST(answer.questionId));
        await this.cacheManager.del(`${CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);

        return { message: 'Vote removed', voteType: null };
      }

      // If different vote type, update the vote
      // @ts-expect-error - Prisma client regenerated but webpack cache not updated
      await this.prisma.answerVote.update({
        where: { id: existingVote.id },
        data: { voteType: normalizedVoteType },
      });

      // Clear cache
      await this.cacheManager.del(CACHE_KEYS.POST(answer.questionId));
      await this.cacheManager.del(`${CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);

      return { message: 'Vote updated', voteType: normalizedVoteType };
    }

    // Create new vote
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    await this.prisma.answerVote.create({
      data: {
        answerId,
        userId,
        voteType: normalizedVoteType,
      },
    });

    // Emit event for reputation update
    this.rabbitClient.emit(EVENTS.COMMENT_CREATED, {
      answerId,
      questionId: answer.questionId,
      authorId: answer.authorId,
      voteType: normalizedVoteType,
    });

    // Clear cache
    await this.cacheManager.del(CACHE_KEYS.POST(answer.questionId));
    await this.cacheManager.del(`${CACHE_KEYS.POST(answer.questionId)}:user:${userId}`);

    return { message: 'Vote recorded', voteType: normalizedVoteType };
  }

  async getAnswerVotes(answerId: string, userId?: string) {
    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        votes: true,
      },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    const upvotes = answer.votes.filter((v) => v.voteType === 'UP').length;
    const downvotes = answer.votes.filter((v) => v.voteType === 'DOWN').length;
    const totalVotes = upvotes - downvotes;

    let userVote: 'up' | 'down' | null = null;
    if (userId) {
      const vote = answer.votes.find((v) => v.userId === userId);
      if (vote) {
        userVote = vote.voteType === 'UP' ? 'up' : 'down';
      }
    }

    return {
      answerId,
      totalVotes,
      upvotes,
      downvotes,
      userVote,
    };
  }

  async getQuestionAnswers(questionId: string, userId?: string) {
    const question = await this.prisma.post.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // @ts-expect-error - Prisma client regenerated but webpack cache not updated
    const answers = await this.prisma.answer.findMany({
      where: { questionId },
      include: {
        votes: true,
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: [
        { isAccepted: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Fetch all authors (answers and comments) in parallel
    const answerAuthorIds = answers.map(a => a.authorId);
    const commentAuthorIds = answers.flatMap(a => a.comments.map((c: any) => c.authorId));
    const allAuthorIds = [...new Set([...answerAuthorIds, ...commentAuthorIds])];
    const authorsMap = new Map();
    
    await Promise.all(
      allAuthorIds.map(async (authorId: string) => {
        const author = await this.postViewService.getUserData(authorId);
        authorsMap.set(authorId, author);
      })
    );

    return answers.map((answer) => {
      const upvotes = answer.votes.filter((v) => v.voteType === 'UP').length;
      const downvotes = answer.votes.filter((v) => v.voteType === 'DOWN').length;
      const totalVotes = upvotes - downvotes;

      let userVote: 'up' | 'down' | null = null;
      if (userId) {
        const vote = answer.votes.find((v) => v.userId === userId);
        if (vote) {
          userVote = vote.voteType === 'UP' ? 'up' : 'down';
        }
      }

      const author = authorsMap.get(answer.authorId);

      // Map comments with author data
      const comments = answer.comments.map((comment: any) => {
        const commentAuthor = authorsMap.get(comment.authorId);
        return {
          id: comment.id,
          content: comment.content,
          userId: comment.authorId,
          authorName: commentAuthor?.username || 'Unknown User',
          authorAvatar: commentAuthor?.avatarUrl || '',
          createdAt: comment.createdAt.toISOString(),
        };
      });

      return {
        id: answer.id,
        content: answer.content,
        authorId: answer.authorId,
        authorName: author?.username || 'Unknown User',
        authorAvatar: author?.avatarUrl || '',
        questionId: answer.questionId,
        isAccepted: answer.isAccepted,
        totalVotes,
        upvotes,
        downvotes,
        userVote,
        comments,
        commentCount: answer._count.comments,
        createdAt: answer.createdAt.toISOString(),
        updatedAt: answer.updatedAt.toISOString(),
      };
    });
  }
}
