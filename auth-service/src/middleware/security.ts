import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';
import { getSecurityConfig, getCustomHeaders } from '../config/security';
import { env } from '../config/environment';
import AppLogger from '../utils/logger';

/**
 * Helmet middleware factory
 */
export function createHelmetMiddleware(environment: string = env.NODE_ENV) {
  const helmetConfig = getSecurityConfig(environment);
  return helmet(helmetConfig);
}

/**
 * Custom security headers middleware
 */
export function customHeadersMiddleware(serviceName: string = 'auth-service') {
  return (req: Request, res: Response, next: NextFunction) => {
    const environment = env.NODE_ENV;
    const headers = getCustomHeaders(serviceName, environment);
    
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    const requestId = Array.isArray(req.headers['x-request-id']) 
      ? req.headers['x-request-id'][0] 
      : req.headers['x-request-id'];
      
    AppLogger.debug('Security headers applied', { 
      service: serviceName, 
      environment,
      ...(requestId && { requestId })
    });
    
    next();
  };
}

/**
 * Pre-configured helmet middleware for current environment
 */
export const helmetMiddleware = createHelmetMiddleware();

/**
 * Pre-configured custom headers middleware
 */
export const defaultCustomHeaders = customHeadersMiddleware();

export default {
  createHelmetMiddleware,
  customHeadersMiddleware,
  helmetMiddleware,
  defaultCustomHeaders
};