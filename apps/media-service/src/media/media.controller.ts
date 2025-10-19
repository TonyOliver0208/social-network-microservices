import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { MediaService } from './media.service';
import { MESSAGES, EVENTS, ServiceResponse } from '@app/common';

@Controller()
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern(MESSAGES.MEDIA_UPLOAD)
  async uploadMedia(@Payload() payload: {
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

  @MessagePattern(MESSAGES.MEDIA_DELETE)
  async deleteMedia(@Payload() payload: {
    mediaId: string;
    userId: string;
  }): Promise<ServiceResponse> {
    this.logger.log(`Delete media request: ${payload.mediaId} by user: ${payload.userId}`);
    return this.mediaService.deleteFile(payload.mediaId, payload.userId);
  }

  @MessagePattern(MESSAGES.MEDIA_FIND_BY_ID)
  async findMediaById(@Payload() payload: { mediaId: string }): Promise<ServiceResponse> {
    this.logger.log(`Find media by ID: ${payload.mediaId}`);
    return this.mediaService.findById(payload.mediaId);
  }

  @MessagePattern(MESSAGES.MEDIA_GET_USER_MEDIA)
  async getUserMedia(@Payload() payload: {
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

  @EventPattern(EVENTS.USER_DELETED)
  async handleUserDeleted(@Payload() data: { userId: string }) {
    this.logger.log(`Handling user deleted event for media: ${data.userId}`);
    await this.mediaService.deleteUserMedia(data.userId);
  }

  @EventPattern(EVENTS.POST_DELETED)
  async handlePostDeleted(@Payload() data: { postId: string; mediaUrls: string[] }) {
    this.logger.log(`Handling post deleted event: ${data.postId}`);
    // Clean up orphaned media if needed
  }
}
