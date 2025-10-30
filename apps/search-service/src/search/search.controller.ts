import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload, RpcException } from '@nestjs/microservices';
import { SearchService } from './search.service';
import { EVENTS, ServiceResponse } from '@app/common';
import { SearchQueryDto, IndexPostDto, IndexUserDto } from './dto';
import { SEARCHSERVICE_SERVICE_NAME } from '@app/proto/search';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  // ========== gRPC Methods (Gateway → Search Service) ==========

  @GrpcMethod(SEARCHSERVICE_SERVICE_NAME, 'SearchPosts')
  async searchPosts(payload: SearchQueryDto) {
    this.logger.log(`Search posts request: ${payload.query}`);
    const result = await this.searchService.searchPosts(
      payload.query,
      payload.page,
      payload.limit,
      payload.privacy,
    );
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode((result as any).error, (result as any).statusCode);
      throw new RpcException({
        code: grpcCode,
        message: (result as any).error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(SEARCHSERVICE_SERVICE_NAME, 'SearchUsers')
  async searchUsers(payload: SearchQueryDto) {
    this.logger.log(`Search users request: ${payload.query}`);
    const result = await this.searchService.searchUsers(payload.query, payload.page, payload.limit);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode((result as any).error, (result as any).statusCode);
      throw new RpcException({
        code: grpcCode,
        message: (result as any).error,
      });
    }
    
    return result.data;
  }

  private getGrpcStatusCode(error?: string, httpStatusCode?: number): number {
    // Map common errors to gRPC status codes
    if (error?.includes('not found')) {
      return GrpcStatus.NOT_FOUND;
    }
    if (error?.includes('invalid') || error?.includes('validation') || error?.includes('query too short')) {
      return GrpcStatus.INVALID_ARGUMENT;
    }
    if (error?.includes('timeout') || error?.includes('deadline')) {
      return GrpcStatus.DEADLINE_EXCEEDED;
    }
    
    // Map HTTP status codes to gRPC codes
    switch (httpStatusCode) {
      case 404:
        return GrpcStatus.NOT_FOUND;
      case 400:
        return GrpcStatus.INVALID_ARGUMENT;
      case 408:
      case 504:
        return GrpcStatus.DEADLINE_EXCEEDED;
      default:
        return GrpcStatus.UNKNOWN;
    }
  }

  // ========== RabbitMQ Event Handlers (Service → Service) ==========
  // Search service primarily listens to events to keep index up-to-date

  @EventPattern(EVENTS.POST_CREATED)
  async handlePostCreated(@Payload() data: IndexPostDto) {
    this.logger.log(`Indexing new post: ${data.postId}`);
    await this.searchService.indexPost(data);
  }

  @EventPattern(EVENTS.POST_UPDATED)
  async handlePostUpdated(@Payload() data: IndexPostDto) {
    this.logger.log(`Updating post index: ${data.postId}`);
    await this.searchService.updatePostIndex(data.postId, data);
  }

  @EventPattern(EVENTS.POST_DELETED)
  async handlePostDeleted(@Payload() data: { postId: string }) {
    this.logger.log(`Removing post from index: ${data.postId}`);
    await this.searchService.removePostFromIndex(data.postId);
  }

  @EventPattern(EVENTS.USER_REGISTERED)
  async handleUserRegistered(@Payload() data: IndexUserDto) {
    this.logger.log(`Indexing new user: ${data.userId}`);
    await this.searchService.indexUser(data);
  }

  @EventPattern(EVENTS.USER_UPDATED)
  async handleUserUpdated(@Payload() data: IndexUserDto) {
    this.logger.log(`Updating user index: ${data.userId}`);
    await this.searchService.updateUserIndex(data.userId, data);
  }

  @EventPattern(EVENTS.USER_DELETED)
  async handleUserDeleted(@Payload() data: { userId: string }) {
    this.logger.log(`Removing user from index: ${data.userId}`);
    await this.searchService.removeUserFromIndex(data.userId);
  }

  @EventPattern(EVENTS.COMMENT_CREATED)
  async handleCommentCreated(@Payload() data: { postId: string; commentId: string; content: string }) {
    this.logger.log(`Updating post index after comment: ${data.postId}`);
    // Update post's comment count in search index
  }

  @EventPattern(EVENTS.POST_LIKED)
  async handlePostLiked(@Payload() data: { postId: string; userId: string }) {
    this.logger.log(`Updating post index after like: ${data.postId}`);
    // Update post's like count for ranking
  }
}
