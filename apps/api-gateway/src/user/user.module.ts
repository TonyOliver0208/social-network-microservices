import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { SERVICES } from '@app/common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.USER_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('USER_SERVICE_HOST', 'localhost'),
            port: configService.get<number>('USER_SERVICE_PORT', 3002),
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
