import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload, RpcException } from '@nestjs/microservices';
import { PostLogicService } from '../services/logic/post-logic.service';
import { LikeLogicService } from '../services/logic/like-logic.service';
import { CommentLogicService } from '../services/logic/comment-logic.service';
import { TagLogicService } from '../services/logic/tag-logic.service';
import { VoteLogicService } from '../services/logic/vote-logic.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from '../dto';
import { EVENTS } from '@app/common';
import { POSTSERVICE_SERVICE_NAME } from '@app/proto/post';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class PostProtectedController {
  private readonly logger = new Logger(PostProtectedController.name);

  constructor(
    private readonly postLogic: PostLogicService,
    private readonly likeLogic: LikeLogicService,
    private readonly commentLogic: CommentLogicService,
    private readonly tagLogic: TagLogicService,
    private readonly voteLogic: VoteLogicService,
  ) {}

  // ========== Post Operations ==========

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'CreatePost')
  async createPost(data: { userId: string; content: string; mediaUrls?: string[]; visibility?: string; tags?: string[] }) {
    try {
      this.logger.log(`Creating post for user: ${data.userId} with tags:`, data.tags);
      const createPostDto: CreatePostDto = {
        content: data.content,
        mediaUrls: data.mediaUrls,
        privacy: data.visibility as any,
        tags: data.tags,
      };
      return await this.postLogic.createPost(data.userId, createPostDto);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'UpdatePost')
  async updatePost(data: { id: string; userId: string; updatePostDto: UpdatePostDto }) {
    try {
      this.logger.log(`Updating post: ${data.id} by user: ${data.userId}`);
      return await this.postLogic.updatePost(data.id, data.userId, data.updatePostDto);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'DeletePost')
  async deletePost(data: { id: string; userId: string }) {
    try {
      this.logger.log(`Deleting post: ${data.id} by user: ${data.userId}`);
      return await this.postLogic.deletePost(data.id, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  // ========== Like Operations ==========

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'LikePost')
  async likePost(data: { postId: string; userId: string }) {
    try {
      this.logger.log(`User ${data.userId} liking post: ${data.postId}`);
      return await this.likeLogic.likePost(data.postId, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'UnlikePost')
  async unlikePost(data: { postId: string; userId: string }) {
    try {
      this.logger.log(`User ${data.userId} unliking post: ${data.postId}`);
      return await this.likeLogic.unlikePost(data.postId, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetPostLikes')
  async getPostLikes(data: { postId: string; page: number; limit: number }) {
    try {
      this.logger.log(`Getting likes for post: ${data.postId}`);
      return await this.likeLogic.getPostLikes(data.postId, { page: data.page, limit: data.limit });
    } catch (error) {
      throw this.handleException(error);
    }
  }

  // ========== Comment Operations ==========

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'CreateComment')
  async createComment(data: { postId: string; userId: string; createCommentDto: CreateCommentDto }) {
    try {
      this.logger.log(`User ${data.userId} commenting on post: ${data.postId}`);
      return await this.commentLogic.createComment(data.postId, data.userId, data.createCommentDto);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'UpdateComment')
  async updateComment(data: { commentId: string; userId: string; content: string }) {
    try {
      this.logger.log(`Updating comment: ${data.commentId}`);
      return await this.commentLogic.updateComment(data.commentId, data.userId, data.content);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'DeleteComment')
  async deleteComment(data: { commentId: string; userId: string }) {
    try {
      this.logger.log(`Deleting comment: ${data.commentId}`);
      return await this.commentLogic.deleteComment(data.commentId, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetComments')
  async getPostComments(data: { postId: string; page: number; limit: number }) {
    try {
      this.logger.log(`Getting comments for post: ${data.postId}`);
      return await this.commentLogic.getPostComments(data.postId, { page: data.page, limit: data.limit });
    } catch (error) {
      throw this.handleException(error);
    }
  }

  // ========== Tag Operations ==========

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'CreateTag')
  async createTag(data: { name: string; description?: string }) {
    try {
      this.logger.log(`Creating tag: ${data.name}`);
      return await this.tagLogic.createTag(data.name, data.description);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  // ========== Voting Operations ==========

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'VoteQuestion')
  async voteQuestion(data: { questionId: string; userId: string; voteType: string }) {
    try {
      this.logger.log(`User ${data.userId} voting ${data.voteType} on question ${data.questionId}`);
      return await this.voteLogic.voteQuestion(data.questionId, data.userId, data.voteType);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetQuestionVotes')
  async getQuestionVotes(data: { questionId: string; userId?: string }) {
    try {
      this.logger.log(`Getting votes for question ${data.questionId}`);
      return await this.voteLogic.getQuestionVotes(data.questionId, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  // ========== Favorite Operations ==========

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'FavoriteQuestion')
  async favoriteQuestion(data: { questionId: string; userId: string; listName?: string }) {
    try {
      this.logger.log(`User ${data.userId} favoriting question ${data.questionId}`);
      return await this.voteLogic.favoriteQuestion(data.questionId, data.userId, data.listName);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'UnfavoriteQuestion')
  async unfavoriteQuestion(data: { questionId: string; userId: string }) {
    try {
      this.logger.log(`User ${data.userId} unfavoriting question ${data.questionId}`);
      return await this.voteLogic.unfavoriteQuestion(data.questionId, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetUserFavorites')
  async getUserFavorites(data: { userId: string; listName?: string; page: number; limit: number }) {
    try {
      this.logger.log(`Getting favorites for user ${data.userId}`);
      return await this.voteLogic.getUserFavorites(
        data.userId,
        data.listName,
        data.page || 1,
        data.limit || 20
      );
    } catch (error) {
      throw this.handleException(error);
    }
  }

  // ========== Event Handlers ==========

  @EventPattern(EVENTS.USER_DELETED)
  async handleUserDeletedEvent(@Payload() data: { userId: string }) {
    this.logger.log(`[Event] User deleted: ${data.userId}`);
    await this.postLogic.handleUserDeleted(data.userId);
  }

  @EventPattern(EVENTS.MEDIA_DELETED)
  async handleMediaDeleted(@Payload() data: { mediaId: string; postId?: string }) {
    this.logger.log(`Handling media deleted event: ${data.mediaId}`);
    // Implement if needed
  }

  @EventPattern(EVENTS.USER_FOLLOWED)
  async handleUserFollowed(@Payload() data: { followerId: string; followingId: string }) {
    this.logger.log(`User ${data.followerId} followed ${data.followingId}`);
    // Implement if needed
  }

  private handleException(error: any): RpcException {
    const errorMessage = error.message || 'Internal server error';
    const grpcCode = this.getGrpcStatusCode(errorMessage, error.status);
    
    this.logger.error(`Error: ${errorMessage}`, error.stack);
    
    return new RpcException({
      code: grpcCode,
      message: errorMessage,
    });
  }

  private getGrpcStatusCode(error?: string, httpStatusCode?: number): number {
    if (error?.includes('already exists') || error?.includes('duplicate') || error?.includes('already liked')) {
      return GrpcStatus.ALREADY_EXISTS;
    }
    if (error?.includes('not found') || error?.includes('does not exist')) {
      return GrpcStatus.NOT_FOUND;
    }
    if (error?.includes('Unauthorized')) {
      return GrpcStatus.UNAUTHENTICATED;
    }
    if (error?.includes('Forbidden') || error?.includes('only') || error?.includes('cannot')) {
      return GrpcStatus.PERMISSION_DENIED;
    }
    if (error?.includes('invalid') || error?.includes('validation') || error?.includes('required')) {
      return GrpcStatus.INVALID_ARGUMENT;
    }
    
    switch (httpStatusCode) {
      case 409:
        return GrpcStatus.ALREADY_EXISTS;
      case 404:
        return GrpcStatus.NOT_FOUND;
      case 401:
        return GrpcStatus.UNAUTHENTICATED;
      case 403:
        return GrpcStatus.PERMISSION_DENIED;
      case 400:
        return GrpcStatus.INVALID_ARGUMENT;
      default:
        return GrpcStatus.UNKNOWN;
    }
  }
}
