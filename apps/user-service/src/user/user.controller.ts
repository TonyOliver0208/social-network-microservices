import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { UserService } from './user.service';
import { MESSAGES, EVENTS, ServiceResponse } from '@app/common';
import { 
  UpdateProfileDto, 
  FollowUserDto, 
  GetUserDto 
} from './dto';

@Controller()
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  // Get user profile
  @MessagePattern(MESSAGES.USER_GET_PROFILE)
  async getProfile(@Payload() payload: GetUserDto): Promise<ServiceResponse> {
    this.logger.log(`Getting profile for user: ${payload.userId}`);
    return this.userService.getProfile(payload.userId);
  }

  // Update user profile
  @MessagePattern(MESSAGES.USER_UPDATE_PROFILE)
  async updateProfile(@Payload() payload: { userId: string; data: UpdateProfileDto }): Promise<ServiceResponse> {
    this.logger.log(`Updating profile for user: ${payload.userId}`);
    return this.userService.updateProfile(payload.userId, payload.data);
  }

  // Follow user
  @MessagePattern(MESSAGES.USER_FOLLOW)
  async followUser(@Payload() payload: FollowUserDto): Promise<ServiceResponse> {
    this.logger.log(`User ${payload.followerId} following ${payload.followingId}`);
    return this.userService.followUser(payload.followerId, payload.followingId);
  }

  // Unfollow user
  @MessagePattern(MESSAGES.USER_UNFOLLOW)
  async unfollowUser(@Payload() payload: FollowUserDto): Promise<ServiceResponse> {
    this.logger.log(`User ${payload.followerId} unfollowing ${payload.followingId}`);
    return this.userService.unfollowUser(payload.followerId, payload.followingId);
  }

  // Get followers
  @MessagePattern(MESSAGES.USER_GET_FOLLOWERS)
  async getFollowers(@Payload() payload: { userId: string; page?: number; limit?: number }): Promise<ServiceResponse> {
    this.logger.log(`Getting followers for user: ${payload.userId}`);
    return this.userService.getFollowers(payload.userId, payload.page, payload.limit);
  }

  // Get following
  @MessagePattern(MESSAGES.USER_GET_FOLLOWING)
  async getFollowing(@Payload() payload: { userId: string; page?: number; limit?: number }): Promise<ServiceResponse> {
    this.logger.log(`Getting following for user: ${payload.userId}`);
    return this.userService.getFollowing(payload.userId, payload.page, payload.limit);
  }

  // Search users
  @MessagePattern(MESSAGES.USER_SEARCH)
  async searchUsers(@Payload() payload: { query: string; page?: number; limit?: number }): Promise<ServiceResponse> {
    this.logger.log(`Searching users with query: ${payload.query}`);
    return this.userService.searchUsers(payload.query, payload.page, payload.limit);
  }

  // Event: User created (from Auth Service)
  @EventPattern(EVENTS.USER_CREATED)
  async handleUserCreated(@Payload() data: { userId: string; email: string; username: string }) {
    this.logger.log(`Handling user created event: ${data.userId}`);
    await this.userService.createUserProfile(data.userId, data.email, data.username);
  }

  // Event: User updated
  @EventPattern(EVENTS.USER_UPDATED)
  async handleUserUpdated(@Payload() data: { userId: string; changes: any }) {
    this.logger.log(`Handling user updated event: ${data.userId}`);
    // Handle any necessary cache invalidation or updates
  }
}
