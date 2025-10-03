import { Request, Response, NextFunction } from 'express';
import AppLogger from '../utils/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store: { [key: string]: RateLimitEntry } = {};

export const createRateLimiter = (windowMs: number, maxRequests: number, message?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const key = req.ip || 'unknown';
      const now = Date.now();
      const resetTime = now + windowMs;

      let entry = store[key];

      if (!entry || entry.resetTime <= now) {
        entry = { count: 1, resetTime };
        store[key] = entry;
      } else {
        entry.count++;
      }

      const remaining = Math.max(0, maxRequests - entry.count);

      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(entry.resetTime / 1000).toString()
      });

      if (entry.count > maxRequests) {
        AppLogger.warn('Rate limit exceeded:', {
          ip: req.ip,
          path: req.path,
          count: entry.count,
          limit: maxRequests
        });

        res.status(429).json({
          success: false,
          message: message || 'Too many requests, please try again later',
          code: 'RATE_LIMIT_EXCEEDED'
        });
        return;
      }

      next();
    } catch (error) {
      AppLogger.error('Rate limiter error:', { error });
      next();
    }
  };
};

// Import config for consistent rate limiting
const { config } = require('../config');

// Common rate limiters
export const generalRateLimit = createRateLimiter(config.rateLimit.windowMs, config.rateLimit.max); 
export const loginRateLimit = createRateLimiter(15 * 60 * 1000, 10); // 10 login attempts per 15 minutes
export const refreshRateLimit = createRateLimiter(60 * 1000, 5); // 5 refresh attempts per minute

export default {
  createRateLimiter,
  generalRateLimit,
  loginRateLimit,
  refreshRateLimit
};
