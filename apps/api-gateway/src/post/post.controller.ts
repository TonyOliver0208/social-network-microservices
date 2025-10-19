import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { SERVICES, CurrentUser, JwtAuthGuard, PaginationDto } from '@app/common';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto';
import { PostService, POSTSERVICE_SERVICE_NAME } from '@app/proto/post';

@ApiTags('posts')
@Controller('posts')
export class PostController implements OnModuleInit {
  private postService: PostService;

  constructor(
    @Inject(SERVICES.POST_SERVICE)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.postService = this.client.getService<PostService>(POSTSERVICE_SERVICE_NAME);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  async createPost(
    @CurrentUser('userId') userId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    try {
      return await lastValueFrom(
        this.postService.CreatePost({
          userId,
          ...createPostDto,
        }),
      );
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
      return await lastValueFrom(
        this.postService.GetFeed({
          userId,
          page: pagination.page || 1,
          limit: pagination.limit || 20,
        }),
      );
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
    @Param('userId') targetUserId: string,
    @Query() pagination: PaginationDto,
  ) {
    try {
      return await lastValueFrom(
        this.postService.GetUserPosts({
          userId: targetUserId,
          page: pagination.page || 1,
          limit: pagination.limit || 20,
        }),
      );
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
      return await lastValueFrom(
        this.postService.GetPostById({
          id: postId,
        }),
      );
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
      return await lastValueFrom(
        this.postService.UpdatePost({
          id: postId,
          userId,
          ...updatePostDto,
        }),
      );
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
      return await lastValueFrom(
        this.postService.DeletePost({
          id: postId,
          userId,
        }),
      );
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
      return await lastValueFrom(
        this.postService.LikePost({
          postId,
          userId,
        }),
      );
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
      return await lastValueFrom(
        this.postService.UnlikePost({
          postId,
          userId,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to unlike post',
        error.status || HttpStatus.BAD_REQUEST,
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
      return await lastValueFrom(
        this.postService.CreateComment({
          postId,
          userId,
          ...createCommentDto,
        }),
      );
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
      return await lastValueFrom(
        this.postService.GetComments({
          postId,
          page: pagination.page || 1,
          limit: pagination.limit || 20,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get comments',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
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
      return await lastValueFrom(
        this.postService.DeleteComment({
          id: commentId,
          userId,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete comment',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
