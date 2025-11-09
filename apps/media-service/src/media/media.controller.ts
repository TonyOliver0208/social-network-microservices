import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload, RpcException } from '@nestjs/microservices';
import { MediaService } from './media.service';
import { EVENTS, ServiceResponse } from '@app/common';
import { MEDIASERVICE_SERVICE_NAME } from '@app/proto/media';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  // ========== gRPC Methods (Gateway → Media Service) ==========

  @GrpcMethod(MEDIASERVICE_SERVICE_NAME, 'UploadMedia')
  async uploadMedia(payload: {
    userId: string;
    file: Uint8Array;
    filename: string;
    mimetype: string;
    type: string;
  }) {
    this.logger.log(`Upload media request from user: ${payload.userId}, file: ${payload.filename}`);
    
    // Convert Uint8Array to Buffer for processing
    const fileBuffer = Buffer.from(payload.file);
    const fileObject = {
      buffer: fileBuffer,
      originalname: payload.filename,
      mimetype: payload.mimetype,
      size: fileBuffer.length,
    };
    
    const result = await this.mediaService.uploadFile(payload.userId, fileObject);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode((result as any).error, (result as any).statusCode);
      throw new RpcException({
        code: grpcCode,
        message: (result as any).error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(MEDIASERVICE_SERVICE_NAME, 'DeleteMedia')
  async deleteMedia(payload: {
    id: string;
    userId: string;
  }) {
    this.logger.log(`Delete media request: ${payload.id} by user: ${payload.userId}`);
    const result = await this.mediaService.deleteFile(payload.id, payload.userId);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode((result as any).error, (result as any).statusCode);
      throw new RpcException({
        code: grpcCode,
        message: (result as any).error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(MEDIASERVICE_SERVICE_NAME, 'GetMedia')
  async findMediaById(payload: { id: string }) {
    this.logger.log(`Find media by ID: ${payload.id}`);
    const result = await this.mediaService.findById(payload.id);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode((result as any).error, (result as any).statusCode);
      throw new RpcException({
        code: grpcCode,
        message: (result as any).error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(MEDIASERVICE_SERVICE_NAME, 'GetUserMedia')
  async getUserMedia(payload: {
    userId: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    this.logger.log(`Get media for user: ${payload.userId}`);
    const result = await this.mediaService.getUserMedia(
      payload.userId,
      payload.type,
      payload.page,
      payload.limit,
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

  private getGrpcStatusCode(error?: string, httpStatusCode?: number): number {
    // Map common errors to gRPC status codes
    if (error?.includes('not found')) {
      return GrpcStatus.NOT_FOUND;
    }
    if (error?.includes('Unauthorized')) {
      return GrpcStatus.UNAUTHENTICATED;
    }
    if (error?.includes('forbidden') || error?.includes('permission') || error?.includes('only')) {
      return GrpcStatus.PERMISSION_DENIED;
    }
    if (error?.includes('invalid') || error?.includes('validation') || error?.includes('too large') || error?.includes('type not supported')) {
      return GrpcStatus.INVALID_ARGUMENT;
    }
    if (error?.includes('quota') || error?.includes('limit exceeded')) {
      return GrpcStatus.RESOURCE_EXHAUSTED;
    }
    
    // Map HTTP status codes to gRPC codes
    switch (httpStatusCode) {
      case 404:
        return GrpcStatus.NOT_FOUND;
      case 401:
        return GrpcStatus.UNAUTHENTICATED;
      case 403:
        return GrpcStatus.PERMISSION_DENIED;
      case 400:
        return GrpcStatus.INVALID_ARGUMENT;
      case 429:
        return GrpcStatus.RESOURCE_EXHAUSTED;
      default:
        return GrpcStatus.UNKNOWN;
    }
  }

  // ========== RabbitMQ Event Handlers (Service → Service) ==========

  @EventPattern(EVENTS.USER_DELETED)
  async handleUserDeleted(@Payload() data: { userId: string }) {
    this.logger.log(`Handling user deleted event for media: ${data.userId}`);
    // Delete all media uploaded by this user
    await this.mediaService.deleteUserMedia(data.userId);
  }

  @EventPattern(EVENTS.POST_DELETED)
  async handlePostDeleted(@Payload() data: { postId: string; mediaUrls?: string[] }) {
    this.logger.log(`Handling post deleted event: ${data.postId}`);
    // Clean up orphaned media if needed
    if (data.mediaUrls && data.mediaUrls.length > 0) {
      // await this.mediaService.cleanupOrphanedMedia(data.mediaUrls);
    }
  }

  @EventPattern(EVENTS.POST_CREATED)
  async handlePostCreated(@Payload() data: { postId: string; mediaIds: string[] }) {
    this.logger.log(`Handling post created event with media: ${data.postId}`);
    // Link media to post for reference tracking
  }
}
