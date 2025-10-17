import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from '@app/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  const logger = appContext.get(Logger);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: configService.get<number>('PORT', 3003),
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useLogger(logger);

  await app.listen();
  logger.log(`Post Service is listening on port ${configService.get<number>('PORT', 3003)}`, 'Bootstrap');
}

bootstrap();
