import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ServiceResponse, calculatePagination } from '@app/common';
import { UpdateProfileDto } from '../../dto';

@Injectable()
export class ProfileLogicService {
  private readonly logger = new Logger(ProfileLogicService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async searchUsers(query: string, page = 1, limit = 20) {
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
