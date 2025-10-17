import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { SearchController } from './search.controller';
import { SERVICES } from '@app/common';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: SERVICES.SEARCH_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('SEARCH_SERVICE_HOST', 'localhost'),
            port: configService.get<number>('SEARCH_SERVICE_PORT', 3005),
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
