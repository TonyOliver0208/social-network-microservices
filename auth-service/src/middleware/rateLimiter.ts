import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import clientRedis from "../utils/redis";
import AppLogger from "../utils/logger";
import { rateLimitConfig, rateLimitEnv } from "../config/rateLimiter";

/**
 * Create rate limiter handler for consistent error responses
 */
function createRateLimitHandler(type: "general" | "strict" | "ultra") {
  return (req: Request, res: Response) => {
    const requestId = (req.headers["x-request-id"] as string) || "unknown";
    const config = rateLimitConfig[type === "ultra" ? "ultraStrict" : type];

    AppLogger.warn(`Rate limit exceeded - ${type}`, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      url: req.url,
      method: req.method,
      requestId,
      type,
      windowMs: config.windowMs,
      maxRequests: config.max,
    });

    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
      error: "Rate limit exceeded",
      retryAfter: `${Math.ceil(config.windowMs / 60000)} minutes`,
      timestamp: new Date().toISOString(),
      requestId,
    });
  };
}

/**
 * Generate key for rate limiting (IP or IP:UserID)
 * Updated to be IPv6 compatible
 */
function generateKey(req: Request): string {
  const userId = req.headers["x-user-id"] as string;
  // Simplified IP handling for IPv6 compatibility
  const ip = req.ip || "unknown";

  return userId ? `${ip}:${userId}` : ip;
}

/**
 * General rate limiter for most API endpoints
 */
export const rateLimiter = rateLimit({
  ...rateLimitConfig.general,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("general"),

  store: new RedisStore({
    // @ts-ignore - Redis client compatibility
    sendCommand: (...args: string[]) => clientRedis.call(...args),
    prefix: rateLimitConfig.general.prefix,
  }),

  skip: (req: Request) => {
    // Skip health checks in production
    const skipPaths = ["/health", "/metrics", "/status"];
    return (
      rateLimitEnv.NODE_ENV === "production" && skipPaths.includes(req.path)
    );
  },
});

/**
 * Strict rate limiter for auth endpoints
 */
export const strictRateLimiter = rateLimit({
  ...rateLimitConfig.strict,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("strict"),

  store: new RedisStore({
    // @ts-ignore - Redis client compatibility
    sendCommand: (...args: string[]) => clientRedis.call(...args),
    prefix: rateLimitConfig.strict.prefix,
  }),
});

/**
 * Login rate limiter - stricter for authentication
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("strict"),

  store: new RedisStore({
    // @ts-ignore - Redis client compatibility
    sendCommand: (...args: string[]) => clientRedis.call(...args),
    prefix: "auth_rl:login:",
  }),
});

/**
 * Refresh token rate limiter
 */
export const refreshRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 refresh attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("strict"),

  store: new RedisStore({
    // @ts-ignore - Redis client compatibility
    sendCommand: (...args: string[]) => clientRedis.call(...args),
    prefix: "auth_rl:refresh:",
  }),
});

/**
 * General rate limiter alias
 */
export const generalRateLimit = rateLimiter;

/**
 * Default export - use general rate limiter
 */
export default rateLimiter;
