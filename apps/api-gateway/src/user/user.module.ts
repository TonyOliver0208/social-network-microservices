import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { SERVICES } from '@app/common';
import { USER_PACKAGE_NAME } from '@app/proto/user';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.USER_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('USER_SERVICE_URL', 'localhost:50052'),
            package: USER_PACKAGE_NAME,
            protoPath: join(__dirname, '../../../../proto/user.proto'),
            loader: {
              keepCase: true,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UserController],
  exports: [ClientsModule],
})
export class UserModule {}
