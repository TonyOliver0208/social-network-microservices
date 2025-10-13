import Redis from "ioredis";
import { env } from "../config/environment";
import AppLogger from "./logger";
import { RedisConfig } from '../types';

class RedisClient {
  private client: Redis;

  constructor() {
    const config: RedisConfig = {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    if (env.REDIS_URL) {
      this.client = new Redis(env.REDIS_URL, config);
    } else {
      const redisConfig = {
        host: "localhost",
        port: 6379,
        db: 0,
        ...config,
      };

      this.client = new Redis(redisConfig);
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      AppLogger.info("Redis connected successfully", {
        service: "api-gateway",
        component: "redis-client",
      });
    });

    this.client.on("ready", () => {
      AppLogger.info("Redis is ready to receive commands", {
        service: "api-gateway",
        component: "redis-client",
        status: "ready",
      });
    });

    this.client.on("error", (error: Error) => {
      AppLogger.error("Redis connection error", {
        service: "api-gateway",
        component: "redis-client",
        error: error.message,
        stack: error.stack,
      });
    });

    this.client.on("close", () => {
      AppLogger.warn("Redis connection closed", {
        service: "api-gateway",
        component: "redis-client",
      });
    });

    this.client.on("reconnecting", () => {
      AppLogger.info("Redis reconnecting...", {
        service: "api-gateway",
        component: "redis-client",
        status: "reconnecting",
      });
    });
  }

  public getClient(): Redis {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
    AppLogger.info("Redis disconnected", {
      service: "api-gateway",
      component: "redis-client",
      status: "disconnected",
    });
  }

  // Convenience methods
  public call(...args: string[]): Promise<any> {
    return (this.client as any).call(...args);
  }
}

const redisClient = new RedisClient();
export default redisClient.getClient();
