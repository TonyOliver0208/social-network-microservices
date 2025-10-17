import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { MediaModule } from './media/media.module';
import { SearchModule } from './search/search.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    RedisModule.register(),
    AuthModule,
    UserModule,
    PostModule,
    MediaModule,
    SearchModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
