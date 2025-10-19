import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('UserService');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('USER_SERVICE_PORT', 50052);

  // gRPC Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: `0.0.0.0:${port}`,
      package: 'user',
      protoPath: join(__dirname, '../../../proto/user.proto'),
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  // RabbitMQ for async events (user.followed, user.updated, etc.)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
      queue: 'user_queue',
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

  logger.log(`👥 User Service (gRPC) is running on port ${port}`);
  logger.log(`📨 User Service (RabbitMQ) connected to user_queue`);
}

bootstrap();
