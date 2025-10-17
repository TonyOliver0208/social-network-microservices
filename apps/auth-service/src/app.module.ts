import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { RedisModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' },
      }),
    }),
    RedisModule.register(),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, LocalStrategy],
})
export class AppModule {}
