import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { z } from 'zod';
import logger from '@/utils/logger';
import { connectToDb, getDbStatus, getDbInfo } from '@/database/db';
import userRoutes from '@/routes/userRoutes';
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  JWT_SECRET: z.string().min(32, 'JWT Secret must be at least 32 characters'),
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  
  // Optional configurations
  REDIS_URL: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  REQUEST_TIMEOUT: z.string().transform(Number).default('30000'), // 30 seconds
});

// Validate environment variables
let env: z.infer<typeof envSchema>;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('Environment validation failed:', error instanceof z.ZodError ? error.errors : error);
  process.exit(1);
}

/**
 * Enterprise User Service Server
 * 
 * Features:
 * - Internal JWT validation (from API Gateway)
 * - OAuth user management and profiles
 * - MongoDB with optimized connection pooling
 * - Comprehensive error handling and logging
 * - Rate limiting and security headers
 * - Health checks and monitoring endpoints
 * - Graceful shutdown handling
 */

class UserServiceServer {
  private app: express.Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = env.PORT;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] // Replace with actual frontend domain
        : true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'x-request-id', 
        'x-internal-token',
        'x-user-id',
        'x-user-email'
      ]
    }));

    // Body parsing
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Request tracking middleware
    this.app.use(this.requestTrackingMiddleware);

    // Rate limiting
    this.app.use(rateLimiter);
  }

  private requestTrackingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || 
                     `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add request ID to headers if not present
    if (!req.headers['x-request-id']) {
      req.headers['x-request-id'] = requestId;
    }
    res.setHeader('x-request-id', requestId);

    logger.info('Incoming request', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      hasInternalToken: !!req.headers['x-internal-token'],
      userId: req.headers['x-user-id'] as string,
      body: env.NODE_ENV === 'development' ? req.body : '[HIDDEN]'
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info('Request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    });

    next();
  };

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      const dbStatus = getDbStatus();
      const dbInfo = getDbInfo();

      res.status(dbStatus ? 200 : 503).json({
        success: dbStatus,
        message: dbStatus ? 'User service is healthy' : 'User service is unhealthy',
        timestamp: new Date().toISOString(),
        service: 'user-service',
        version: '1.0.0',
        environment: env.NODE_ENV,
        database: {
          connected: dbStatus,
          info: dbInfo
        }
      });
    });

    // Service info endpoint
    this.app.get('/info', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'User Service Information',
        service: 'user-service',
        version: '1.0.0',
        environment: env.NODE_ENV,
        features: {
          authentication: 'Internal JWT (from API Gateway)',
          userManagement: 'OAuth-based user profiles',
          database: 'MongoDB with Mongoose ODM',
          rateLimit: 'Express rate limiting',
          logging: 'Winston structured logging'
        },
        endpoints: {
          '/api/auth/session': 'POST - Get or create user session',
          '/api/profile': 'GET/PUT - User profile management',
          '/api/users': 'GET - List users with pagination',
          '/api/users/top': 'GET - Top users by reputation',
          '/api/users/:id': 'GET - Get user by ID'
        }
      });
    });

    // Main API routes
    this.app.use('/api', userRoutes);

    // Catch-all route for undefined endpoints
    this.app.all('*', (req: Request, res: Response) => {
      logger.warn('Route not found', {
        method: req.method,
        url: req.url,
        ip: req.ip
      });

      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        error: `${req.method} ${req.url} is not a valid endpoint`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database first
      await connectToDb();

      // Start the server
      const server = this.app.listen(this.port, () => {
        logger.info('🚀 User Service started successfully', {
          port: this.port,
          environment: env.NODE_ENV,
          database: getDbInfo(),
          timestamp: new Date().toISOString()
        });
      });

      // Set server timeout
      server.timeout = env.REQUEST_TIMEOUT;

      // Graceful shutdown handling
      const gracefulShutdown = (signal: string) => {
        logger.info(`${signal} received, starting graceful shutdown...`);
        
        server.close((err) => {
          if (err) {
            logger.error('Error during server shutdown', { 
              error: err.message,
              stack: err.stack || undefined 
            });
            process.exit(1);
          }
          
          logger.info('HTTP server closed successfully');
          process.exit(0);
        });

        // Force close after 30 seconds
        setTimeout(() => {
          logger.error('Forced shutdown after timeout');
          process.exit(1);
        }, 30000);
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      // Handle unhandled rejections and exceptions
      process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
        logger.error('🚨 Unhandled Rejection', {
          reason: reason?.message || reason,
          stack: reason?.stack || undefined,
          promise: promise.toString()
        });
      });

      process.on('uncaughtException', (error: Error) => {
        logger.error('🚨 Uncaught Exception', {
          error: error.message,
          stack: error.stack || undefined
        });
        process.exit(1);
      });

    } catch (error) {
      logger.error('Failed to start User Service', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      process.exit(1);
    }
  }
}

// Start the server
const userService = new UserServiceServer();
userService.start();