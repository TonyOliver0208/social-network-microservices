import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostIndex, PostIndexDocument } from './schemas/post-index.schema';
import { UserIndex, UserIndexDocument } from './schemas/user-index.schema';
import { ServiceResponse } from '@app/common';
import { IndexPostDto, IndexUserDto } from './dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectModel(PostIndex.name) private postIndexModel: Model<PostIndexDocument>,
    @InjectModel(UserIndex.name) private userIndexModel: Model<UserIndexDocument>,
  ) {}

  // ============ POST SEARCH ============
  async searchPosts(
    query: string,
    page: number = 1,
    limit: number = 20,
    privacy?: string,
  ): Promise<ServiceResponse> {
    try {
      const searchQuery: any = {
        $text: { $search: query },
        isActive: true,
      };

      if (privacy) {
        searchQuery.privacy = privacy;
      } else {
        searchQuery.privacy = 'PUBLIC'; // Default to public posts
      }

      const skip = (page - 1) * limit;

      const [posts, total] = await Promise.all([
        this.postIndexModel
          .find(searchQuery, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' }, postedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.postIndexModel.countDocuments(searchQuery),
      ]);

      return {
        success: true,
        data: {
          posts,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error(`Search posts failed: ${error.message}`);
      return {
        success: false,
        error: 'Failed to search posts',
      };
    }
  }

  async indexPost(data: IndexPostDto): Promise<void> {
    try {
      await this.postIndexModel.create({
        postId: data.postId,
        userId: data.userId,
        content: data.content,
        tags: data.tags || [],
        mediaUrls: data.mediaUrls || [],
        privacy: data.privacy || 'PUBLIC',
        postedAt: data.postedAt || new Date(),
        isActive: true,
      });
      this.logger.log(`Post indexed: ${data.postId}`);
    } catch (error) {
      this.logger.error(`Failed to index post: ${error.message}`);
    }
  }

  async updatePostIndex(postId: string, data: Partial<IndexPostDto>): Promise<void> {
    try {
      await this.postIndexModel.updateOne(
        { postId },
        { $set: data },
      );
      this.logger.log(`Post index updated: ${postId}`);
    } catch (error) {
      this.logger.error(`Failed to update post index: ${error.message}`);
    }
  }

  async removePostFromIndex(postId: string): Promise<void> {
    try {
      await this.postIndexModel.updateOne(
        { postId },
        { $set: { isActive: false } },
      );
      this.logger.log(`Post removed from index: ${postId}`);
    } catch (error) {
      this.logger.error(`Failed to remove post from index: ${error.message}`);
    }
  }

  // ============ USER SEARCH ============
  async searchUsers(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ServiceResponse> {
    try {
      const searchQuery: any = {
        $text: { $search: query },
        isActive: true,
      };

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.userIndexModel
          .find(searchQuery, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' }, followersCount: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.userIndexModel.countDocuments(searchQuery),
      ]);

      return {
        success: true,
        data: {
          users,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error(`Search users failed: ${error.message}`);
      return {
        success: false,
        error: 'Failed to search users',
      };
    }
  }

  async indexUser(data: IndexUserDto): Promise<void> {
    try {
      await this.userIndexModel.create({
        userId: data.userId,
        username: data.username,
        fullName: data.fullName || '',
        bio: data.bio || '',
        avatar: data.avatar || '',
        isActive: true,
        lastActive: new Date(),
      });
      this.logger.log(`User indexed: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to index user: ${error.message}`);
    }
  }

  async updateUserIndex(userId: string, data: Partial<IndexUserDto>): Promise<void> {
    try {
      await this.userIndexModel.updateOne(
        { userId },
        { $set: { ...data, lastActive: new Date() } },
      );
      this.logger.log(`User index updated: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to update user index: ${error.message}`);
    }
  }

  async removeUserFromIndex(userId: string): Promise<void> {
    try {
      await this.userIndexModel.updateOne(
        { userId },
        { $set: { isActive: false } },
      );
      this.logger.log(`User removed from index: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to remove user from index: ${error.message}`);
    }
  }
}
