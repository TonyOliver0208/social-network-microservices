import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, EventPattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { EVENTS, ServiceResponse } from '@app/common';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { AUTHSERVICE_SERVICE_NAME } from 'generated/auth';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // ========== gRPC Methods (Gateway → Auth Service) ==========
  
  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'Register')
  async register(registerDto: RegisterDto): Promise<ServiceResponse> {
    this.logger.log(`Register request: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'Login')
  async login(loginDto: LoginDto): Promise<ServiceResponse> {
    this.logger.log(`Login request: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'RefreshToken')
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<ServiceResponse> {
    this.logger.log('Refresh token request');
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'Logout')
  async logout(payload: { userId: string }): Promise<ServiceResponse> {
    this.logger.log(`Logout request: ${payload.userId}`);
    return this.authService.logout(payload.userId);
  }

  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'ValidateToken')
  async validateToken(payload: { token: string }): Promise<ServiceResponse> {
    this.logger.log('Validate token request');
    return this.authService.validateToken(payload.token);
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
