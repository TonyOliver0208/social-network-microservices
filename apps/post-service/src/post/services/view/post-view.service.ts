import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { SERVICES } from '@app/common';
import { UserService, USERSERVICE_SERVICE_NAME } from '@app/proto/user';
import { AuthService, AUTHSERVICE_SERVICE_NAME } from '@app/proto/auth';
import { lastValueFrom } from 'rxjs';
import type { Post as PrismaPost, Like as PrismaLike, Tag as PrismaTag, PostTag as PrismaPostTag } from '../../../../../../node_modules/.prisma/client-post';
import type { PostResponse } from '../../../../../../generated/post';

type PostWithRelations = PrismaPost & {
  _count?: {
    likes: number;
    comments: number;
    answers?: number; // Add answers count
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
  private authService: AuthService;

  constructor(
    @Inject(SERVICES.AUTH_SERVICE) private readonly authClient: ClientGrpc,
  ) {
    this.logger.log('📦 PostViewService constructor called');
  }

  onModuleInit() {
    this.logger.log('🔧 PostViewService onModuleInit - Initializing auth service...');
    try {
      this.authService = this.authClient.getService<AuthService>(AUTHSERVICE_SERVICE_NAME);
      this.logger.log('✅ Auth service obtained from client');
    } catch (error) {
      this.logger.error(`❌ Failed to get auth service: ${error.message}`, error.stack);
    }
  }

  private getAuthService(): AuthService {
    if (!this.authService) {
      this.logger.log('⚡ Lazy initialization of auth service');
      this.authService = this.authClient.getService<AuthService>(AUTHSERVICE_SERVICE_NAME);
    }
    return this.authService;
  }

  async getUserData(userId: string) {
    this.logger.log(`[getUserData] 🔍 Fetching user data for: ${userId}`);
    
    try {
      const authSvc = this.getAuthService();
      this.logger.log(`[getUserData] 📞 Calling auth service GetUserById...`);
      
      const user = await lastValueFrom(
        authSvc.GetUserById({ id: userId })
      );
      
      this.logger.log(`[getUserData] ✅ Received user data:`, {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      
      // Construct full name from firstName and lastName, fallback to username
      let displayName = user.username || 'User';
      if (user.firstName || user.lastName) {
        displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
      }
      
      this.logger.log(`[getUserData] ✅ Constructed display name: "${displayName}"`);
      
      return {
        id: user.id,
        email: user.email,
        username: displayName,
        bio: '',
        avatarUrl: user.profileImage || '',
      };
    } catch (error) {
      this.logger.error(`[getUserData] ❌ Error fetching user ${userId}:`, error.message);
      this.logger.error(`[getUserData] Stack:`, error.stack);
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
    const authorData = await this.getUserData(post.authorId);
    
    const author = {
      id: authorData.id,
      name: authorData.username || 'Anonymous',
      reputation: 0,
      avatar: authorData.avatarUrl || '',
    };
    
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
      // Database stores votes as 'UP' and 'DOWN' (uppercase)
      upvotes = post.questionVotes.filter((v: any) => v.voteType === 'UP').length;
      downvotes = post.questionVotes.filter((v: any) => v.voteType === 'DOWN').length;
      
      if (userId) {
        const vote = post.questionVotes.find((v: any) => v.userId === userId);
        if (vote) {
          // Map backend voteType ('UP'/'DOWN') to frontend format ('up'/'down')
          userVote = vote.voteType === 'UP' ? 'up' : vote.voteType === 'DOWN' ? 'down' : null;
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
      answersCount: (post._count as any)?.answers || 0, // Add answers count
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
