import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import AppLogger from '../utils/logger';
import { AuthenticatedRequest } from '../types';

/**
 * JWT token validation middleware
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    jwt.verify(token, env.JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) {
        AppLogger.warn('Invalid access token:', {
          error: err.message,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });

        res.status(403).json({
          success: false,
          message: 'Invalid or expired access token',
          error: 'INVALID_TOKEN'
        });
        return;
      }

      if (decoded && typeof decoded === 'object') {
        req.user = decoded as AuthenticatedRequest['user'];
      }
      next();
    });
  } catch (error) {
    AppLogger.error('Authentication middleware error:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTH_ERROR'
    });
  }
}

/**
 * Refresh token validation middleware
 */
export function authenticateRefreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required',
        error: 'MISSING_REFRESH_TOKEN'
      });
      return;
    }

    jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, (err: jwt.VerifyErrors | null, decoded: any) => {
      if (err) {
        AppLogger.warn('Invalid refresh token:', {
          error: err.message,
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });

        res.status(403).json({
          success: false,
          message: 'Invalid or expired refresh token',
          error: 'INVALID_REFRESH_TOKEN'
        });
        return;
      }

      if (decoded && typeof decoded === 'object') {
        req.user = decoded as AuthenticatedRequest['user'];
      }
      next();
    });
  } catch (error) {
    AppLogger.error('Refresh token middleware error:', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: 'AUTH_ERROR'
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded as AuthenticatedRequest['user'];
    }
    next();
  });
}

export default {
  authenticateToken,
  authenticateRefreshToken,
  optionalAuth
};