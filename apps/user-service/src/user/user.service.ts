import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceResponse, calculatePagination } from '@app/common';
import { UpdateProfileDto } from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Create user profile (triggered by user registration event)
  async createUserProfile(userId: string, email: string, username: string): Promise<void> {
    try {
      await this.prisma.$transaction([
        this.prisma.profile.create({
          data: {
            userId,
            fullName: username,
          },
        }),
        this.prisma.userStats.create({
          data: {
            userId,
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
          },
        }),
      ]);

      this.logger.log(`Created profile and stats for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to create profile: ${error.message}`);
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId: string): Promise<ServiceResponse> {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      const stats = await this.prisma.userStats.findUnique({
        where: { userId },
      });

      return {
        success: true,
        data: {
          ...profile,
          stats,
        },
      };
    } catch (error) {
      this.logger.error(`Get profile error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  // Update user profile
  async updateProfile(userId: string, data: UpdateProfileDto): Promise<ServiceResponse> {
    try {
      const profile = await this.prisma.profile.update({
        where: { userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Updated profile for user: ${userId}`);

      return {
        success: true,
        data: profile,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      this.logger.error(`Update profile error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  // Follow user
  async followUser(followerId: string, followingId: string): Promise<ServiceResponse> {
    try {
      if (followerId === followingId) {
        throw new BadRequestException('Cannot follow yourself');
      }

      // Check if already following
      const existing = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      if (existing) {
        throw new BadRequestException('Already following this user');
      }

      // Create follow relationship and update stats
      await this.prisma.$transaction([
        this.prisma.follow.create({
          data: {
            followerId,
            followingId,
          },
        }),
        this.prisma.userStats.update({
          where: { userId: followerId },
          data: { followingCount: { increment: 1 } },
        }),
        this.prisma.userStats.update({
          where: { userId: followingId },
          data: { followersCount: { increment: 1 } },
        }),
      ]);

      this.logger.log(`User ${followerId} followed ${followingId}`);

      return {
        success: true,
        message: 'Followed successfully',
      };
    } catch (error) {
      this.logger.error(`Follow error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  // Unfollow user
  async unfollowUser(followerId: string, followingId: string): Promise<ServiceResponse> {
    try {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      if (!follow) {
        throw new NotFoundException('Not following this user');
      }

      // Delete follow relationship and update stats
      await this.prisma.$transaction([
        this.prisma.follow.delete({
          where: { id: follow.id },
        }),
        this.prisma.userStats.update({
          where: { userId: followerId },
          data: { followingCount: { decrement: 1 } },
        }),
        this.prisma.userStats.update({
          where: { userId: followingId },
          data: { followersCount: { decrement: 1 } },
        }),
      ]);

      this.logger.log(`User ${followerId} unfollowed ${followingId}`);

      return {
        success: true,
        message: 'Unfollowed successfully',
      };
    } catch (error) {
      this.logger.error(`Unfollow error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  // Get followers
  async getFollowers(userId: string, page = 1, limit = 20): Promise<ServiceResponse> {
    try {
      const skip = (page - 1) * limit;

      const [followers, total] = await Promise.all([
        this.prisma.follow.findMany({
          where: { followingId: userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            followerId: true,
            createdAt: true,
          },
        }),
        this.prisma.follow.count({
          where: { followingId: userId },
        }),
      ]);

      return {
        success: true,
        data: followers,
        pagination: calculatePagination(page, limit, total),
      };
    } catch (error) {
      this.logger.error(`Get followers error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: 500,
      };
    }
  }

  // Get following
  async getFollowing(userId: string, page = 1, limit = 20): Promise<ServiceResponse> {
    try {
      const skip = (page - 1) * limit;

      const [following, total] = await Promise.all([
        this.prisma.follow.findMany({
          where: { followerId: userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            followingId: true,
            createdAt: true,
          },
        }),
        this.prisma.follow.count({
          where: { followerId: userId },
        }),
      ]);

      return {
        success: true,
        data: following,
        pagination: calculatePagination(page, limit, total),
      };
    } catch (error) {
      this.logger.error(`Get following error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: 500,
      };
    }
  }

  // Search users
  async searchUsers(query: string, page = 1, limit = 20): Promise<ServiceResponse> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.prisma.profile.findMany({
          where: {
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } },
            ],
          },
          skip,
          take: limit,
          select: {
            userId: true,
            fullName: true,
            avatar: true,
            bio: true,
          },
        }),
        this.prisma.profile.count({
          where: {
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } },
            ],
          },
        }),
      ]);

      return {
        success: true,
        data: users,
        pagination: calculatePagination(page, limit, total),
      };
    } catch (error) {
      this.logger.error(`Search users error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: 500,
      };
    }
  }
}
