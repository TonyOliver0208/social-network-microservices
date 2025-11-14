import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserPublicController } from './user/controllers/user-public.controller';
import { UserProtectedController } from './user/controllers/user-protected.controller';
import { ProfileLogicService } from './user/services/logic/profile-logic.service';
import { FollowLogicService } from './user/services/logic/follow-logic.service';
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
  controllers: [UserPublicController, UserProtectedController],
  providers: [ProfileLogicService, FollowLogicService, PrismaService],
})
export class AppModule {}
