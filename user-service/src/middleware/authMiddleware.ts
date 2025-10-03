import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AuthenticatedRequest, InternalJWTPayload, APIResponse } from '@/types';
import logger from '@/utils/logger';

// Environment validation
const envSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT Secret must be at least 32 characters'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development')
});

const env = envSchema.parse(process.env);

/**
 * Internal JWT Validation Middleware
 * 
 * This middleware validates internal JWTs issued by the API Gateway
 * after OAuth token exchange. It does NOT handle OAuth tokens directly.
 * 
 * Enterprise features:
 * - Validates JWT signature and claims
 * - Checks issuer and audience
 * - Comprehensive error handling and logging
 * - Request tracking and monitoring
 * - Type-safe payload extraction
 */

class InternalAuthService {
  private static instance: InternalAuthService;
  private readonly jwtSecret: string;

  private constructor() {
    this.jwtSecret = env.JWT_SECRET;
  }

  public static getInstance(): InternalAuthService {
    if (!InternalAuthService.instance) {
      InternalAuthService.instance = new InternalAuthService();
    }
    return InternalAuthService.instance;
  }

  /**
   * Validates internal JWT token from API Gateway
   */
  public validateInternalToken(token: string): InternalJWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ['HS256'],
        issuer: 'devcoll-api-gateway',
        audience: 'devcoll-microservices'
      });

      // Validate payload structure
      const payload = decoded as InternalJWTPayload;
      
      if (!payload.userId || !payload.email || !payload.name) {
        logger.warn('Invalid internal token payload structure', {
          hasUserId: !!payload.userId,
          hasEmail: !!payload.email,
          hasName: !!payload.name
        });
        return null;
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Internal JWT validation failed', {
          error: error.message,
          name: error.name
        });
      } else {
        logger.error('Internal JWT validation error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      return null;
    }
  }

  /**
   * Checks if user has specific permission
   */
  public hasPermission(user: InternalJWTPayload, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Checks if user has specific role
   */
  public hasRole(user: InternalJWTPayload, role: string): boolean {
    return user.roles.includes(role);
  }
}

// Singleton instance
const authService = InternalAuthService.getInstance();

/**
 * Middleware to validate internal JWT tokens
 */
export const validateInternalToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  try {
    // Extract internal token from x-internal-token header
    const internalToken = req.headers['x-internal-token'] as string;

    if (!internalToken) {
      logger.warn('Internal auth middleware: No token provided', { 
        requestId,
        url: req.originalUrl,
        method: req.method
      });
      
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No internal token provided',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
      return;
    }

    // Validate the internal token
    const payload = authService.validateInternalToken(internalToken);
    
    if (!payload) {
      logger.warn('Internal auth middleware: Invalid token', { 
        requestId,
        url: req.originalUrl,
        method: req.method
      });
      
      res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
        error: 'Token validation failed',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
      return;
    }

    // Attach user info to request
    req.user = payload;

    const duration = Date.now() - startTime;
    logger.info('Internal token validated successfully', {
      requestId,
      userId: payload.userId,
      email: payload.email,
      duration: `${duration}ms`,
      url: req.originalUrl,
      method: req.method
    });

    next();

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Internal auth middleware error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
      url: req.originalUrl,
      method: req.method
    });

    res.status(500).json({
      success: false,
      message: 'Authentication service error',
      error: env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId
    } as APIResponse);
  }
};

/**
 * Middleware to check specific permission
 */
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    
    if (!req.user) {
      logger.warn('Permission middleware: No user in request', { requestId, permission });
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No authenticated user',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
      return;
    }

    if (!authService.hasPermission(req.user, permission)) {
      logger.warn('Permission middleware: Access denied', { 
        requestId, 
        permission,
        userId: req.user.userId,
        userPermissions: req.user.permissions
      });
      
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: `Permission '${permission}' required`,
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
      return;
    }

    logger.debug('Permission granted', { 
      requestId, 
      permission,
      userId: req.user.userId
    });
    
    next();
  };
};

/**
 * Middleware to check specific role
 */
export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    
    if (!req.user) {
      logger.warn('Role middleware: No user in request', { requestId, role });
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No authenticated user',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
      return;
    }

    if (!authService.hasRole(req.user, role)) {
      logger.warn('Role middleware: Access denied', { 
        requestId, 
        role,
        userId: req.user.userId,
        userRoles: req.user.roles
      });
      
      res.status(403).json({
        success: false,
        message: 'Insufficient privileges',
        error: `Role '${role}' required`,
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
      return;
    }

    logger.debug('Role granted', { 
      requestId, 
      role,
      userId: req.user.userId
    });
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Validates token if present but doesn't require it
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const internalToken = req.headers['x-internal-token'] as string;
  
  if (internalToken) {
    const payload = authService.validateInternalToken(internalToken);
    if (payload) {
      req.user = payload;
    }
  }
  
  next();
};

export default authService;