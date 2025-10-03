import type { HelmetOptions } from 'helmet';

/**
 * Content Security Policy directives
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  scriptSrc: ["'self'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https:"],
  fontSrc: ["'self'", "https:"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"]
};

/**
 * Security headers configuration by environment
 */
export function getSecurityConfig(environment: string = 'development'): HelmetOptions {
  const isProduction = environment === 'production';
  const isDevelopment = environment === 'development';

  return {
    contentSecurityPolicy: isDevelopment ? false : { directives: CSP_DIRECTIVES },
    crossOriginEmbedderPolicy: false,
    hsts: isProduction ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false,
    noSniff: true,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  };
}


/**
 * Custom security headers
 */
export function getCustomHeaders(serviceName: string, environment: string) {
  return {
    'X-API-Version': '1.0.0',
    'X-Service-Name': serviceName,
    'X-Environment': environment
  };
}


export default {
  getSecurityConfig,
  getCustomHeaders,
  CSP_DIRECTIVES
};