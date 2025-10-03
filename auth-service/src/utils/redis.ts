import Redis from 'ioredis';
import AppLogger from './logger';

interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

class RedisClient {
  private client: Redis;

  constructor() {
    const config: RedisConfig = {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    };

    // Use Redis URL if provided, otherwise use individual config
    if (process.env.REDIS_URL) {
      this.client = new Redis(process.env.REDIS_URL, config);
    } else {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        db: parseInt(process.env.REDIS_DB || '0', 10),
        ...config
      };

      if (process.env.REDIS_PASSWORD) {
        redisConfig.password = process.env.REDIS_PASSWORD;
      }

      this.client = new Redis(redisConfig);
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      AppLogger.info('Redis connected successfully', {
        service: 'auth-service',
        component: 'redis-client'
      });
    });

    this.client.on('ready', () => {
      AppLogger.info('Redis is ready to receive commands', {
        service: 'auth-service',
        component: 'redis-client',
        status: 'ready'
      });
    });

    this.client.on('error', (error: Error) => {
      AppLogger.error('Redis connection error', {
        service: 'auth-service',
        component: 'redis-client',
        error: error.message,
        stack: error.stack
      });
    });

    this.client.on('close', () => {
      AppLogger.warn('Redis connection closed', {
        service: 'auth-service',
        component: 'redis-client'
      });
    });

    this.client.on('reconnecting', () => {
      AppLogger.info('Redis reconnecting...', {
        service: 'auth-service',
        component: 'redis-client',
        status: 'reconnecting'
      });
    });
  }

  public getClient(): Redis {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
    AppLogger.info('Redis disconnected', {
      service: 'auth-service',
      component: 'redis-client',
      status: 'disconnected'
    });
  }

  // Convenience methods
  public call(...args: string[]): Promise<any> {
    return (this.client as any).call(...args);
  }
}

const redisClient = new RedisClient();
export default redisClient.getClient();