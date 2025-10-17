import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { SERVICES, QUEUES } from '@app/common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.AUTH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('AUTH_SERVICE_HOST', 'localhost'),
            port: configService.get<number>('AUTH_SERVICE_PORT', 3001),
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
