import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types/AuthenticatedRequest';
import { APIResponse } from '@/types/APIResponse';
import AppLogger from '@/utils/logger';
import jwtService from '@/utils/jwt';

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || 'unknown';

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/, '');

    if (!token) {
      AppLogger.warn('Auth middleware: No token provided', { 
        requestId,
        path: req.path,
        method: req.method 
      });
      
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No authorization token provided',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
      return;
    }

    const decoded = jwtService.verifyInternalToken(token);
    
    if (!decoded) {
      AppLogger.warn('Auth middleware: Invalid token', { 
        requestId,
        path: req.path,
        method: req.method 
      });
      
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'Token validation failed',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      role: decoded.role
    };

    const duration = Date.now() - startTime;
    AppLogger.info('Auth middleware: Token validated successfully', {
      requestId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      path: req.path,
      method: req.method,
      duration: `${duration}ms`
    });

    next();

  } catch (error) {
    const duration = Date.now() - startTime;
    
    AppLogger.error('Auth middleware: Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      path: req.path,
      method: req.method,
      duration: `${duration}ms`
    });

    res.status(500).json({
      success: false,
      message: 'Authentication service error',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId
    } as APIResponse);
  }
};

export default {
  requireAuth
};
