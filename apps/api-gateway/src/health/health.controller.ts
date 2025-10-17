import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      success: true,
      message: 'API Gateway is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ping')
  ping() {
    return {
      success: true,
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
