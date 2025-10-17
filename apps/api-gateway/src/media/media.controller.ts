import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGES, CurrentUser, JwtAuthGuard } from '@app/common';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(
    @Inject(SERVICES.MEDIA_SERVICE)
    private readonly mediaClient: ClientProxy,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload media file' })
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
  async uploadMedia(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await firstValueFrom(
        this.mediaClient.send(MESSAGES.MEDIA_UPLOAD, {
          userId,
          file: {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          },
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upload media',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete media file' })
  async deleteMedia(
    @Param('id') mediaId: string,
    @CurrentUser('userId') userId: string,
  ) {
    try {
      const result = await firstValueFrom(
        this.mediaClient.send(MESSAGES.MEDIA_DELETE, {
          mediaId,
          userId,
        }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete media',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
