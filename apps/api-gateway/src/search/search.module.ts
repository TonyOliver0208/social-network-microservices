import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SERVICES, GrpcModule } from '@app/common';
import { SEARCH_PACKAGE_NAME } from '@app/proto/search';

@Module({
  imports: [
    GrpcModule.register({
      name: SERVICES.SEARCH_SERVICE,
      package: SEARCH_PACKAGE_NAME,
      protoFileName: 'search.proto',
      urlConfigKey: 'SEARCH_SERVICE_URL',
      defaultUrl: 'localhost:50055',
    }),
  ],
  controllers: [SearchController],
})
export class SearchModule {}
