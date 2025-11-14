import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PostLogicService } from '../services/logic/post-logic.service';
import { TagLogicService } from '../services/logic/tag-logic.service';
import { POSTSERVICE_SERVICE_NAME } from '@app/proto/post';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class PostPublicController {
  private readonly logger = new Logger(PostPublicController.name);

  constructor(
    private readonly postLogic: PostLogicService,
    private readonly tagLogic: TagLogicService,
  ) {}

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetPostById')
  async getPost(data: { id: string; userId?: string }) {
    try {
      this.logger.log(`Getting post: ${data.id}`);
      return await this.postLogic.getPost(data.id, data.userId);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetFeed')
  async getFeed(data: { userId: string; page: number; limit: number }) {
    try {
      this.logger.log(`Getting feed for user: ${data.userId}`);
      const result = await this.postLogic.getFeed(data.userId, { page: data.page, limit: data.limit });
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
      return await this.postLogic.getUserPosts(data.userId, { page: data.page, limit: data.limit });
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetTags')
  async getTags(data: { page: number; limit: number }) {
    try {
      this.logger.log(`Getting tags: page ${data.page}, limit ${data.limit}`);
      return await this.tagLogic.getTags({ page: data.page, limit: data.limit });
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetPopularTags')
  async getPopularTags(data: { limit: number }) {
    try {
      this.logger.log(`Getting popular tags: limit ${data.limit}`);
      return await this.tagLogic.getPopularTags(data.limit || 5);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetPostsByTag')
  async getPostsByTag(data: { tagName: string; page: number; limit: number }) {
    try {
      this.logger.log(`Getting posts by tag: ${data.tagName}`);
      return await this.tagLogic.getPostsByTag(data.tagName, { 
        page: data.page, 
        limit: data.limit 
      });
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
