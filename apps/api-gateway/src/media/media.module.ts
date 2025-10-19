import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { SERVICES } from '@app/common';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.MEDIA_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('MEDIA_SERVICE_URL', 'localhost:50054'),
            package: 'media',
            protoPath: join(__dirname, '../../../../proto/media.proto'),
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
  controllers: [MediaController],
  exports: [ClientsModule],
})
export class MediaModule {}
