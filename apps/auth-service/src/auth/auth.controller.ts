import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { MESSAGES, ServiceResponse } from '@app/common';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(MESSAGES.AUTH_REGISTER)
  async register(@Payload() registerDto: RegisterDto): Promise<ServiceResponse> {
    return this.authService.register(registerDto);
  }

  @MessagePattern(MESSAGES.AUTH_LOGIN)
  async login(@Payload() loginDto: LoginDto): Promise<ServiceResponse> {
    return this.authService.login(loginDto);
  }

  @MessagePattern(MESSAGES.AUTH_REFRESH_TOKEN)
  async refreshToken(@Payload() refreshTokenDto: RefreshTokenDto): Promise<ServiceResponse> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @MessagePattern(MESSAGES.AUTH_LOGOUT)
  async logout(@Payload() payload: { userId: string }): Promise<ServiceResponse> {
    return this.authService.logout(payload.userId);
  }

  @MessagePattern(MESSAGES.AUTH_VALIDATE_TOKEN)
  async validateToken(@Payload() payload: { token: string }): Promise<ServiceResponse> {
    return this.authService.validateToken(payload.token);
  }
}
