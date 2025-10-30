import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQModule, RedisModule } from '@app/common';
import { PrismaModule } from './prisma/prisma.module';
import { PostModule } from './post/post.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RabbitMQModule.register({ 
      name: 'POST_SERVICE',
      queue: 'post_queue'
    }),
    RedisModule.register(),
    PrismaModule,
    PostModule,
  ],
})
export class AppModule {}
