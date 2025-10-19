import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { SearchService } from './search.service';
import { MESSAGES, EVENTS, ServiceResponse } from '@app/common';
import { SearchQueryDto, IndexPostDto, IndexUserDto } from './dto';

@Controller()
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly searchService: SearchService) {}

  @MessagePattern(MESSAGES.SEARCH_POSTS)
  async searchPosts(@Payload() payload: SearchQueryDto): Promise<ServiceResponse> {
    this.logger.log(`Search posts request: ${payload.query}`);
    return this.searchService.searchPosts(
      payload.query,
      payload.page,
      payload.limit,
      payload.privacy,
    );
  }

  @MessagePattern(MESSAGES.SEARCH_USERS)
  async searchUsers(@Payload() payload: SearchQueryDto): Promise<ServiceResponse> {
    this.logger.log(`Search users request: ${payload.query}`);
    return this.searchService.searchUsers(payload.query, payload.page, payload.limit);
  }

  @EventPattern(EVENTS.POST_CREATED)
  async handlePostCreated(@Payload() data: IndexPostDto) {
    this.logger.log(`Indexing new post: ${data.postId}`);
    await this.searchService.indexPost(data);
  }

  @EventPattern(EVENTS.POST_UPDATED)
  async handlePostUpdated(@Payload() data: IndexPostDto) {
    this.logger.log(`Updating post index: ${data.postId}`);
    await this.searchService.updatePostIndex(data.postId, data);
  }

  @EventPattern(EVENTS.POST_DELETED)
  async handlePostDeleted(@Payload() data: { postId: string }) {
    this.logger.log(`Removing post from index: ${data.postId}`);
    await this.searchService.removePostFromIndex(data.postId);
  }

  @EventPattern(EVENTS.USER_CREATED)
  async handleUserCreated(@Payload() data: IndexUserDto) {
    this.logger.log(`Indexing new user: ${data.userId}`);
    await this.searchService.indexUser(data);
  }

  @EventPattern(EVENTS.USER_UPDATED)
  async handleUserUpdated(@Payload() data: IndexUserDto) {
    this.logger.log(`Updating user index: ${data.userId}`);
    await this.searchService.updateUserIndex(data.userId, data);
  }

  @EventPattern(EVENTS.USER_DELETED)
  async handleUserDeleted(@Payload() data: { userId: string }) {
    this.logger.log(`Removing user from index: ${data.userId}`);
    await this.searchService.removeUserFromIndex(data.userId);
  }
}
