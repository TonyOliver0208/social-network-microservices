import "dotenv/config";
import express from "express";
import { env, config } from "./config/environment";
import { corsMiddleware } from "./middleware/cors";
import { helmetMiddleware, defaultCustomHeaders } from "./middleware/security";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import {
  requestIdMiddleware,
  correlationIdMiddleware,
} from "./middleware/requestId";
import { requestLogger } from "./middleware/request-logger";
import { GracefulShutdownHandler } from "./handlers/gracefulShutdown";
import v1Routes from "./routes/v1";
import AppLogger from "./utils/logger";

class APIGatewayServer {
  private app: express.Application;
  private readonly port: number;
  private shutdownHandler?: GracefulShutdownHandler;

  constructor() {
    this.app = express();
    this.port = env.PORT;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(helmetMiddleware);
    this.app.use(defaultCustomHeaders);

    // CORS configuration
    this.app.use(corsMiddleware);

    // Request correlation and logging (single application)
    this.app.use(requestIdMiddleware);
    this.app.use(correlationIdMiddleware);
    this.app.use(requestLogger);

    // Body parsing with size limits
    this.app.use(
      express.json({
        limit: "10mb",
        type: ["application/json", "application/*+json"],
      })
    );

    this.app.use(
      express.urlencoded({
        extended: true,
        limit: "10mb",
        parameterLimit: 1000,
      })
    );

    // Rate limiting
    this.app.use(rateLimiter);
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    // API versioning
    this.app.use("/v1", v1Routes);

    // Default route for version negotiation
    this.app.get("/", (req, res) => {
      res.status(200).json({
        success: true,
        message: "DevColl API Gateway",
        versions: {
          current: "v1",
          supported: ["v1"],
          endpoints: {
            v1: "/v1",
            health: "/health",
            docs: "/v1/docs",
          },
        },
        timestamp: new Date().toISOString(),
      });
    });

    // Global catch-all for non-API routes (non-/v1)
    this.app.all("*", (req, res) => {
      const requestId = req.headers["x-request-id"] as string;

      AppLogger.warn("Unsupported route accessed", {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        requestId,
      });

      res.status(404).json({
        success: false,
        message: "Route not found",
        error: `${req.method} ${req.originalUrl} is not supported`,
        timestamp: new Date().toISOString(),
        requestId,
        availableVersions: ["v1"],
        suggestions: [
          "Use /v1 prefix for API endpoints",
          "Check /v1/docs for documentation",
          "Visit / for API information",
        ],
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  /**
   * Start the server with graceful shutdown handling
   */
  public start(): void {
    const server = this.app.listen(this.port, () => {
      AppLogger.info("🚀 API Gateway started successfully", {
        port: this.port,
        environment: env.NODE_ENV,
        version: "1.0.0",
        features: {
          rateLimit: `${config.rateLimit.max} requests per ${config.rateLimit.windowMs}ms`,
          gracefulShutdown: `${config.server.gracefulShutdownTimeout}ms timeout`,
          cors: true, // CORS is handled by dedicated cors middleware
          requestLogging: config.features.requestLogging,
        },
        services: config.services,
      });

      // Log startup metrics
      const memUsage = process.memoryUsage();
      AppLogger.info("Server startup metrics", {
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        },
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
      });
    });

    // Apply server timeout configuration
    server.timeout = config.server.timeout;

    // Initialize graceful shutdown handling
    this.shutdownHandler = new GracefulShutdownHandler(server, {
      timeout: config.server.gracefulShutdownTimeout,
      signals: ["SIGTERM", "SIGINT"],
    });

    // Server error handling
    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        AppLogger.error(`❌ Port ${this.port} is already in use`, {
          port: this.port,
        });
        process.exit(1);
      } else {
        AppLogger.error("❌ Server error", {
          error: error.message,
          code: error.code,
        });
        process.exit(1);
      }
    });

    // Handle keep-alive connections
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  }

  /**
   * Get server health information
   */
  public getHealth(): {
    status: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    connections: { listening: boolean };
  } {
    return {
      status: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: this.shutdownHandler?.getConnectionStats() || {
        listening: false,
      },
    };
  }
}

// Initialize and start the server
const gateway = new APIGatewayServer();
gateway.start();

export default APIGatewayServer;
