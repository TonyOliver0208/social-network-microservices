import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule.register(),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class AppModule {}
