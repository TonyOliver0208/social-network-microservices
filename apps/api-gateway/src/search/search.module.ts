import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SearchController } from './search.controller';
import { SERVICES } from '@app/common';
import { SEARCH_PACKAGE_NAME } from '@app/proto/search';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.SEARCH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('SEARCH_SERVICE_URL', 'localhost:50055'),
            package: SEARCH_PACKAGE_NAME,
            protoPath: join(__dirname, '../../../../proto/search.proto'),
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
  controllers: [SearchController],
  exports: [ClientsModule],
})
export class SearchModule {}
