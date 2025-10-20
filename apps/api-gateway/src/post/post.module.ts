import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { SERVICES, GrpcModule } from '@app/common';
import { POST_PACKAGE_NAME } from '@app/proto/post';

@Module({
  imports: [
    GrpcModule.register({
      name: SERVICES.POST_SERVICE,
      package: POST_PACKAGE_NAME,
      protoFileName: 'post.proto',
      urlConfigKey: 'POST_SERVICE_URL',
      defaultUrl: 'localhost:50053',
    }),
  ],
  controllers: [PostController],
})
export class PostModule {}
