import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceResponse, JwtPayload } from '@app/common';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<ServiceResponse> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ email: registerDto.email }, { username: registerDto.username }],
        },
      });

      if (existingUser) {
        if (existingUser.email === registerDto.email) {
          throw new ConflictException('Email already exists');
        }
        throw new ConflictException('Username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 12);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.username);

      this.logger.log(`User registered: ${user.email}`);

      return {
        success: true,
        data: {
          user,
          ...tokens,
        },
        message: 'User registered successfully',
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  async login(loginDto: LoginDto): Promise<ServiceResponse> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.username);

      this.logger.log(`User logged in: ${user.email}`);

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
          },
          ...tokens,
        },
        message: 'Login successful',
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<ServiceResponse> {
    try {
      // Find refresh token
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if expired
      if (new Date() > storedToken.expiresAt) {
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        storedToken.user.id,
        storedToken.user.email,
        storedToken.user.username,
      );

      // Delete old refresh token
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

      return {
        success: true,
        data: tokens,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      this.logger.error(`Refresh token error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  async logout(userId: string): Promise<ServiceResponse> {
    try {
      // Delete all refresh tokens for user
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async validateToken(token: string): Promise<ServiceResponse> {
    try {
      const payload = this.jwtService.verify(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
          isVerified: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token',
        statusCode: 401,
      };
    }
  }

  private async generateTokens(userId: string, email: string, username: string) {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email,
      username,
      type: 'access',
    };

    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshPayload: JwtPayload = {
      ...jwtPayload,
      type: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    };
  }
}
