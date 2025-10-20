import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { SERVICES, GrpcModule } from '@app/common';
import { USER_PACKAGE_NAME } from '@app/proto/user';

@Module({
  imports: [
    GrpcModule.register({
      name: SERVICES.USER_SERVICE,
      package: USER_PACKAGE_NAME,
      protoFileName: 'user.proto',
      urlConfigKey: 'USER_SERVICE_URL',
      defaultUrl: 'localhost:50052',
    }),
  ],
  controllers: [UserController],
})
export class UserModule {}
