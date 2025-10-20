import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload } from '@nestjs/microservices';
import { PostService } from './post.service';
import { EVENTS } from '@app/common';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, PaginationDto } from './dto';
import { POSTSERVICE_SERVICE_NAME } from 'generated/post';

@Controller()
export class PostController {
  private readonly logger = new Logger(PostController.name);

  constructor(private readonly postService: PostService) {}

  // ========== gRPC Methods (Gateway → Post Service) ==========

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'CreatePost')
  async createPost(data: { userId: string; createPostDto: CreatePostDto }) {
    this.logger.log(`Creating post for user: ${data.userId}`);
    return this.postService.createPost(data.userId, data.createPostDto);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetPostById')
  async getPost(data: { postId: string; userId?: string }) {
    this.logger.log(`Getting post: ${data.postId}`);
    return this.postService.getPost(data.postId, data.userId);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'UpdatePost')
  async updatePost(data: { postId: string; userId: string; updatePostDto: UpdatePostDto }) {
    this.logger.log(`Updating post: ${data.postId} by user: ${data.userId}`);
    return this.postService.updatePost(data.postId, data.userId, data.updatePostDto);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'DeletePost')
  async deletePost(data: { postId: string; userId: string }) {
    this.logger.log(`Deleting post: ${data.postId} by user: ${data.userId}`);
    return this.postService.deletePost(data.postId, data.userId);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetFeed')
  async getFeed(data: { userId: string; pagination: PaginationDto }) {
    this.logger.log(`Getting feed for user: ${data.userId}`);
    return this.postService.getFeed(data.userId, data.pagination);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetUserPosts')
  async getUserPosts(data: { userId: string; pagination: PaginationDto }) {
    this.logger.log(`Getting posts for user: ${data.userId}`);
    return this.postService.getUserPosts(data.userId, data.pagination);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'LikePost')
  async likePost(data: { postId: string; userId: string }) {
    this.logger.log(`User ${data.userId} liking post: ${data.postId}`);
    return this.postService.likePost(data.postId, data.userId);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'UnlikePost')
  async unlikePost(data: { postId: string; userId: string }) {
    this.logger.log(`User ${data.userId} unliking post: ${data.postId}`);
    return this.postService.unlikePost(data.postId, data.userId);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'LikePost')
  async getPostLikes(data: { postId: string; pagination: PaginationDto }) {
    this.logger.log(`Getting likes for post: ${data.postId}`);
    return this.postService.getPostLikes(data.postId, data.pagination);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'CreateComment')
  async createComment(data: { postId: string; userId: string; createCommentDto: CreateCommentDto }) {
    this.logger.log(`User ${data.userId} commenting on post: ${data.postId}`);
    return this.postService.createComment(data.postId, data.userId, data.createCommentDto);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'DeleteComment')
  async updateComment(data: { commentId: string; userId: string; content: string }) {
    this.logger.log(`Updating comment: ${data.commentId}`);
    return this.postService.updateComment(data.commentId, data.userId, data.content);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'DeleteComment')
  async deleteComment(data: { commentId: string; userId: string }) {
    this.logger.log(`Deleting comment: ${data.commentId}`);
    return this.postService.deleteComment(data.commentId, data.userId);
  }

  @GrpcMethod(POSTSERVICE_SERVICE_NAME, 'GetComments')
  async getPostComments(data: { postId: string; pagination: PaginationDto }) {
    this.logger.log(`Getting comments for post: ${data.postId}`);
    return this.postService.getPostComments(data.postId, data.pagination);
  }

  // ========== RabbitMQ Event Handlers (Service → Service) ==========

  @EventPattern(EVENTS.USER_DELETED)
  async handleUserDeleted(@Payload() data: { userId: string }) {
    this.logger.log(`Handling user deleted event: ${data.userId}`);
    // Delete all posts by this user
    await this.postService.handleUserDeleted(data.userId);
  }

  @EventPattern(EVENTS.MEDIA_DELETED)
  async handleMediaDeleted(@Payload() data: { mediaId: string; postId?: string }) {
    this.logger.log(`Handling media deleted event: ${data.mediaId}`);
    // Remove media reference from post if applicable
    if (data.postId) {
      // await this.postService.removeMediaFromPost(data.postId, data.mediaId);
    }
  }

  @EventPattern(EVENTS.USER_FOLLOWED)
  async handleUserFollowed(@Payload() data: { followerId: string; followingId: string }) {
    this.logger.log(`User ${data.followerId} followed ${data.followingId}`);
    // Update feed cache, send notification, etc.
  }
}
