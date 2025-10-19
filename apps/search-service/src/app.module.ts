import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('SEARCH_MONGODB_URI') || 'mongodb://localhost:27017/devcoll_search',
      }),
      inject: [ConfigService],
    }),
    SearchModule,
  ],
})
export class AppModule {}
