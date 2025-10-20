import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { EVENTS, ServiceResponse } from '@app/common';
import { 
  UpdateProfileDto, 
  FollowUserDto, 
  GetUserDto 
} from './dto';
import { USERSERVICE_SERVICE_NAME } from 'generated/user';

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  // ========== gRPC Methods (Gateway → User Service) ==========

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetProfile')
  async getProfile(payload: GetUserDto): Promise<ServiceResponse> {
    this.logger.log(`Getting profile for user: ${payload.userId}`);
    return this.userService.getProfile(payload.userId);
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'UpdateProfile')
  async updateProfile(payload: { userId: string; data: UpdateProfileDto }): Promise<ServiceResponse> {
    this.logger.log(`Updating profile for user: ${payload.userId}`);
    return this.userService.updateProfile(payload.userId, payload.data);
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'FollowUser')
  async followUser(payload: FollowUserDto): Promise<ServiceResponse> {
    this.logger.log(`User ${payload.followerId} following ${payload.followingId}`);
    return this.userService.followUser(payload.followerId, payload.followingId);
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'UnfollowUser')
  async unfollowUser(payload: FollowUserDto): Promise<ServiceResponse> {
    this.logger.log(`User ${payload.followerId} unfollowing ${payload.followingId}`);
    return this.userService.unfollowUser(payload.followerId, payload.followingId);
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetFollowers')
  async getFollowers(payload: { userId: string; page?: number; limit?: number }): Promise<ServiceResponse> {
    this.logger.log(`Getting followers for user: ${payload.userId}`);
    return this.userService.getFollowers(payload.userId, payload.page, payload.limit);
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetFollowing')
  async getFollowing(payload: { userId: string; page?: number; limit?: number }): Promise<ServiceResponse> {
    this.logger.log(`Getting following for user: ${payload.userId}`);
    return this.userService.getFollowing(payload.userId, payload.page, payload.limit);
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetUserById')
  async searchUsers(payload: { query: string; page?: number; limit?: number }): Promise<ServiceResponse> {
    this.logger.log(`Searching users with query: ${payload.query}`);
    return this.userService.searchUsers(payload.query, payload.page, payload.limit);
  }

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetUserById')
  async findById(payload: { userId: string }): Promise<ServiceResponse> {
    this.logger.log(`Finding user by ID: ${payload.userId}`);
    return this.userService.getProfile(payload.userId);
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
