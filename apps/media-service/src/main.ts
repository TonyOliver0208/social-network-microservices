import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('MediaService');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('MEDIA_SERVICE_PORT', 50054);

  // gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${port}`,
      package: 'media',
      protoPath: join(__dirname, '../../../proto/media.proto'),
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  // RabbitMQ for async events (media.uploaded, media.deleted)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
      queue: 'media_queue',
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.startAllMicroservices();

  logger.log(`🎨 Media Service (gRPC) is running on port ${port}`);
  logger.log(`� Media Service (RabbitMQ) connected to media_queue`);
}

bootstrap();
