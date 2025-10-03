import 'dotenv/config';
import express from 'express';
import AppLogger from './utils/logger';
import { config } from './config';
import database from './database/connection';
import { corsMiddleware } from './middleware/cors';
import { helmetMiddleware, defaultCustomHeaders } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/error';
import { generalRateLimit } from './middleware/rateLimiter';
import { requestIdMiddleware, correlationIdMiddleware } from './middleware/requestId';
import { requestLogger } from './middleware/request-logger';
import authRoutes from './routes/auth-routes';

/**
 * Auth Service Server
 * 
 * Features:
 * - JWT-based authentication with Google OAuth
 * - Request ID and correlation ID tracking
 * - Structured logging and monitoring
 * - Rate limiting and security headers
 * - Graceful error handling
 */
class AuthServer {
  private app: express.Application;
  private readonly port: number;

  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize core middleware stack
   */
  private initializeMiddleware(): void {
    // Security headers
    this.app.use(helmetMiddleware);
    this.app.use(defaultCustomHeaders);

    // CORS configuration
    this.app.use(corsMiddleware);

    // Request correlation and logging
    this.app.use(requestIdMiddleware);
    this.app.use(correlationIdMiddleware);
    this.app.use(requestLogger);

    // Body parsing with size limits
    this.app.use(express.json({ 
      limit: '10mb',
      strict: true,
      type: ['application/json', 'application/*+json']
    }));
    
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb',
      parameterLimit: 1000
    }));

    // Rate limiting
    this.app.use(generalRateLimit);
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    // Root health check
    this.app.get('/health', (req, res) => {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      const requestId = req.headers['x-request-id'] as string;
      const dbStatus = database.getConnectionStatus();
      
      res.status(200).json({
        success: true,
        message: 'Auth Service is healthy',
        service: 'auth-service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        uptime: {
          seconds: Math.floor(uptime),
          humanReadable: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`
        },
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
        },
        database: {
          status: dbStatus.isConnected ? 'connected' : 'disconnected',
          readyState: dbStatus.readyState,
          host: dbStatus.host,
          database: dbStatus.database
        },
        requestId
      });
    });

    // Auth routes
    this.app.use('/auth', authRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      const requestId = req.headers['x-request-id'] as string;
      
      res.status(200).json({
        success: true,
        message: 'DevColl Auth Service API',
        version: '1.0.0',
        endpoints: {
          auth: '/auth',
          health: '/health'
        },
        timestamp: new Date().toISOString(),
        requestId
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Initialize database connection
      database.setupEventHandlers();
      await database.connect();

      const server = this.app.listen(this.port, () => {
      AppLogger.info('🚀 Auth Service started successfully', {
        port: this.port,
        environment: process.env.NODE_ENV,
        version: '1.0.0',
        features: {
          rateLimit: `${config.rateLimit.max} requests per ${config.rateLimit.windowMs}ms`,
          requestLogging: config.features.requestLogging
        }
      });

      // Log startup metrics
      const memUsage = process.memoryUsage();
      AppLogger.info('Server startup metrics', {
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
        },
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid
      });
    });

    // Server error handling
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        AppLogger.error(`❌ Port ${this.port} is already in use`, { port: this.port });
        process.exit(1);
      } else {
        AppLogger.error('❌ Server error', { error: error.message, code: error.code });
        process.exit(1);
      }
    });

      // Handle keep-alive connections
      server.keepAliveTimeout = 65000;
      server.headersTimeout = 66000;
      server.timeout = config.server.timeout;
    } catch (error) {
      AppLogger.error('❌ Failed to start server', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      process.exit(1);
    }
  }

  /**
   * Get Express app instance
   */
  public getApp(): express.Application {
    return this.app;
  }
}

// Initialize and start the server
const authServer = new AuthServer();

if (require.main === module) {
  authServer.start().catch(error => {
    AppLogger.error('Failed to start auth server', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
  });
}

export default authServer.getApp();
