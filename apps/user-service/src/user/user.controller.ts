import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload, RpcException } from '@nestjs/microservices';
import { UserService } from './user.service';
import { EVENTS, ServiceResponse } from '@app/common';
import { 
  UpdateProfileDto, 
  FollowUserDto, 
  GetUserDto 
} from './dto';
import { USERSERVICE_SERVICE_NAME } from '@app/proto/user';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  // ========== gRPC Methods (Gateway → User Service) ==========

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetProfile')
  async getProfile(payload: GetUserDto) {
    this.logger.log(`Getting profile for user: ${payload.userId}`);
    const result = await this.userService.getProfile(payload.userId);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'UpdateProfile')
  async updateProfile(payload: { userId: string; data: UpdateProfileDto }) {
    this.logger.log(`Updating profile for user: ${payload.userId}`);
    const result = await this.userService.updateProfile(payload.userId, payload.data);
    
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
    const result = await this.userService.followUser(payload.followerId, payload.followingId);
    
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
    const result = await this.userService.unfollowUser(payload.followerId, payload.followingId);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetFollowers')
  async getFollowers(payload: { userId: string; page?: number; limit?: number }) {
    this.logger.log(`Getting followers for user: ${payload.userId}`);
    const result = await this.userService.getFollowers(payload.userId, payload.page, payload.limit);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode((result as any).error, (result as any).statusCode);
      throw new RpcException({
        code: grpcCode,
        message: (result as any).error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetFollowing')
  async getFollowing(payload: { userId: string; page?: number; limit?: number }) {
    this.logger.log(`Getting following for user: ${payload.userId}`);
    const result = await this.userService.getFollowing(payload.userId, payload.page, payload.limit);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode((result as any).error, (result as any).statusCode);
      throw new RpcException({
        code: grpcCode,
        message: (result as any).error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'SearchUsers')
  async searchUsers(payload: { query: string; page?: number; limit?: number }) {
    this.logger.log(`Searching users with query: ${payload.query}`);
    const result = await this.userService.searchUsers(payload.query, payload.page, payload.limit);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode((result as any).error, (result as any).statusCode);
      throw new RpcException({
        code: grpcCode,
        message: (result as any).error,
      });
    }
    
    return result.data;
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetUserById')
  async findById(payload: { userId: string }) {
    this.logger.log(`Finding user by ID: ${payload.userId}`);
    const result = await this.userService.getProfile(payload.userId);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return result.data;
  }

  private getGrpcStatusCode(error?: string, httpStatusCode?: number): number {
    // Map common errors to gRPC status codes
    if (error?.includes('already exists') || error?.includes('duplicate') || error?.includes('already following')) {
      return GrpcStatus.ALREADY_EXISTS;
    }
    if (error?.includes('not found')) {
      return GrpcStatus.NOT_FOUND;
    }
    if (error?.includes('Unauthorized')) {
      return GrpcStatus.UNAUTHENTICATED;
    }
    if (error?.includes('forbidden') || error?.includes('permission') || error?.includes('cannot follow yourself')) {
      return GrpcStatus.PERMISSION_DENIED;
    }
    if (error?.includes('invalid') || error?.includes('validation')) {
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

  @EventPattern(EVENTS.USER_REGISTERED)
  async handleUserRegistered(@Payload() data: { userId: string; email: string; username: string }) {
    this.logger.log(`Handling user registered event: ${data.userId}`);
    // Create user profile in user service database
    await this.userService.createUserProfile(data.userId, data.email, data.username);
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
}
