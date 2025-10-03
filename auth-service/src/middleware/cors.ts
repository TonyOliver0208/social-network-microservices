import cors from 'cors';
import { createCorsConfig } from '../config/cors';
import { env } from '../config/environment';

/**
 * CORS middleware factory
 */
export function createCorsMiddleware(environment: string = env.NODE_ENV) {
  const corsConfig = createCorsConfig(environment);
  return cors(corsConfig);
}

/**
 * Pre-configured CORS middleware for current environment
 */
export const corsMiddleware = createCorsMiddleware();

export default {
  createCorsMiddleware,
  corsMiddleware
};