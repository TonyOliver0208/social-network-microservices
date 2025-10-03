import { z } from 'zod';
import AppLogger from '../utils/logger';

/**
 * Environment configuration schema with validation
 */
export const environmentSchema = z.object({
  // Application configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('4001'),
  
  // Database configuration
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  
  // JWT configuration
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT Access Secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT Refresh Secret must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  // Google OAuth configuration
  GOOGLE_CLIENT_ID: z.string().min(1, 'Google Client ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'Google Client Secret is required'),
  
  // Infrastructure
  REDIS_URL: z.string().optional(),
  
  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Logging and monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  REQUEST_TIMEOUT: z.string().transform(Number).default('30000'), // 30 seconds
  
  // Client URLs for CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000')
});

export type Environment = z.infer<typeof environmentSchema>;

/**
 * Validate environment variables
 */
export function validateEnvironment(): Environment {
  try {
    const parsed = environmentSchema.parse(process.env);
    
    AppLogger.info('✅ Environment validation successful', {
      nodeEnv: parsed.NODE_ENV,
      port: parsed.PORT,
      logLevel: parsed.LOG_LEVEL
    });
    
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      AppLogger.error('❌ Environment validation failed', {
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
      
      AppLogger.error('💡 Required environment variables:');
      AppLogger.error('   MONGODB_URI - MongoDB connection string');
      AppLogger.error('   JWT_ACCESS_SECRET - JWT access token secret (min 32 chars)');
      AppLogger.error('   JWT_REFRESH_SECRET - JWT refresh token secret (min 32 chars)');
      AppLogger.error('   GOOGLE_CLIENT_ID - Google OAuth client ID');
      AppLogger.error('   GOOGLE_CLIENT_SECRET - Google OAuth client secret');
    } else {
      AppLogger.error('❌ Unknown environment validation error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    process.exit(1);
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(env: Environment) {
  const isProduction = env.NODE_ENV === 'production';
  const isDevelopment = env.NODE_ENV === 'development';
  
  return {
    // Server configuration
    server: {
      port: env.PORT,
      timeout: env.REQUEST_TIMEOUT,
      gracefulShutdownTimeout: 30000
    },
    
    // Database configuration
    database: {
      mongoUri: env.MONGODB_URI
    },
    
    // JWT configuration
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      accessExpiry: env.JWT_ACCESS_EXPIRY,
      refreshExpiry: env.JWT_REFRESH_EXPIRY
    },
    
    // OAuth configuration
    oauth: {
      googleClientId: env.GOOGLE_CLIENT_ID,
      googleClientSecret: env.GOOGLE_CLIENT_SECRET
    },
    
    // Security configuration
    security: {
      corsOrigin: getCorsOrigins(env.NODE_ENV)
    },
    
    // Rate limiting
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false
    },
    
    // Infrastructure
    infrastructure: {
      redisUrl: env.REDIS_URL
    },
    
    // Feature flags
    features: {
      requestLogging: true,
      metricsCollection: isProduction,
      detailedErrors: isDevelopment
    }
  };
}

/**
 * Get CORS origins based on environment
 */
function getCorsOrigins(environment: string): string[] {
  switch (environment) {
    case 'production':
      return [
        'https://devcoll.com',
        'https://www.devcoll.com',
        'https://client.devcoll.com'
      ];
    case 'staging':
      return [
        'https://staging-devcoll.com',
        'https://staging-client.devcoll.com'
      ];
    case 'development':
    default:
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ];
  }
}

// Export validated environment
export const env = validateEnvironment();
export const config = getEnvironmentConfig(env);

export default { env, config, validateEnvironment, getEnvironmentConfig };