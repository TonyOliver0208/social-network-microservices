import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { DesignService } from './design.service';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';

@Controller('designs')
export class DesignController {
  constructor(private readonly designService: DesignService) {}

  @Get()
  async getUserDesigns(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      const designs = await this.designService.getUserDesigns(userId);
      return {
        success: true,
        data: designs,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch designs',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getDesignById(
    @Query('userId') userId: string,
    @Param('id') designId: string,
  ) {
    try {
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      const design = await this.designService.getUserDesignById(
        userId,
        designId,
      );
      return {
        success: true,
        data: design,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Design not found',
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  async createDesign(
    @Query('userId') userIdQuery: string,
    @Body() body: { userId?: string; name: string; canvasData?: string; width?: number; height?: number; category?: string },
  ) {
    try {
      // Get userId from query param (sent by Gateway) or body
      const userId = userIdQuery || body.userId;
      
      if (!userId || !body.name) {
        throw new HttpException(
          'User ID and name are required',
          HttpStatus.BAD_REQUEST,
        );
      }
      
      // Use empty canvas data if not provided
      const canvasData = body.canvasData || '{}';
      
      const design = await this.designService.createDesign(userId, {
        name: body.name,
        canvasData: canvasData,
        width: body.width,
        height: body.height,
        category: body.category,
      });
      return {
        success: true,
        data: design,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create design',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateDesign(
    @Param('id') designId: string,
    @Query('userId') userIdQuery: string,
    @Body() body: { userId?: string; name?: string; canvasData?: string; width?: number; height?: number; category?: string },
  ) {
    try {
      // Get userId from query param (sent by Gateway) or body
      const userId = userIdQuery || body.userId;
      
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      const design = await this.designService.updateDesign(
        userId,
        designId,
        {
          name: body.name,
          canvasData: body.canvasData,
          width: body.width,
          height: body.height,
          category: body.category,
        },
      );
      return {
        success: true,
        data: design,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update design',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteDesign(
    @Param('id') designId: string,
    @Query('userId') userId: string,
  ) {
    try {
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      await this.designService.deleteDesign(userId, designId);
      return {
        success: true,
        message: 'Design deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete design',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
