import type { CorsOptions } from "cors";
import AppLogger from "@/utils/logger";

interface CorsConfig {
  development: string[];
  staging: string[];
  production: string[];
}

export const CORS_ORIGINS: CorsConfig = {
  development: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:4000",
    "http://localhost:4001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:4001",
    "http://127.0.0.1:4000",
    "http://127.0.0.1:4001",
  ],
  staging: [
    "https://staging-devcoll.com",
    "https://staging-client.devcoll.com",
  ],
  production: [
    "https://devcoll.com",
    "https://www.devcoll.com",
    "https://client.devcoll.com",
  ],
};

export const CORS_CONFIG = {
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
    "X-API-Key",
    "X-Request-ID",
    "X-Correlation-ID",
    "X-Source",
    "X-Internal-Token",
    "X-User-ID",
    "X-User-Email",
    "X-User-Role",
  ],
  exposedHeaders: [
    "X-Request-ID",
    "X-Correlation-ID",
    "X-Rate-Limit-Remaining",
    "X-Rate-Limit-Reset",
  ],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

/**
 * Get CORS origins based on environment
 */
export function getCorsOrigins(environment: string): string[] {
  const env = environment as keyof CorsConfig;
  return CORS_ORIGINS[env] || CORS_ORIGINS.development;
}

/**
 * Create CORS configuration with origin validation
 */
export function createCorsConfig(
  environment: string = "development"
): CorsOptions {
  const origins = getCorsOrigins(environment);

  const corsOptions: CorsOptions = {
    ...CORS_CONFIG,
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl requests)
      if (!origin) {
        return callback(null, true);
      }

      if (origins.includes(origin)) {
        AppLogger.debug("CORS: Origin allowed", { origin, environment });
        callback(null, true);
      } else {
        AppLogger.warn("CORS: Origin blocked", {
          origin,
          environment,
          allowedOrigins: origins,
        });
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
  };

  AppLogger.info("CORS configuration initialized", {
    environment,
    allowedOrigins: origins,
    credentialsEnabled: corsOptions.credentials,
    service: process.env.SERVICE_NAME || "api-gateway",
  });

  return corsOptions;
}
