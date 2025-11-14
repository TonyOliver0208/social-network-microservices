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
      console.log('[API Gateway] Create post request received:', {
        userId,
        hasContent: !!createPostDto.content,
        contentLength: createPostDto.content?.length,
        mediaUrls: createPostDto.mediaUrls,
        privacy: createPostDto.privacy,
        tags: createPostDto.tags,
        fullDto: createPostDto,
      });

      const result = await lastValueFrom(
        this.postService.CreatePost({
          userId,
          content: createPostDto.content,
          mediaUrls: createPostDto.mediaUrls || [],
          visibility: createPostDto.privacy || 'PUBLIC',
          tags: createPostDto.tags || [],
        }),
      );

      console.log('[API Gateway] Post created successfully:', result);
      return result;
    } catch (error) {
      console.error('[API Gateway] Create post error:', error);
      throw new HttpException(
        error.message || 'Failed to create post',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('feed')
  @ApiOperation({ summary: 'Get public feed (no authentication required)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const result = await lastValueFrom(
        this.postService.GetFeed({
          userId: '', // Empty string for public feed
          page: page || 1,
          limit: limit || 20,
        }),
      );
      console.log('[API Gateway] Feed response:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('[API Gateway] Feed error:', error);
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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      return await lastValueFrom(
        this.postService.GetUserPosts({
          userId: targetUserId,
          page: page || 1,
          limit: limit || 20,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get user posts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ========== Tag Endpoints (must come before :id route) ==========

  @Get('tags/popular')
  @ApiOperation({ summary: 'Get popular tags' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularTags(@Query('limit') limit?: number) {
    try {
      return await lastValueFrom(
        this.postService.GetPopularTags({
          limit: limit || 5,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get popular tags',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('tags/:tagName')
  @ApiOperation({ summary: 'Get posts by tag' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPostsByTag(
    @Param('tagName') tagName: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      return await lastValueFrom(
        this.postService.GetPostsByTag({
          tagName,
          page: page || 1,
          limit: limit || 20,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get posts by tag',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTags(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      return await lastValueFrom(
        this.postService.GetTags({
          page: page || 1,
          limit: limit || 20,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get tags',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID (no authentication required)' })
  async getPost(
    @Param('id') postId: string,
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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      return await lastValueFrom(
        this.postService.GetComments({
          postId,
          page: page || 1,
          limit: limit || 20,
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

  // ========== Question Voting Endpoints ==========

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vote on a question (up/down) - toggles if same vote' })
  async voteQuestion(
    @Param('id') questionId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: { voteType: 'up' | 'down' },
  ) {
    try {
      return await lastValueFrom(
        this.postService.VoteQuestion({
          questionId,
          userId,
          voteType: body.voteType,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to vote on question',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/votes')
  @ApiOperation({ summary: 'Get vote counts for a question' })
  async getQuestionVotes(
    @Param('id') questionId: string,
    @CurrentUser('userId') userId?: string,
  ) {
    try {
      return await lastValueFrom(
        this.postService.GetQuestionVotes({
          questionId,
          userId,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get question votes',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ========== Favorite Questions Endpoints ==========

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle favorite on a question' })
  async favoriteQuestion(
    @Param('id') questionId: string,
    @CurrentUser('userId') userId: string,
    @Body() body?: { listName?: string },
  ) {
    try {
      return await lastValueFrom(
        this.postService.FavoriteQuestion({
          questionId,
          userId,
          listName: body?.listName,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to favorite question',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove favorite from a question' })
  async unfavoriteQuestion(
    @Param('id') questionId: string,
    @CurrentUser('userId') userId: string,
  ) {
    try {
      return await lastValueFrom(
        this.postService.UnfavoriteQuestion({
          questionId,
          userId,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to unfavorite question',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user favorite questions' })
  @ApiQuery({ name: 'listName', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserFavorites(
    @CurrentUser('userId') userId: string,
    @Query('listName') listName?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      return await lastValueFrom(
        this.postService.GetUserFavorites({
          userId,
          listName,
          page: page || 1,
          limit: limit || 20,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get favorites',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
