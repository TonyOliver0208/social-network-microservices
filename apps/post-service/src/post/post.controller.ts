import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { PostService } from './post.service';
import { MESSAGES, EVENTS } from '@app/common';
import { CreatePostDto, UpdatePostDto, CreateCommentDto, PaginationDto } from './dto';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @MessagePattern(MESSAGES.POST_CREATE)
  async createPost(@Payload() data: { userId: string; createPostDto: CreatePostDto }) {
    return this.postService.createPost(data.userId, data.createPostDto);
  }

  @MessagePattern(MESSAGES.POST_GET)
  async getPost(@Payload() data: { postId: string; userId?: string }) {
    return this.postService.getPost(data.postId, data.userId);
  }

  @MessagePattern(MESSAGES.POST_UPDATE)
  async updatePost(@Payload() data: { postId: string; userId: string; updatePostDto: UpdatePostDto }) {
    return this.postService.updatePost(data.postId, data.userId, data.updatePostDto);
  }

  @MessagePattern(MESSAGES.POST_DELETE)
  async deletePost(@Payload() data: { postId: string; userId: string }) {
    return this.postService.deletePost(data.postId, data.userId);
  }

  @MessagePattern(MESSAGES.POST_GET_FEED)
  async getFeed(@Payload() data: { userId: string; pagination: PaginationDto }) {
    return this.postService.getFeed(data.userId, data.pagination);
  }

  @MessagePattern(MESSAGES.POST_GET_USER_POSTS)
  async getUserPosts(@Payload() data: { userId: string; pagination: PaginationDto }) {
    return this.postService.getUserPosts(data.userId, data.pagination);
  }

  @MessagePattern(MESSAGES.POST_LIKE)
  async likePost(@Payload() data: { postId: string; userId: string }) {
    return this.postService.likePost(data.postId, data.userId);
  }

  @MessagePattern(MESSAGES.POST_UNLIKE)
  async unlikePost(@Payload() data: { postId: string; userId: string }) {
    return this.postService.unlikePost(data.postId, data.userId);
  }

  @MessagePattern(MESSAGES.POST_GET_LIKES)
  async getPostLikes(@Payload() data: { postId: string; pagination: PaginationDto }) {
    return this.postService.getPostLikes(data.postId, data.pagination);
  }

  @MessagePattern(MESSAGES.COMMENT_CREATE)
  async createComment(@Payload() data: { postId: string; userId: string; createCommentDto: CreateCommentDto }) {
    return this.postService.createComment(data.postId, data.userId, data.createCommentDto);
  }

  @MessagePattern(MESSAGES.COMMENT_UPDATE)
  async updateComment(@Payload() data: { commentId: string; userId: string; content: string }) {
    return this.postService.updateComment(data.commentId, data.userId, data.content);
  }

  @MessagePattern(MESSAGES.COMMENT_DELETE)
  async deleteComment(@Payload() data: { commentId: string; userId: string }) {
    return this.postService.deleteComment(data.commentId, data.userId);
  }

  @MessagePattern(MESSAGES.COMMENT_GET_POST_COMMENTS)
  async getPostComments(@Payload() data: { postId: string; pagination: PaginationDto }) {
    return this.postService.getPostComments(data.postId, data.pagination);
  }

  @EventPattern(EVENTS.USER_DELETED)
  async handleUserDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    await this.postService.handleUserDeleted(data.userId);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
