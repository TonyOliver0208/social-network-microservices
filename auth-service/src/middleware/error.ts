import { Request, Response, NextFunction } from 'express';
import AppLogger from '../utils/logger';

interface ErrorWithDetails extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: ErrorWithDetails,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  AppLogger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let code = error.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Send error response
  const errorResponse: any = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString()
  };

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: error.stack,
      originalMessage: error.message
    };
  }

  // Include additional details if available
  if (error.details) {
    errorResponse.details = {
      ...errorResponse.details,
      ...error.details
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const message = `Route ${req.originalUrl} not found`;
  
  AppLogger.warn('Route not found:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    message,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
};

/**
 * Create custom API error
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Validation error helper
 */
export const createValidationError = (message: string, details?: any): ApiError => {
  return new ApiError(message, 400, 'VALIDATION_ERROR', details);
};

/**
 * Authentication error helper
 */
export const createAuthError = (message: string = 'Authentication failed'): ApiError => {
  return new ApiError(message, 401, 'AUTH_ERROR');
};

/**
 * Authorization error helper
 */
export const createAuthorizationError = (message: string = 'Insufficient permissions'): ApiError => {
  return new ApiError(message, 403, 'AUTHORIZATION_ERROR');
};

/**
 * Not found error helper
 */
export const createNotFoundError = (resource: string = 'Resource'): ApiError => {
  return new ApiError(`${resource} not found`, 404, 'NOT_FOUND');
};

/**
 * Conflict error helper
 */
export const createConflictError = (message: string, details?: any): ApiError => {
  return new ApiError(message, 409, 'CONFLICT', details);
};

/**
 * Rate limit error helper
 */
export const createRateLimitError = (message: string = 'Rate limit exceeded'): ApiError => {
  return new ApiError(message, 429, 'RATE_LIMIT_EXCEEDED');
};

export default {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  ApiError,
  createValidationError,
  createAuthError,
  createAuthorizationError,
  createNotFoundError,
  createConflictError,
  createRateLimitError
};