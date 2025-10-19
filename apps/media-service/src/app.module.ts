import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MEDIA_MONGODB_URI') || 'mongodb://localhost:27017/devcoll_media',
      }),
      inject: [ConfigService],
    }),
    MediaModule,
  ],
})
export class AppModule {}
