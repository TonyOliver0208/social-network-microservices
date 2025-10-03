import mongoose from 'mongoose';
import AppLogger from '../utils/logger';
import databaseConfig from '../config/database';


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
      AppLogger.info('Database already connected', {
        service: 'auth-service',
        component: 'database'
      });
      return;
    }

    try {
      mongoose.set('strictQuery', false);
      
      await mongoose.connect(databaseConfig.uri, databaseConfig.options);
      
      this.isConnected = true;
      
      AppLogger.info('Connected to MongoDB successfully', {
        service: 'auth-service',
        component: 'database',
        database: this.getDatabaseName(),
        host: this.getConnectionHost()
      });

    } catch (error) {
      AppLogger.error('Failed to connect to MongoDB', {
        service: 'auth-service',
        component: 'database',
        error: error instanceof Error ? error.message : 'Unknown error',
        uri: this.sanitizeUri(databaseConfig.uri)
      });
      process.exit(1);
    }
  }

  /**
   * Setup connection event handlers
   */
  public setupEventHandlers(): void {
    mongoose.connection.on('connected', () => {
      AppLogger.info('MongoDB connection established', {
        service: 'auth-service',
        component: 'database'
      });
    });

    mongoose.connection.on('error', (error) => {
      AppLogger.error('MongoDB connection error', {
        service: 'auth-service',
        component: 'database',
        error: error.message
      });
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      AppLogger.warn('MongoDB connection disconnected', {
        service: 'auth-service',
        component: 'database'
      });
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      AppLogger.info('MongoDB connection re-established', {
        service: 'auth-service',
        component: 'database'
      });
    });
  }

  /**
   * Graceful shutdown
   */
  public async gracefulShutdown(signal: string): Promise<void> {
    AppLogger.info(`${signal} received, closing MongoDB connection...`, {
      service: 'auth-service',
      component: 'database',
      signal
    });

    try {
      await mongoose.connection.close();
      AppLogger.info('MongoDB connection closed successfully', {
        service: 'auth-service',
        component: 'database'
      });
    } catch (error) {
      AppLogger.error('Error during MongoDB connection cleanup', {
        service: 'auth-service',
        component: 'database',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      AppLogger.info('Disconnected from MongoDB', {
        service: 'auth-service',
        component: 'database'
      });
    } catch (error) {
      AppLogger.error('Error disconnecting from MongoDB', {
        service: 'auth-service',
        component: 'database',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): {
    isConnected: boolean;
    readyState: number;
    host?: string;
    database?: string;
  } {
    const host = this.getConnectionHost();
    const database = this.getDatabaseName();
    
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState as number,
      ...(host && { host }),
      ...(database && { database })
    };
  }

  /**
   * Get database name from connection
   */
  private getDatabaseName(): string | undefined {
    return mongoose.connection.db?.databaseName;
  }

  /**
   * Get connection host information
   */
  private getConnectionHost(): string | undefined {
    return mongoose.connection.host ? 
      `${mongoose.connection.host}:${mongoose.connection.port}` : 
      undefined;
  }

  /**
   * Sanitize MongoDB URI for logging (remove credentials)
   */
  private sanitizeUri(uri: string): string {
    return uri.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://***:***@');
  }
}

// Export singleton instance
export const database = DatabaseConnection.getInstance();

// Setup graceful shutdown handlers
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, () => database.gracefulShutdown(signal));
});

export default database;