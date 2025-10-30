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
      // Handle gRPC errors
      const message = error.details || error.message || 'Registration failed';
      const statusCode = this.getHttpStatusFromGrpcError(error);
      throw new HttpException(message, statusCode);
    }
  }

  private getHttpStatusFromGrpcError(error: any): number {
    // Map gRPC error codes to HTTP status codes
    const grpcCode = error.code;
    switch (grpcCode) {
      case 6: // ALREADY_EXISTS
        return HttpStatus.CONFLICT;
      case 3: // INVALID_ARGUMENT
        return HttpStatus.BAD_REQUEST;
      case 16: // UNAUTHENTICATED
        return HttpStatus.UNAUTHORIZED;
      case 7: // PERMISSION_DENIED
        return HttpStatus.FORBIDDEN;
      case 5: // NOT_FOUND
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await lastValueFrom(this.authService.Login(loginDto));
    } catch (error) {
      const message = error.details || error.message || 'Login failed';
      const statusCode = this.getHttpStatusFromGrpcError(error);
      throw new HttpException(message, statusCode);
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      return await lastValueFrom(this.authService.RefreshToken(refreshTokenDto));
    } catch (error) {
      const message = error.details || error.message || 'Token refresh failed';
      const statusCode = this.getHttpStatusFromGrpcError(error);
      throw new HttpException(message, statusCode);
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
      const message = error.details || error.message || 'Logout failed';
      const statusCode = this.getHttpStatusFromGrpcError(error);
      throw new HttpException(message, statusCode);
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
