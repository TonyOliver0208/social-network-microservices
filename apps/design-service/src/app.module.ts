import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@app/common';
import { PrismaModule } from './prisma/prisma.module';
import { DesignModule } from './design/design.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule.register(),
    PrismaModule,
    DesignModule,
  ],
})
export class AppModule {}
