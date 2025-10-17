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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGES, CurrentUser, JwtAuthGuard, PaginationDto } from '@app/common';
import { UpdateProfileDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    @Inject(SERVICES.USER_SERVICE)
    private readonly userClient: ClientProxy,
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Param('id') userId: string) {
    try {
      const result = await firstValueFrom(
        this.userClient.send(MESSAGES.USER_GET_PROFILE, { userId }),
      );
      return result;
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
      const result = await firstValueFrom(
        this.userClient.send(MESSAGES.USER_UPDATE_PROFILE, {
          userId,
          data: updateProfileDto,
        }),
      );
      return result;
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
      const result = await firstValueFrom(
        this.userClient.send(MESSAGES.USER_FOLLOW, {
          followerId,
          followingId,
        }),
      );
      return result;
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
      const result = await firstValueFrom(
        this.userClient.send(MESSAGES.USER_UNFOLLOW, {
          followerId,
          followingId,
        }),
      );
      return result;
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
      const result = await firstValueFrom(
        this.userClient.send(MESSAGES.USER_GET_FOLLOWERS, {
          userId,
          ...pagination,
        }),
      );
      return result;
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
      const result = await firstValueFrom(
        this.userClient.send(MESSAGES.USER_GET_FOLLOWING, {
          userId,
          ...pagination,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get following',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchUsers(
    @Query('q') query: string,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.userClient.send(MESSAGES.USER_SEARCH, {
          query,
          ...pagination,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Search failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
