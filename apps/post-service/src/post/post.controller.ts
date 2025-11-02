import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload, RpcException } from '@nestjs/microservices';
import { PostService } from './post.service';
import { EVENTS } from '@app/common';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, PaginationDto } from './dto';
import { POSTSERVICE_SERVICE_NAME } from '@app/proto/post';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(private readonly postService: PostService) {}

  // ========== gRPC Methods (Gateway → Post Service) ==========

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'CreatePost')
  async createPost(data: { userId: string; content: string; mediaUrls?: string[]; visibility?: string }) {
    try {
      this.logger.log(`Creating post for user: ${data.userId}`);
      const createPostDto: CreatePostDto = {
        content: data.content,
        mediaUrls: data.mediaUrls,
        privacy: data.visibility as any,
      };
      return await this.postService.createPost(data.userId, createPostDto);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetPostById')
  async getPost(data: { id: string; userId?: string }) {
    try {
      this.logger.log(`Getting post: ${data.id}`);
      return await this.postService.getPost(data.id, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'UpdatePost')
  async updatePost(data: { id: string; userId: string; updatePostDto: UpdatePostDto }) {
    try {
      this.logger.log(`Updating post: ${data.id} by user: ${data.userId}`);
      return await this.postService.updatePost(data.id, data.userId, data.updatePostDto);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'DeletePost')
  async deletePost(data: { id: string; userId: string }) {
    try {
      this.logger.log(`Deleting post: ${data.id} by user: ${data.userId}`);
      return await this.postService.deletePost(data.id, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetFeed')
  async getFeed(data: { userId: string; page: number; limit: number }) {
    try {
      this.logger.log(`Getting feed for user: ${data.userId}`);
      const result = await this.postService.getFeed(data.userId, { page: data.page, limit: data.limit });
      this.logger.log(`Feed result:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      this.logger.error(`Error: ${error.message}`, error.stack);
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetUserPosts')
  async getUserPosts(data: { userId: string; page: number; limit: number }) {
    try {
      this.logger.log(`Getting posts for user: ${data.userId}`);
      return await this.postService.getUserPosts(data.userId, { page: data.page, limit: data.limit });
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'LikePost')
  async likePost(data: { postId: string; userId: string }) {
    try {
      this.logger.log(`User ${data.userId} liking post: ${data.postId}`);
      return await this.postService.likePost(data.postId, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'UnlikePost')
  async unlikePost(data: { postId: string; userId: string }) {
    try {
      this.logger.log(`User ${data.userId} unliking post: ${data.postId}`);
      return await this.postService.unlikePost(data.postId, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetPostLikes')
  async getPostLikes(data: { postId: string; page: number; limit: number }) {
    try {
      this.logger.log(`Getting likes for post: ${data.postId}`);
      return await this.postService.getPostLikes(data.postId, { page: data.page, limit: data.limit });
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'CreateComment')
  async createComment(data: { postId: string; userId: string; createCommentDto: CreateCommentDto }) {
    try {
      this.logger.log(`User ${data.userId} commenting on post: ${data.postId}`);
      return await this.postService.createComment(data.postId, data.userId, data.createCommentDto);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'UpdateComment')
  async updateComment(data: { commentId: string; userId: string; content: string }) {
    try {
      this.logger.log(`Updating comment: ${data.commentId}`);
      return await this.postService.updateComment(data.commentId, data.userId, data.content);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'DeleteComment')
  async deleteComment(data: { commentId: string; userId: string }) {
    try {
      this.logger.log(`Deleting comment: ${data.commentId}`);
      return await this.postService.deleteComment(data.commentId, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetComments')
  async getPostComments(data: { postId: string; page: number; limit: number }) {
    try {
      this.logger.log(`Getting comments for post: ${data.postId}`);
      return await this.postService.getPostComments(data.postId, { page: data.page, limit: data.limit });
    } catch (error) {
      throw this.handleException(error);
    }
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
    // Map common errors to gRPC status codes
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
    
    // Map HTTP status codes to gRPC codes
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

  // ========== RabbitMQ Event Handlers (Service → Service) ==========

  @EventPattern(EVENTS.USER_DELETED)
  async handleUserDeleted(@Payload() data: { userId: string }) {
    this.logger.log(`Handling user deleted event: ${data.userId}`);
    // Delete all posts by this user
    await this.postService.handleUserDeleted(data.userId);
  }

  @EventPattern(EVENTS.MEDIA_DELETED)
  async handleMediaDeleted(@Payload() data: { mediaId: string; postId?: string }) {
    this.logger.log(`Handling media deleted event: ${data.mediaId}`);
    // Remove media reference from post if applicable
    if (data.postId) {
      // await this.postService.removeMediaFromPost(data.postId, data.mediaId);
    }
  }

  @EventPattern(EVENTS.USER_FOLLOWED)
  async handleUserFollowed(@Payload() data: { followerId: string; followingId: string }) {
    this.logger.log(`User ${data.followerId} followed ${data.followingId}`);
    // Update feed cache, send notification, etc.
  }
}
