import mongoose from 'mongoose';
import { z } from 'zod';
import logger from '@/utils/logger';

// Environment validation
const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development')
});

const env = envSchema.parse(process.env);

/**
 * Enterprise Database Connection
 * 
 * Features:
 * - Connection pooling with optimized settings
 * - Comprehensive error handling and retry logic
 * - Performance monitoring and logging
 * - Graceful shutdown handling
 */

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      // Configure mongoose settings for production
      mongoose.set('strictQuery', true);
      
      // Connection options optimized for enterprise use
      const options = {
        maxPoolSize: env.NODE_ENV === 'production' ? 10 : 5,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true,
        bufferCommands: false,
        bufferMaxEntries: 0,
      };

      await mongoose.connect(env.MONGODB_URI, options);
      
      this.isConnected = true;
      
      logger.info('Connected to MongoDB successfully', {
        environment: env.NODE_ENV,
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        port: mongoose.connection.port
      });

      // Set up connection event handlers
      this.setupEventHandlers();

    } catch (error) {
      logger.error('Failed to connect to MongoDB', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Exit process on connection failure
      process.exit(1);
    }
  }

  private setupEventHandlers(): void {
    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connection established');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', {
        error: error.message,
        stack: error.stack || undefined
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection disconnected');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB connection re-established');
      this.isConnected = true;
    });

    // Handle application termination
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`${signal} received, closing MongoDB connection...`);
    
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during MongoDB connection cleanup', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnectionInfo(): any {
    if (!this.isConnected) {
      return null;
    }

    return {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
      collections: Object.keys(mongoose.connection.collections)
    };
  }
}

// Export singleton instance
const dbConnection = DatabaseConnection.getInstance();

export const connectToDb = async (): Promise<void> => {
  await dbConnection.connect();
};

export const disconnectFromDb = async (): Promise<void> => {
  await dbConnection.disconnect();
};

export const getDbStatus = (): boolean => {
  return dbConnection.getConnectionStatus();
};

export const getDbInfo = (): any => {
  return dbConnection.getConnectionInfo();
};

export default dbConnection;