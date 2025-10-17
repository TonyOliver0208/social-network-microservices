import { Module, Global, DynamicModule } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';

@Global()
@Module({})
export class RedisModule {
  static register(): DynamicModule {
    return {
      module: RedisModule,
      imports: [
        CacheModule.registerAsync({
          useFactory: (configService: ConfigService) => ({
            store: redisStore,
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            ttl: 300, // 5 minutes default
          }),
          inject: [ConfigService],
          isGlobal: true,
        }),
      ],
      exports: [CacheModule],
    };
  }
}
