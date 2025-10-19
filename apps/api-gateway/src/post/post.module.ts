import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PostController } from './post.controller';
import { SERVICES } from '@app/common';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.POST_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('POST_SERVICE_URL', 'localhost:50053'),
            package: 'post',
            protoPath: join(__dirname, '../../../../proto/post.proto'),
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
  controllers: [PostController],
  exports: [ClientsModule],
})
export class PostModule {}
