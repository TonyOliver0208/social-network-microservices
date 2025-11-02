import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule, JwtMiddleware } from '@app/common';
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply JWT middleware to all routes except auth routes
    consumer
      .apply(JwtMiddleware)
      .exclude(
        '/api/v1/auth/(.*)',
        '/api/v1/health',
        '/api/v1/health/(.*)',
        '/api/docs',
        '/api/docs/(.*)',
      )
      .forRoutes('*');
  }
}
