import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SERVICES, GrpcModule } from '@app/common';
import { AUTH_PACKAGE_NAME } from '@app/proto/auth';

@Module({
  imports: [
    GrpcModule.register({
      name: SERVICES.AUTH_SERVICE,
      package: AUTH_PACKAGE_NAME,
      protoFileName: 'auth.proto',
      urlConfigKey: 'AUTH_SERVICE_URL',
      defaultUrl: 'localhost:50051',
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
