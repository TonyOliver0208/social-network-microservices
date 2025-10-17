import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { SERVICES } from '@app/common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.MEDIA_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('MEDIA_SERVICE_HOST', 'localhost'),
            port: configService.get<number>('MEDIA_SERVICE_PORT', 3004),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [MediaController],
  exports: [ClientsModule],
})
export class MediaModule {}
