import { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import clientRedis from '@/utils/redis';
import AppLogger from '@/utils/logger';
import { rateLimitConfig, rateLimitEnv } from '@/config/rateLimiter';

/**
 * Create rate limiter handler for consistent error responses
 */
function createRateLimitHandler(type: 'general' | 'strict' | 'ultra') {
  return (req: Request, res: Response) => {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    const config = rateLimitConfig[type === 'ultra' ? 'ultraStrict' : type];
    
    AppLogger.warn(`Rate limit exceeded - ${type}`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method,
      requestId,
      type,
      windowMs: config.windowMs,
      maxRequests: config.max
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      error: 'Rate limit exceeded',
      retryAfter: `${Math.ceil(config.windowMs / 60000)} minutes`,
      timestamp: new Date().toISOString(),
      requestId
    });
  };
}

/**
 * Generate key for rate limiting (IP or IP:UserID)
 */
function generateKey(req: Request): string {
  const userId = req.headers['x-user-id'] as string;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  return userId ? `${ip}:${userId}` : ip;
}

/**
 * General rate limiter for most API endpoints
 */
export const rateLimiter = rateLimit({
  ...rateLimitConfig.general,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('general'),
  keyGenerator: generateKey,
  
  store: new RedisStore({
    // @ts-ignore - Redis client compatibility
    sendCommand: (...args: string[]) => clientRedis.call(...args),
    prefix: rateLimitConfig.general.prefix,
  }),
  
  skip: (req: Request) => {
    // Skip health checks in production
    const skipPaths = ['/health', '/metrics', '/status'];
    return rateLimitEnv.NODE_ENV === 'production' && skipPaths.includes(req.path);
  }
});

/**
 * Strict rate limiter for auth endpoints
 */
export const strictRateLimiter = rateLimit({
  ...rateLimitConfig.strict,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler('strict'),
  keyGenerator: generateKey,
  
  store: new RedisStore({
    // @ts-ignore - Redis client compatibility
    sendCommand: (...args: string[]) => clientRedis.call(...args),
    prefix: rateLimitConfig.strict.prefix,
  })
});

/**
 * Default export - use general rate limiter for API Gateway
 */
export default rateLimiter;