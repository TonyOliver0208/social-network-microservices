import cors from "cors";
import { createCorsConfig } from "@/config/cors";

/**
 * CORS middleware factory
 */
export function createCorsMiddleware(
  environment: string = process.env.NODE_ENV || "development"
) {
  const corsConfig = createCorsConfig(environment);
  return cors(corsConfig);
}

/**
 * Pre-configured CORS middleware for current environment
 */
export const corsMiddleware = createCorsMiddleware();

export default {
  createCorsMiddleware,
  corsMiddleware,
};
