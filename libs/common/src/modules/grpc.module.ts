import { Module, DynamicModule, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export interface GrpcModuleOptions {
  name: string;
  package: string;
  protoFileName: string;
  urlConfigKey: string;
  defaultUrl: string;
}

@Global()
@Module({})
export class GrpcModule {
  static register(options: GrpcModuleOptions): DynamicModule {
    return {
      module: GrpcModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: options.name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.GRPC,
              options: {
                url: configService.get<string>(options.urlConfigKey) || options.defaultUrl,
                package: options.package,
                protoPath: join(__dirname, `../../../../proto/${options.protoFileName}`),
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
      exports: [ClientsModule],
    };
  }
}
