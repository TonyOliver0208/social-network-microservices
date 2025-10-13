import { ConnectOptions } from 'mongoose';
import { env } from './environment';

/**
 * Database configuration settings
 * Contains only configuration, not connection logic
 */
export const databaseConfig = {
  uri: env.MONGODB_URI,
  options: {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds (increased)
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 10000, // How long a connection can take to be opened before timing out
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    retryWrites: true, // Retry failed writes
    w: 'majority' as const, // Write concern
  } as ConnectOptions,
  
  // Connection pool settings
  pool: {
    min: 2, // Minimum number of connections
    max: 10, // Maximum number of connections
    acquireTimeoutMillis: 60000, // Maximum time to wait for a connection
    createTimeoutMillis: 30000, // Maximum time to wait for connection creation
    destroyTimeoutMillis: 5000, // Maximum time to wait for connection destruction
    idleTimeoutMillis: 30000, // Time to live for idle connections
    reapIntervalMillis: 1000, // How often to check for idle connections to reap
    createRetryIntervalMillis: 200, // How long to wait before trying to create connection again
  },

  // Environment-specific settings
  debug: env.NODE_ENV === 'development',
  autoIndex: env.NODE_ENV === 'development', // Only auto-create indexes in development
  
  // Health check settings
  healthCheck: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 5000, // 5 seconds
  }
};

export default databaseConfig;