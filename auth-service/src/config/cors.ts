import type { CorsOptions } from 'cors';
import { env } from './environment';
import AppLogger from '../utils/logger';

interface CorsConfig {
  development: string[];
  staging: string[];
  production: string[];
}

/**
 * CORS origins configuration by environment
 */
export const CORS_ORIGINS: CorsConfig = {
  development: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:7000',
    'http://localhost:7001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:7000',
    'http://127.0.0.1:7001'
  ],
  staging: [
    'https://staging-devcoll.com',
    'https://staging-client.devcoll.com'
  ],
  production: [
    'https://devcoll.com',
    'https://www.devcoll.com',
    'https://client.devcoll.com'
  ]
};

/**
 * CORS configuration options
 */
export const CORS_CONFIG = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'X-Requested-With',
    'Accept',
    'X-API-Key',
    'X-Request-ID',
    'X-Correlation-ID',
    'X-Source',
    'X-Internal-Token',
    'X-User-ID',
    'X-User-Email',
    'X-User-Role'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Correlation-ID',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
  preflightContinue: false
};

/**
 * Get CORS origins based on environment
 */
export function getCorsOrigins(environment: string): string[] {
  const env = environment as keyof CorsConfig;
  return CORS_ORIGINS[env] || CORS_ORIGINS.development;
}

/**
 * Create CORS configuration with origin validation
 */
export function createCorsConfig(environment: string = 'development'): CorsOptions {
  const origins = getCorsOrigins(environment);
  
  const corsOptions: CorsOptions = {
    ...CORS_CONFIG,
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        AppLogger.debug('CORS: Request with no origin allowed');
        return callback(null, true);
      }
      
      if (origins.includes(origin)) {
        AppLogger.debug('CORS: Origin allowed', { origin });
        callback(null, true);
      } else {
        AppLogger.warn('CORS: Origin blocked', { 
          origin, 
          allowedOrigins: origins 
        });
        callback(new Error('CORS: Origin not allowed'), false);
      }
    }
  };

  AppLogger.info('CORS configuration initialized', {
    environment,
    allowedOrigins: origins,
    credentialsEnabled: corsOptions.credentials,
    service: 'auth-service'
  });

  return corsOptions;
}
