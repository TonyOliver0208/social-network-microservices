import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGES, CurrentUser, JwtAuthGuard } from '@app/common';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(SERVICES.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGES.AUTH_REGISTER, registerDto),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Registration failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGES.AUTH_LOGIN, loginDto),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Login failed',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGES.AUTH_REFRESH_TOKEN, refreshTokenDto),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Token refresh failed',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@CurrentUser() user: any) {
    try {
      const result = await firstValueFrom(
        this.authClient.send(MESSAGES.AUTH_LOGOUT, { userId: user.userId }),
      );
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Logout failed',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      success: true,
      data: user,
    };
  }
}
