import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Cloudinary credentials not found in environment variables!');
      this.logger.error('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
      throw new Error('Cloudinary configuration missing');
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.logger.log(`Cloudinary configured successfully for cloud: ${cloudName}`);
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'devcoll'
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Limit max dimensions
            { quality: 'auto:good' }, // Auto optimize quality
            { fetch_format: 'auto' }, // Auto format selection (WebP, etc.)
          ],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            return reject(error);
          }
          this.logger.log(`Image uploaded successfully: ${result.secure_url}`);
          resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted: ${publicId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting image ${publicId}:`, error);
      throw error;
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'devcoll'
  ): Promise<UploadApiResponse[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  // Get optimized URL for an image
  getOptimizedUrl(publicId: string, width?: number, height?: number): string {
    return cloudinary.url(publicId, {
      width: width || 800,
      height: height || 600,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }
}
