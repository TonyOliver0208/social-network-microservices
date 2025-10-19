import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media, MediaDocument } from './schemas/media.schema';
import { ServiceResponse } from '@app/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';
  private readonly baseUrl = process.env.MEDIA_BASE_URL || 'http://localhost:3004';

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
  ) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Upload directory ready: ${this.uploadDir}`);
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${error.message}`);
    }
  }

  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    return 'other';
  }

  async uploadFile(
    userId: string,
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
  ): Promise<ServiceResponse> {
    try {
      // Generate unique filename
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      const filePath = path.join(this.uploadDir, filename);

      // Save file to disk
      await fs.writeFile(filePath, file.buffer);

      // Create media record
      const media = await this.mediaModel.create({
        userId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `${this.baseUrl}/media/${filename}`,
        type: this.getFileType(file.mimetype),
        storage: 'local',
        isActive: true,
      });

      this.logger.log(`Media uploaded successfully: ${media._id}`);

      return {
        success: true,
        data: {
          id: media._id,
          url: media.url,
          type: media.type,
          filename: media.filename,
        },
      };
    } catch (error) {
      this.logger.error(`Media upload failed: ${error.message}`);
      return {
        success: false,
        error: 'Failed to upload media',
      };
    }
  }

  async deleteFile(mediaId: string, userId: string): Promise<ServiceResponse> {
    try {
      const media = await this.mediaModel.findById(mediaId);

      if (!media) {
        throw new NotFoundException('Media not found');
      }

      if (media.userId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this media');
      }

      // Delete file from disk
      try {
        const filePath = path.join(this.uploadDir, media.filename);
        await fs.unlink(filePath);
      } catch (error) {
        this.logger.warn(`Failed to delete file from disk: ${error.message}`);
      }

      // Soft delete: mark as inactive
      media.isActive = false;
      await media.save();

      return {
        success: true,
        message: 'Media deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Media deletion failed: ${error.message}`);
      return {
        success: false,
        error: error.message || 'Failed to delete media',
      };
    }
  }

  async findById(mediaId: string): Promise<ServiceResponse> {
    try {
      const media = await this.mediaModel.findById(mediaId);

      if (!media || !media.isActive) {
        throw new NotFoundException('Media not found');
      }

      return {
        success: true,
        data: media,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to find media',
      };
    }
  }

  async getUserMedia(
    userId: string,
    type?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ServiceResponse> {
    try {
      const query: any = { userId, isActive: true };
      if (type) query.type = type;

      const skip = (page - 1) * limit;

      const [media, total] = await Promise.all([
        this.mediaModel
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.mediaModel.countDocuments(query),
      ]);

      return {
        success: true,
        data: {
          media,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error(`Get user media failed: ${error.message}`);
      return {
        success: false,
        error: 'Failed to fetch user media',
      };
    }
  }

  async deleteUserMedia(userId: string): Promise<void> {
    try {
      const media = await this.mediaModel.find({ userId, isActive: true });

      for (const item of media) {
        try {
          const filePath = path.join(this.uploadDir, item.filename);
          await fs.unlink(filePath);
        } catch (error) {
          this.logger.warn(`Failed to delete file: ${item.filename}`);
        }
      }

      await this.mediaModel.updateMany(
        { userId },
        { $set: { isActive: false } },
      );

      this.logger.log(`Deleted all media for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete user media: ${error.message}`);
    }
  }
}
