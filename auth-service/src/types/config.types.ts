export type Environment = "development" | "staging" | "production";

export type LogLevel = "error" | "warn" | "info" | "debug";

export type RateLimitType =
  | "general"
  | "strict"
  | "ultra"
  | "login"
  | "refresh";

export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

export interface LogMeta {
  [key: string]: any;
  service?: string;
  component?: string;
  userId?: string;
  requestId?: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
  error?: string | unknown;
  stack?: string | undefined;
}
