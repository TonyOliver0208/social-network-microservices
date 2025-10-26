import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { AIImageRequestDto } from './dto/upload.dto';

@Injectable()
export class UploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async uploadMedia(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Upload to Cloudinary
    const cloudinaryResult = await this.cloudinary.uploadFile(file);

    // Save to database
    const media = await this.prisma.media.create({
      data: {
        userId,
        name: file.originalname,
        cloudinaryId: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
        mimeType: file.mimetype,
        size: file.size,
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        category: this.determineCategory(file.mimetype),
      },
    });

    return media;
  }

  async getAllMediasByUser(userId: string) {
    return this.prisma.media.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteMedia(userId: string, mediaId: string) {
    const media = await this.prisma.media.findFirst({
      where: {
        id: mediaId,
        userId,
      },
    });

    if (!media) {
      throw new BadRequestException('Media not found or unauthorized');
    }

    // Delete from Cloudinary
    await this.cloudinary.deleteFile(media.cloudinaryId);

    // Delete from database
    await this.prisma.media.delete({
      where: { id: mediaId },
    });

    return { message: 'Media deleted successfully' };
  }

  async generateAIImage(userId: string, aiImageDto: AIImageRequestDto) {
    // This is a placeholder - you'd integrate with OpenAI DALL-E or similar
    // For now, we'll just save the request
    const aiImage = await this.prisma.aIGeneratedImage.create({
      data: {
        userId,
        prompt: aiImageDto.prompt,
        negativePrompt: aiImageDto.negativePrompt,
        style: aiImageDto.style,
        model: aiImageDto.model || 'dall-e-3',
        imageUrl: 'https://placeholder-ai-image.com/generated.png', // Replace with actual AI generation
      },
    });

    return aiImage;
  }

  async getAIImageHistory(userId: string) {
    return this.prisma.aIGeneratedImage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private determineCategory(mimeType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'OTHER' {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('text')
    ) {
      return 'DOCUMENT';
    }
    return 'OTHER';
  }
}
