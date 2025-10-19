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
  OnModuleInit,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { SERVICES, CurrentUser, JwtAuthGuard } from '@app/common';
import { MediaService, MEDIASERVICE_SERVICE_NAME } from '@app/proto/media';

@ApiTags('media')
@Controller('media')
export class MediaController implements OnModuleInit {
  private mediaService: MediaService;

  constructor(
    @Inject(SERVICES.MEDIA_SERVICE)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.mediaService = this.client.getService<MediaService>(MEDIASERVICE_SERVICE_NAME);
  }

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
      return await lastValueFrom(
        this.mediaService.UploadMedia({
          userId,
          file: file.buffer,
          filename: file.originalname,
          mimetype: file.mimetype,
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        }),
      );
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
      return await lastValueFrom(
        this.mediaService.DeleteMedia({
          id: mediaId,
          userId,
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete media',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
