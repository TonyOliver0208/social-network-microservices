import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '@app/common';

@ApiTags('designs')
@Controller('designs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DesignController {
  private readonly designServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.designServiceUrl = this.configService.get<string>(
      'DESIGN_SERVICE_URL',
      'http://localhost:50056',
    );
  }

  @All('*')
  async proxyRequestWithPath(@Req() req: Request, @Res() res: Response) {
    try {
      // Extract the path after /api/v1/designs from the original URL
      // req.originalUrl contains the full path, e.g., /api/v1/designs or /api/v1/designs/123
      const basePath = '/api/v1/designs';
      const additionalPath = req.originalUrl.substring(basePath.length) || '';
      const targetUrl = `${this.designServiceUrl}/designs${additionalPath}`;
      
      // Extract userId from authenticated user (set by JWT middleware)
      const userId = (req as any).user?.userId;
      
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl,
          data: req.body,
          params: {
            ...req.query,
            ...(userId && { userId }), // Add userId to query params if available
          },
          headers: {
            ...req.headers,
            host: undefined, // Remove original host header
          },
        }),
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data || { message: 'Internal server error' };
      res.status(status).json(message);
    }
  }

  @All()
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    try {
      // Handle requests to /api/v1/designs (without path)
      const targetUrl = `${this.designServiceUrl}/designs`;
      
      // Extract userId from authenticated user (set by JWT middleware)
      const userId = (req as any).user?.userId;
      
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl,
          data: req.body,
          params: {
            ...req.query,
            ...(userId && { userId }), // Add userId to query params if available
          },
          headers: {
            ...req.headers,
            host: undefined, // Remove original host header
          },
        }),
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data || { message: 'Internal server error' };
      res.status(status).json(message);
    }
  }
}
