import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { EVENTS, ServiceResponse } from '@app/common';
import { RegisterDto, LoginDto, RefreshTokenDto, GoogleAuthDto } from './dto';
import { AUTHSERVICE_SERVICE_NAME } from '@app/proto/auth';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // ========== gRPC Methods (Gateway → Auth Service) ==========
  
  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'Register')
  async register(registerDto: RegisterDto) {
    this.logger.log(`Register request: ${registerDto.email}`);
    const result = await this.authService.register(registerDto);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      user: result.data.user,
      expiresIn: result.data.expiresIn || 900,
      refreshExpiresIn: result.data.refreshExpiresIn || 604800,
    };
  }

  private getGrpcStatusCode(error?: string, httpStatusCode?: number): number {
    // Map common errors to gRPC status codes
    if (error?.includes('already exists') || error?.includes('duplicate')) {
      return GrpcStatus.ALREADY_EXISTS;
    }
    if (error?.includes('not found')) {
      return GrpcStatus.NOT_FOUND;
    }
    if (error?.includes('Invalid credentials') || error?.includes('Unauthorized')) {
      return GrpcStatus.UNAUTHENTICATED;
    }
    if (error?.includes('forbidden') || error?.includes('permission')) {
      return GrpcStatus.PERMISSION_DENIED;
    }
    if (error?.includes('invalid') || error?.includes('validation')) {
      return GrpcStatus.INVALID_ARGUMENT;
    }
    
    // Map HTTP status codes to gRPC codes
    switch (httpStatusCode) {
      case 409:
        return GrpcStatus.ALREADY_EXISTS;
      case 404:
        return GrpcStatus.NOT_FOUND;
      case 401:
        return GrpcStatus.UNAUTHENTICATED;
      case 403:
        return GrpcStatus.PERMISSION_DENIED;
      case 400:
        return GrpcStatus.INVALID_ARGUMENT;
      default:
        return GrpcStatus.UNKNOWN;
    }
  }

  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'Login')
  async login(loginDto: LoginDto) {
    this.logger.log(`Login request: ${loginDto.email}`);
    const result = await this.authService.login(loginDto);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      user: result.data.user,
      expiresIn: result.data.expiresIn || 900,
      refreshExpiresIn: result.data.refreshExpiresIn || 604800,
    };
  }

  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'GoogleAuth')
  async googleAuth(googleAuthDto: GoogleAuthDto) {
    this.logger.log(`Google auth request - tokenType: ${googleAuthDto.tokenType}`);
    const result = await this.authService.googleAuth(googleAuthDto);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      user: result.data.user,
      expiresIn: result.data.expiresIn || 900,
      refreshExpiresIn: result.data.refreshExpiresIn || 604800,
    };
  }

  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'RefreshToken')
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    this.logger.log('Refresh token request');
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return {
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      user: null, // Refresh token doesn't return user
    };
  }

  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'Logout')
  async logout(payload: { userId: string }) {
    this.logger.log(`Logout request: ${payload.userId}`);
    const result = await this.authService.logout(payload.userId);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return {
      success: true,
    };
  }

  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'ValidateToken')
  async validateToken(payload: { token: string }) {
    this.logger.log('Validate token request');
    const result = await this.authService.validateToken(payload.token);
    
    if (!result.success) {
      const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
      throw new RpcException({
        code: grpcCode,
        message: result.error,
      });
    }
    
    return {
      valid: true,
      userId: result.data.userId,
      email: result.data.email,
    };
  }

  // ========== RabbitMQ Event Handlers (Service → Service) ==========
  
  @EventPattern(EVENTS.USER_DELETED)
  async handleUserDeleted(@Payload() data: { userId: string }) {
    this.logger.log(`Handling user deleted event: ${data.userId}`);
    // Clean up user tokens, sessions, etc.
    await this.authService.logout(data.userId);
  }

  @EventPattern(EVENTS.PASSWORD_RESET)
  async handlePasswordResetRequest(@Payload() data: { userId: string; email: string }) {
    this.logger.log(`Password reset requested for: ${data.email}`);
    // Generate reset token and emit email event
    // await this.authService.generatePasswordResetToken(data.userId);
  }
}
