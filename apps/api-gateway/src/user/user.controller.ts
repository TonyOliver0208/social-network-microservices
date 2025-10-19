import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Inject,
  UseGuards,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { SERVICES, CurrentUser, JwtAuthGuard, PaginationDto } from '@app/common';
import { UpdateProfileDto } from './dto';
import { UserService, USERSERVICE_SERVICE_NAME } from '@app/proto/user';

@ApiTags('users')
@Controller('users')
export class UserController implements OnModuleInit {
  private userService: UserService;

  constructor(
    @Inject(SERVICES.USER_SERVICE)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.client.getService<UserService>(USERSERVICE_SERVICE_NAME);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Param('id') userId: string) {
    try {
      return await lastValueFrom(this.userService.GetUserById({ id: userId }));
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      return await lastValueFrom(
        this.userService.UpdateProfile({
          id: userId,
          ...updateProfileDto,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update profile',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  async followUser(
    @CurrentUser('userId') followerId: string,
    @Param('id') followingId: string,
  ) {
    try {
      return await lastValueFrom(
        this.userService.FollowUser({
          followerId,
          followingId,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to follow user',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a user' })
  async unfollowUser(
    @CurrentUser('userId') followerId: string,
    @Param('id') followingId: string,
  ) {
    try {
      return await lastValueFrom(
        this.userService.UnfollowUser({
          followerId,
          followingId,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to unfollow user',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/followers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user followers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFollowers(
    @Param('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    try {
      return await lastValueFrom(
        this.userService.GetFollowers({
          userId,
          page: pagination.page || 1,
          limit: pagination.limit || 20,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get followers',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users followed by this user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFollowing(
    @Param('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    try {
      return await lastValueFrom(
        this.userService.GetFollowing({
          userId,
          page: pagination.page || 1,
          limit: pagination.limit || 20,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get following',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
