import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import {
  MediaResponseDto,
  AIImageRequestDto,
  AIImageResponseDto,
} from './dto/upload.dto';
import { JwtAuthGuard } from '@app/common';

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('media')
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Media uploaded successfully',
    type: MediaResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.uploadService.uploadMedia(userId, file),
    };
  }

  @Get('media')
  @ApiOperation({ summary: 'Get all media for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all media files',
    type: [MediaResponseDto],
  })
  async getAllMedias(@Request() req) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.uploadService.getAllMediasByUser(userId),
    };
  }

  @Delete('media/:id')
  @ApiOperation({ summary: 'Delete a media file' })
  @ApiResponse({ status: 200, description: 'Media deleted successfully' })
  async deleteMedia(@Request() req, @Param('id') mediaId: string) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.uploadService.deleteMedia(userId, mediaId),
    };
  }

  @Post('ai/generate-image')
  @ApiOperation({ summary: 'Generate an AI image from prompt' })
  @ApiResponse({
    status: 201,
    description: 'AI image generated successfully',
    type: AIImageResponseDto,
  })
  async generateAIImage(@Request() req, @Body() aiImageDto: AIImageRequestDto) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.uploadService.generateAIImage(userId, aiImageDto),
    };
  }

  @Get('ai/history')
  @ApiOperation({ summary: 'Get AI image generation history' })
  @ApiResponse({
    status: 200,
    description: 'Returns AI image history',
    type: [AIImageResponseDto],
  })
  async getAIImageHistory(@Request() req) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.uploadService.getAIImageHistory(userId),
    };
  }
}
