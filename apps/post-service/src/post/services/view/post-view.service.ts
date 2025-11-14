import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { SERVICES } from '@app/common';
import { UserService, USERSERVICE_SERVICE_NAME } from '@app/proto/user';
import { lastValueFrom } from 'rxjs';
import type { Post as PrismaPost, Like as PrismaLike, Tag as PrismaTag, PostTag as PrismaPostTag } from '../../../../../../node_modules/.prisma/client-post';
import type { PostResponse } from '../../../../../../generated/post';

type PostWithRelations = PrismaPost & {
  _count?: {
    likes: number;
    comments: number;
    questionVotes?: number;
  };
  likes?: Partial<PrismaLike>[];
  postTags?: (PrismaPostTag & {
    tag: PrismaTag;
  })[];
  questionVotes?: any[];
  favoriteQuestions?: any[];
};

@Injectable()
export class PostViewService implements OnModuleInit {
  private readonly logger = new Logger(PostViewService.name);
  private userService: UserService;
  private userServiceInitialized = false;

  constructor(
    @Inject(SERVICES.USER_SERVICE) private readonly userClient: ClientGrpc,
  ) {}

  async onModuleInit() {
    this.logger.log('🔧 Initializing user service connection...');
    
    try {
      this.userService = this.userClient.getService<UserService>(USERSERVICE_SERVICE_NAME);
      this.logger.log('📡 User service client obtained');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      this.logger.log('⏳ Waited 3s for user-service startup');
      
      try {
        await lastValueFrom(
          this.userService.GetUserById({ id: 'connection-test' })
        ).catch(err => {
          this.logger.warn(`Connection test failed: ${err.message}`);
          return null;
        });
        
        this.userServiceInitialized = true;
        this.logger.log('✅ User service connection established and ready!');
      } catch (error) {
        this.logger.warn('⚠️  User service not yet ready, will retry on first request');
      }
    } catch (error) {
      this.logger.error(`❌ Failed to initialize user service: ${error.message}`);
    }
  }
  
  private async ensureUserServiceReady() {
    if (!this.userService) {
      this.logger.warn('⚠️  User service client not initialized');
      return false;
    }
    
    if (this.userServiceInitialized) {
      return true;
    }
    
    this.logger.log('🔄 Attempting lazy initialization of user service...');
    try {
      await lastValueFrom(
        this.userService.GetUserById({ id: 'connection-test' })
      ).catch(() => null);
      
      this.userServiceInitialized = true;
      this.logger.log('✅ User service ready after lazy initialization');
      return true;
    } catch (error) {
      this.logger.error(`Failed lazy initialization: ${error.message}`);
      return false;
    }
  }

  async getUserData(userId: string) {
    const isReady = await this.ensureUserServiceReady();
    
    if (!isReady) {
      return {
        id: userId,
        email: 'unavailable@example.com',
        username: 'User',
        bio: '',
        avatarUrl: '',
      };
    }

    try {
      const user = await lastValueFrom(
        this.userService.GetUserById({ id: userId })
      );
      
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio || '',
        avatarUrl: user.avatar || '',
      };
    } catch (error) {
      this.logger.error(`Error fetching user ${userId}: ${error.message}`);
      return {
        id: userId,
        email: 'unavailable@example.com',
        username: 'User',
        bio: '',
        avatarUrl: '',
      };
    }
  }

  async formatPostResponse(post: PostWithRelations, userId?: string): Promise<PostResponse> {
    const author = await this.getUserData(post.authorId);
    
    const tags = post.postTags?.map((pt) => ({
      id: pt.tag.id,
      name: pt.tag.name,
      description: pt.tag.description || '',
      questionsCount: 0,
      createdAt: pt.tag.createdAt.toISOString(),
    })) || [];
    
    let upvotes = 0;
    let downvotes = 0;
    let userVote: string | null = null;
    
    if (post.questionVotes) {
      upvotes = post.questionVotes.filter((v: any) => v.voteType === 'upvote').length;
      downvotes = post.questionVotes.filter((v: any) => v.voteType === 'downvote').length;
      
      if (userId) {
        const vote = post.questionVotes.find((v: any) => v.userId === userId);
        if (vote) {
          userVote = vote.voteType;
        }
      }
    }
    
    let isFavorited = false;
    if (post.favoriteQuestions && userId) {
      isFavorited = post.favoriteQuestions.some((fq: any) => fq.userId === userId);
    }
    
    return {
      id: post.id,
      userId: post.authorId,
      content: post.content,
      mediaUrls: post.mediaUrls || [],
      likesCount: post._count?.likes || 0,
      commentsCount: post._count?.comments || 0,
      visibility: post.privacy,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      author: author,
      tags: tags,
      upvotes,
      downvotes,
      totalVotes: upvotes - downvotes,
      userVote: userVote || undefined,
      isFavorited,
    };
  }
}
