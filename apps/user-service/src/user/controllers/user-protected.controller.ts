import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload, RpcException } from '@nestjs/microservices';
import { ProfileLogicService } from '../services/logic/profile-logic.service';
import { FollowLogicService } from '../services/logic/follow-logic.service';
import { UpdateProfileDto, FollowUserDto } from '../dto';
import { EVENTS } from '@app/common';
import { USERSERVICE_SERVICE_NAME } from '@app/proto/user';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class UserProtectedController {
  private readonly logger = new Logger(UserProtectedController.name);

  constructor(
    private readonly profileLogic: ProfileLogicService,
    private readonly followLogic: FollowLogicService,
  ) {}

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'UpdateProfile')
  async updateProfile(payload: { userId: string; data: UpdateProfileDto }) {
    this.logger.log(`Updating profile for user: ${payload.userId}`);
    const result = await this.profileLogic.updateProfile(payload.userId, payload.data);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'FollowUser')
  async followUser(payload: FollowUserDto) {
    this.logger.log(`User ${payload.followerId} following ${payload.followingId}`);
    const result = await this.followLogic.followUser(payload.followerId, payload.followingId);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'UnfollowUser')
  async unfollowUser(payload: FollowUserDto) {
    this.logger.log(`User ${payload.followerId} unfollowing ${payload.followingId}`);
    const result = await this.followLogic.unfollowUser(payload.followerId, payload.followingId);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return result.data;
  }

  @EventPattern(EVENTS.USER_REGISTERED)
  async handleUserRegistered(@Payload() data: { userId: string; email: string; username: string }) {
    this.logger.log(`Creating profile for registered user: ${data.userId}`);
    await this.profileLogic.createUserProfile(data.userId, data.email, data.username);
  }

  @EventPattern(EVENTS.POST_CREATED)
  async handlePostCreated(@Payload() data: { postId: string; userId: string }) {
    this.logger.log(`Handling post created event by user: ${data.userId}`);
    // Increment user's post count, update stats, etc.
  }

  @EventPattern(EVENTS.POST_DELETED)
  async handlePostDeleted(@Payload() data: { postId: string; userId: string }) {
    this.logger.log(`Handling post deleted event by user: ${data.userId}`);
    // Decrement user's post count
  }

  private getGrpcStatusCode(error?: string, httpStatusCode?: number): number {
    if (error?.includes('not found')) {
      return GrpcStatus.NOT_FOUND;
    }
    if (error?.includes('already exists')) {
      return GrpcStatus.ALREADY_EXISTS;
    }
    if (error?.includes('invalid') || error?.includes('Cannot')) {
      return GrpcStatus.INVALID_ARGUMENT;
    }
    
    switch (httpStatusCode) {
      case 404:
        return GrpcStatus.NOT_FOUND;
      case 400:
        return GrpcStatus.INVALID_ARGUMENT;
      default:
        return GrpcStatus.UNKNOWN;
    }
  }
}
