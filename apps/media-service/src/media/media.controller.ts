import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload } from '@nestjs/microservices';
import { MediaService } from './media.service';
import { EVENTS, ServiceResponse } from '@app/common';
import { MEDIASERVICE_SERVICE_NAME } from 'generated/media';

@Controller()
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  // ========== gRPC Methods (Gateway → Media Service) ==========

  @GrpcMethod(MEDIASERVICE_SERVICE_NAME, 'UploadMedia')
  async uploadMedia(payload: {
    userId: string;
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    };
  }): Promise<ServiceResponse> {
    this.logger.log(`Upload media request from user: ${payload.userId}`);
    return this.mediaService.uploadFile(payload.userId, payload.file);
  }

  @GrpcMethod(MEDIASERVICE_SERVICE_NAME, 'DeleteMedia')
  async deleteMedia(payload: {
    mediaId: string;
    userId: string;
  }): Promise<ServiceResponse> {
    this.logger.log(`Delete media request: ${payload.mediaId} by user: ${payload.userId}`);
    return this.mediaService.deleteFile(payload.mediaId, payload.userId);
  }

  @GrpcMethod(MEDIASERVICE_SERVICE_NAME, 'GetMedia')
  async findMediaById(payload: { mediaId: string }): Promise<ServiceResponse> {
    this.logger.log(`Find media by ID: ${payload.mediaId}`);
    return this.mediaService.findById(payload.mediaId);
  }

  @GrpcMethod(MEDIASERVICE_SERVICE_NAME, 'GetUserMedia')
  async getUserMedia(payload: {
    userId: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse> {
    this.logger.log(`Get media for user: ${payload.userId}`);
    return this.mediaService.getUserMedia(
      payload.userId,
      payload.type,
      payload.page,
      payload.limit,
    );
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
