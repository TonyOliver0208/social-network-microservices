import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(
    @Inject(SERVICES.POST_SERVICE)
    private readonly postClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  async createPost(
    @CurrentUser('userId') userId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.POST_CREATE, {
          userId,
          createPostDto,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create post',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user feed' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(
    @CurrentUser('userId') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.POST_GET_FEED, {
          userId,
          pagination,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get feed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserPosts(
    @Param('userId') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.POST_GET_USER_POSTS, {
          userId,
          pagination,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get user posts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get post by ID' })
  async getPost(
    @Param('id') postId: string,
    @CurrentUser('userId') userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.POST_GET, {
          postId,
          userId,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Post not found',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  async updatePost(
    @Param('id') postId: string,
    @CurrentUser('userId') userId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.POST_UPDATE, {
          postId,
          userId,
          updatePostDto,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update post',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post' })
  async deletePost(
    @Param('id') postId: string,
    @CurrentUser('userId') userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.POST_DELETE, {
          postId,
          userId,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete post',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post' })
  async likePost(
    @Param('id') postId: string,
    @CurrentUser('userId') userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.POST_LIKE, {
          postId,
          userId,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to like post',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a post' })
  async unlikePost(
    @Param('id') postId: string,
    @CurrentUser('userId') userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.POST_UNLIKE, {
          postId,
          userId,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to unlike post',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get post likes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPostLikes(
    @Param('id') postId: string,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.POST_GET_LIKES, {
          postId,
          pagination,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get likes',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on a post' })
  async createComment(
    @Param('id') postId: string,
    @CurrentUser('userId') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.COMMENT_CREATE, {
          postId,
          userId,
          createCommentDto,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create comment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get post comments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPostComments(
    @Param('id') postId: string,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.COMMENT_GET_POST_COMMENTS, {
          postId,
          pagination,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get comments',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update comment' })
  async updateComment(
    @Param('id') commentId: string,
    @CurrentUser('userId') userId: string,
    @Body('content') content: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.COMMENT_UPDATE, {
          commentId,
          userId,
          content,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update comment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment' })
  async deleteComment(
    @Param('id') commentId: string,
    @CurrentUser('userId') userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.postClient.send(MESSAGES.COMMENT_DELETE, {
          commentId,
          userId,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete comment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
