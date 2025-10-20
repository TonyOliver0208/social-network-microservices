import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { SERVICES, GrpcModule } from '@app/common';
import { MEDIA_PACKAGE_NAME } from '@app/proto/media';

@Module({
  imports: [
    GrpcModule.register({
      name: SERVICES.MEDIA_SERVICE,
      package: MEDIA_PACKAGE_NAME,
      protoFileName: 'media.proto',
      urlConfigKey: 'MEDIA_SERVICE_URL',
      defaultUrl: 'localhost:50054',
    }),
  ],
  controllers: [MediaController],
})
export class MediaModule {}
