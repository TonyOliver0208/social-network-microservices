import type { HelmetOptions } from 'helmet';
import { env } from './environment';

/**
 * Content Security Policy directives
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  scriptSrc: ["'self'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  fontSrc: ["'self'", "https:"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"]
};

/**
 * Security headers configuration by environment
 */
export function getSecurityConfig(environment: string = env.NODE_ENV): HelmetOptions {
  const isProduction = environment === 'production';
  const isDevelopment = environment === 'development';

  return {
    contentSecurityPolicy: isDevelopment ? false : {
      directives: CSP_DIRECTIVES
    },
    crossOriginEmbedderPolicy: false, // Required for some APIs
    hsts: isProduction ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    } : false,
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  };
}

/**
 * Custom security headers
 */
export function getCustomHeaders(serviceName: string = 'auth-service', environment: string = env.NODE_ENV) {
  return {
    'X-API-Version': '1.0.0',
    'X-Service-Name': serviceName,
    'X-Environment': environment,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: '15 minutes'
  }
};

export default {
  getSecurityConfig,
  getCustomHeaders,
  CSP_DIRECTIVES,
  RATE_LIMIT_CONFIG
};