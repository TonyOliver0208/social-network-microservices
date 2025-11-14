import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ProfileLogicService } from '../services/logic/profile-logic.service';
import { FollowLogicService } from '../services/logic/follow-logic.service';
import { GetUserDto } from '../dto';
import { USERSERVICE_SERVICE_NAME } from '@app/proto/user';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class UserPublicController {
  private readonly logger = new Logger(UserPublicController.name);

  constructor(
    private readonly profileLogic: ProfileLogicService,
    private readonly followLogic: FollowLogicService,
  ) {}

  @GrpcMethod(USERSERVICE_SERVICE_NAME, 'GetProfile')
  async getProfile(payload: GetUserDto) {
    this.logger.log(`Getting profile for user: ${payload.userId}`);
    const result = await this.profileLogic.getProfile(payload.userId);
    
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
    const result = await this.followLogic.getFollowers(payload.userId, payload.page, payload.limit);
    
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
    const result = await this.followLogic.getFollowing(payload.userId, payload.page, payload.limit);
    
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
    this.logger.log(`Searching users: ${payload.query}`);
    const result = await this.profileLogic.searchUsers(payload.query, payload.page, payload.limit);
    
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
    const result = await this.profileLogic.getProfile(payload.userId);
    
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
