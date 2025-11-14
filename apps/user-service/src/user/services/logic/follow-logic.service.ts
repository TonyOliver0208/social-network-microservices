import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ServiceResponse, calculatePagination } from '@app/common';

@Injectable()
export class FollowLogicService {
  private readonly logger = new Logger(FollowLogicService.name);

  constructor(private readonly prisma: PrismaService) {}

  async followUser(followerId: string, followingId: string): Promise<ServiceResponse> {
    try {
      if (followerId === followingId) {
        throw new BadRequestException('Cannot follow yourself');
      }

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

  async getFollowers(userId: string, page = 1, limit = 20) {
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

  async getFollowing(userId: string, page = 1, limit = 20) {
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
}
