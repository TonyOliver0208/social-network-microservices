import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PostController } from './post.controller';
import { SERVICES } from '@app/common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.POST_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('POST_SERVICE_HOST', 'localhost'),
            port: configService.get<number>('POST_SERVICE_PORT', 3003),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PostController],
  exports: [ClientsModule],
})
export class PostModule {}
