import {
  Controller,
  Post,
  Get,
  Body,
  Inject,
  UseGuards,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import { SERVICES, CurrentUser, JwtAuthGuard } from '@app/common';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { AuthService, AUTHSERVICE_SERVICE_NAME } from '@app/proto/auth';

@ApiTags('auth')
@Controller('auth')
export class AuthController implements OnModuleInit {
  private authService: AuthService;

  constructor(
    @Inject(SERVICES.AUTH_SERVICE)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthService>(AUTHSERVICE_SERVICE_NAME);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await lastValueFrom(this.authService.Register(registerDto));
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
      return await lastValueFrom(this.authService.Login(loginDto));
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
      return await lastValueFrom(this.authService.RefreshToken(refreshTokenDto));
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
      return await lastValueFrom(this.authService.Logout({ userId: user.userId }));
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
