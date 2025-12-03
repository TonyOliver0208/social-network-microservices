import { All, Controller, Req, Res, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '@app/common';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionController {
  private readonly subscriptionServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.subscriptionServiceUrl = this.configService.get<string>(
      'SUBSCRIPTION_SERVICE_URL',
      'http://localhost:50057',
    );
  }

  @All('*')
  async proxyRequestWithPath(@Req() req: Request, @Res() res: Response) {
    try {
      // Extract the path after /api/v1/subscriptions from the original URL
      // req.originalUrl contains the full path, e.g., /api/v1/subscriptions/create-order
      const basePath = '/api/v1/subscriptions';
      const additionalPath = req.originalUrl.substring(basePath.length) || '';
      const targetUrl = `${this.subscriptionServiceUrl}/subscriptions${additionalPath}`;
      
      // Extract userId from authenticated user (set by JWT middleware)
      const userId = (req as any).user?.userId;
      
      console.log('[Gateway] Proxying subscription request:', {
        method: req.method,
        targetUrl,
        userId,
        hasBody: !!req.body,
        queryParams: req.query,
      });

      // Only send body for POST/PUT/PATCH methods, and only if it has content
      const shouldSendBody = ['POST', 'PUT', 'PATCH'].includes(req.method) && 
                            req.body && 
                            Object.keys(req.body).length > 0;

      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl,
          data: shouldSendBody ? req.body : undefined,
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

      console.log('[Gateway] Subscription response received:', {
        status: response.status,
        data: response.data,
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error('[Gateway] Subscription proxy error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      const status = error.response?.status || 500;
      const message = error.response?.data || { message: 'Internal server error' };
      res.status(status).json(message);
    }
  }

  @All()
  async proxyRequest(@Req() req: Request, @Res() res: Response) {
    try {
      // Handle requests to /api/v1/subscriptions (without path)
      const targetUrl = `${this.subscriptionServiceUrl}/subscriptions`;
      
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
