import { Server } from "http";
import AppLogger from "@/utils/logger";

export interface GracefulShutdownOptions {
  timeout?: number;
  signals?: string[];
}

/**
 * Graceful shutdown handler for Express server
 */
export class GracefulShutdownHandler {
  private server: Server;
  private shutdownTimeout: number;
  private signals: string[];

  constructor(server: Server, options: GracefulShutdownOptions = {}) {
    this.server = server;
    this.shutdownTimeout = options.timeout || 30000; // 30 seconds default
    this.signals = options.signals || ["SIGTERM", "SIGINT"];
    this.setupSignalHandlers();
    this.setupProcessHandlers();
  }

  private setupSignalHandlers(): void {
    this.signals.forEach((signal) => {
      process.on(signal, () => this.gracefulShutdown(signal));
    });
  }

  private setupProcessHandlers(): void {
    // Handle unhandled rejections
    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      AppLogger.error("🚨 Unhandled Promise Rejection", {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: promise.toString(),
        pid: process.pid,
      });

      // In production, we might want to exit gracefully
      if (process.env.NODE_ENV === "production") {
        this.gracefulShutdown("unhandledRejection");
      }
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      AppLogger.error("🚨 Uncaught Exception - Server will exit", {
        error: error.message,
        stack: error.stack,
        pid: process.pid,
      });

      // Uncaught exceptions are serious - always exit
      this.forceExit(1);
    });

    // Handle warnings
    process.on("warning", (warning) => {
      AppLogger.warn("Process warning", {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
      });
    });
  }

  private gracefulShutdown(signal: string): void {
    AppLogger.info(`🛑 ${signal} received - Starting graceful shutdown`, {
      signal,
      pid: process.pid,
      timeout: this.shutdownTimeout,
    });

    // Stop accepting new connections
    this.server.close((err) => {
      if (err) {
        AppLogger.error("❌ Error during server shutdown", {
          error: err.message,
          stack: err.stack,
        });
        this.forceExit(1);
        return;
      }

      AppLogger.info("✅ Server closed successfully - All connections drained");
      this.cleanExit(0);
    });

    // Force close after timeout
    const forceTimeout = setTimeout(() => {
      AppLogger.error(
        `⏰ Forced shutdown after ${this.shutdownTimeout}ms timeout`
      );
      this.forceExit(1);
    }, this.shutdownTimeout);

    // Clear timeout if we exit gracefully before it fires
    process.on("exit", () => {
      clearTimeout(forceTimeout);
    });
  }

  private cleanExit(code: number): void {
    AppLogger.info(`Process exiting cleanly with code ${code}`);
    process.exit(code);
  }

  private forceExit(code: number): void {
    AppLogger.error(`Process force exiting with code ${code}`);
    process.exit(code);
  }

  /**
   * Get server connection stats
   */
  public getConnectionStats(): { listening: boolean } {
    return {
      listening: this.server.listening,
    };
  }
}

/**
 * Application error handler for Express middleware
 */
export class ApplicationErrorHandler {
  private static logError(error: Error, context?: Record<string, any>): void {
    AppLogger.error("Application error", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    });
  }

  /**
   * Handle synchronous errors
   */
  public static handleSync(error: Error, context?: Record<string, any>): void {
    this.logError(error, context);
  }

  /**
   * Handle asynchronous errors
   */
  public static async handleAsync(
    error: Error,
    context?: Record<string, any>
  ): Promise<void> {
    this.logError(error, context);

    // Perform cleanup operations if needed
    // await this.cleanup();
  }

  /**
   * Wrap async route handlers to catch errors
   */
  public static wrapAsync(fn: Function) {
    return (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

export default { GracefulShutdownHandler, ApplicationErrorHandler };
