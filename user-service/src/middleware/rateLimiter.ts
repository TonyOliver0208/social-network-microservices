import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import logger from '@/utils/logger';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

// More restrictive rate limiter for sensitive endpoints
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests to sensitive endpoint, please try again later.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  }
});

// Global rate limiter middleware
export const globalRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  // Simple rate limiting without Redis for now
  // In production, implement Redis-based rate limiting
  rateLimiter(req, res, next);
};

// Sensitive endpoints rate limiter
export const sensitiveEndpointsLimiter = (req: Request, res: Response, next: NextFunction): void => {
  strictRateLimiter(req, res, next);
};