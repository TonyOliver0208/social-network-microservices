import { z } from "zod";
import AppLogger from "@/utils/logger";

export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  PORT: z.string().transform(Number).default("4000"),

  AUTH_SERVICE_URL: z.string().url("Auth Service URL is required"),
  JWT_SECRET: z.string().min(32, "JWT Secret must be at least 32 characters"),
  GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),

  IDENTITY_SERVICE_URL: z.string().url("Invalid Identity Service URL"),
  POST_SERVICE_URL: z.string().url("Invalid Post Service URL"),
  MEDIA_SERVICE_URL: z.string().url("Invalid Media Service URL"),
  SEARCH_SERVICE_URL: z.string().url("Invalid Search Service URL"),

  REDIS_URL: z.string().optional(),
  RABBITMQ_URL: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000"), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100"),

  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  REQUEST_TIMEOUT: z.string().transform(Number).default("30000"), // 30 seconds

  // CLIENT_URL: z.string().url().optional()
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(): Environment {
  try {
    const env = environmentSchema.parse(process.env);

    AppLogger.info("Environment configuration validated successfully", {
      environment: env.NODE_ENV,
      port: env.PORT,
      logLevel: env.LOG_LEVEL,
      services: {
        auth: env.AUTH_SERVICE_URL,
        identity: env.IDENTITY_SERVICE_URL,
        post: env.POST_SERVICE_URL,
        media: env.MEDIA_SERVICE_URL,
        search: env.SEARCH_SERVICE_URL,
      },
    });

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      AppLogger.error("❌ Environment validation failed", {
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });

      AppLogger.error("🔥 Environment Configuration Errors", {
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
        context: "environment_validation",
      });
    } else {
      AppLogger.error("❌ Unknown environment validation error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    process.exit(1);
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(env: Environment) {
  const isProduction = env.NODE_ENV === "production";
  const isDevelopment = env.NODE_ENV === "development";

  return {
    // Server configuration
    server: {
      port: env.PORT,
      timeout: env.REQUEST_TIMEOUT,
      gracefulShutdownTimeout: 30000,
    },

    security: {
      helmet: {
        contentSecurityPolicy: !isDevelopment,
        hsts: isProduction,
        noSniff: true,
        frameguard: { action: "deny" },
      },
    },

    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
    },

    services: {
      auth: env.AUTH_SERVICE_URL,
      identity: env.IDENTITY_SERVICE_URL,
      post: env.POST_SERVICE_URL,
      media: env.MEDIA_SERVICE_URL,
      search: env.SEARCH_SERVICE_URL,
    },

    features: {
      requestLogging: true,
      metricsCollection: isProduction,
      detailedErrors: isDevelopment,
    },
  };
}

export const env = validateEnvironment();
export const config = getEnvironmentConfig(env);

export default { env, config, validateEnvironment, getEnvironmentConfig };
