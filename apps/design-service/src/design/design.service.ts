import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';

@Injectable()
export class DesignService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserDesigns(userId: string) {
    return this.prisma.design.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getUserDesignById(userId: string, designId: string) {
    const design = await this.prisma.design.findFirst({
      where: {
        id: designId,
        userId,
      },
    });

    if (!design) {
      throw new NotFoundException(
        'Design not found or you don\'t have permission to view it',
      );
    }

    return design;
  }

  async createDesign(userId: string, createDesignDto: CreateDesignDto) {
    return this.prisma.design.create({
      data: {
        userId,
        name: createDesignDto.name || 'Untitled Design',
        canvasData: createDesignDto.canvasData,
        width: createDesignDto.width,
        height: createDesignDto.height,
        category: createDesignDto.category,
      },
    });
  }

  async updateDesign(userId: string, designId: string, updateDesignDto: UpdateDesignDto) {
    // Verify ownership
    const design = await this.prisma.design.findFirst({
      where: {
        id: designId,
        userId,
      },
    });

    if (!design) {
      throw new NotFoundException(
        'Design not found or you don\'t have permission to update it',
      );
    }

    return this.prisma.design.update({
      where: { id: designId },
      data: {
        ...(updateDesignDto.name && { name: updateDesignDto.name }),
        ...(updateDesignDto.canvasData && { canvasData: updateDesignDto.canvasData }),
        ...(updateDesignDto.width && { width: updateDesignDto.width }),
        ...(updateDesignDto.height && { height: updateDesignDto.height }),
        ...(updateDesignDto.category && { category: updateDesignDto.category }),
      },
    });
  }

  async deleteDesign(userId: string, designId: string) {
    // Verify ownership
    const design = await this.prisma.design.findFirst({
      where: {
        id: designId,
        userId,
      },
    });

    if (!design) {
      throw new NotFoundException(
        'Design not found or you don\'t have permission to delete it',
      );
    }

    await this.prisma.design.delete({
      where: { id: designId },
    });

    return { message: 'Design deleted successfully' };
  }
}
