import { Module } from '@nestjs/common';
import { PostPublicController } from './controllers/post-public.controller';
import { PostProtectedController } from './controllers/post-protected.controller';
import { PostLogicService } from './services/logic/post-logic.service';
import { LikeLogicService } from './services/logic/like-logic.service';
import { CommentLogicService } from './services/logic/comment-logic.service';
import { TagLogicService } from './services/logic/tag-logic.service';
import { VoteLogicService } from './services/logic/vote-logic.service';
import { AnswerLogicService } from './services/logic/answer-logic.service';
import { PostViewService } from './services/view/post-view.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GrpcModule, SERVICES } from '@app/common';
import { USER_PACKAGE_NAME } from '@app/proto/user';
import { AUTH_PACKAGE_NAME } from '@app/proto/auth';

@Module({
  imports: [
    PrismaModule,
    GrpcModule.register({
      name: SERVICES.USER_SERVICE,
      package: USER_PACKAGE_NAME,
      protoFileName: 'user.proto',
      urlConfigKey: 'USER_SERVICE_URL',
      defaultUrl: 'localhost:50052',
    }),
    GrpcModule.register({
      name: SERVICES.AUTH_SERVICE,
      package: AUTH_PACKAGE_NAME,
      protoFileName: 'auth.proto',
      urlConfigKey: 'AUTH_SERVICE_URL',
      defaultUrl: 'localhost:50051',
    }),
  ],
  controllers: [PostPublicController, PostProtectedController],
  providers: [
    PostLogicService,
    LikeLogicService,
    CommentLogicService,
    TagLogicService,
    VoteLogicService,
    AnswerLogicService,
    PostViewService,
  ],
})
export class PostModule {}
