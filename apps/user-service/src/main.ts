import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('UserService');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('USER_SERVICE_PORT', 3002);

  // TCP Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: port,
    },
  });

  // RabbitMQ Microservice for events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
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
  await app.listen(port);

  logger.log(`👥 User Service is running on port ${port}`);
}

bootstrap();
