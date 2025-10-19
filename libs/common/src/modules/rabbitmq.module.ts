import { Module, DynamicModule, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export interface RabbitMQModuleOptions {
  name: string;
  queue: string;
}

@Global()
@Module({})
export class RabbitMQModule {
  static register(options: RabbitMQModuleOptions): DynamicModule {
    return {
      module: RabbitMQModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: options.name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672'],
                queue: options.queue,
                queueOptions: {
                  durable: true,
                },
                prefetchCount: 1,
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
