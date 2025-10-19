import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { SERVICES } from '@app/common';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('AUTH_SERVICE_URL', 'localhost:50051'),
            package: 'auth',
            protoPath: join(__dirname, '../../../../proto/auth.proto'),
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
  controllers: [AuthController],
  exports: [ClientsModule],
})
export class AuthModule {}
