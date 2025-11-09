import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GrpcModule, SERVICES } from '@app/common';
import { USER_PACKAGE_NAME } from '@app/proto/user';

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
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
