import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CloudinaryService } from './cloudinary.service';
import { Media, MediaSchema } from './schemas/media.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
  ],
  controllers: [MediaController],
  providers: [MediaService, CloudinaryService],
  exports: [MediaService, CloudinaryService],
})
export class MediaModule {}
