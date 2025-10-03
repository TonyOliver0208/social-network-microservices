import { Request, Response, NextFunction } from 'express';
import jwtService from '../utils/jwt';
import AppLogger from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const payload = jwtService.verifyAccessToken(token);
    
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch (error: any) {
    AppLogger.warn('Token authentication failed:', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (error.message === 'Access token expired') {
      res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware to authenticate optional JWT tokens (for endpoints that work with or without auth)
 */
export const authenticateOptional = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const payload = jwtService.verifyAccessToken(token);
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role
        };
      } catch (error) {
        // Log but don't fail - optional authentication
        AppLogger.debug('Optional authentication failed:', { error });
      }
    }

    next();
  } catch (error) {
    // Optional authentication should never fail the request
    AppLogger.error('Unexpected error in optional auth:', { error });
    next();
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has any of the required roles
 */
export const requireAnyRole = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const hasRole = requiredRoles.includes(req.user.role) || req.user.role === 'admin';
    
    if (!hasRole) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to verify refresh token specifically
 */
export const authenticateRefreshToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
      return;
    }

    // Verify token signature and structure
    const payload = jwtService.verifyRefreshToken(refreshToken);
    
    // Verify token exists in database and is not revoked
    const isValid = await jwtService.validateRefreshTokenInDB(refreshToken);
    
    if (!isValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid or revoked refresh token'
      });
      return;
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch (error: any) {
    AppLogger.warn('Refresh token authentication failed:', {
      error: error.message,
      ip: req.ip
    });

    if (error.message === 'Refresh token expired') {
      res.status(401).json({
        success: false,
        message: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

export default {
  authenticateToken,
  authenticateOptional,
  requireRole,
  requireAnyRole,
  authenticateRefreshToken
};