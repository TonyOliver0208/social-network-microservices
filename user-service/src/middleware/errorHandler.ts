import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '@/utils/logger';
import { APIResponse, ErrorResponse } from '@/types';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export class APIError extends Error implements CustomError {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.name = 'APIError';

    Error.captureStackTrace(this, this.constructor);
  }
}

export const throwValidationError = (message: string): never => {
  throw new APIError(400, message);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle different types of errors
const handleCastErrorDB = (err: any): APIError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new APIError(400, message);
};

const handleDuplicateFieldsDB = (err: any): APIError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'duplicate value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new APIError(400, message);
};

const handleValidationErrorDB = (err: any): APIError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new APIError(400, message);
};

const handleJWTError = (): APIError =>
  new APIError(401, 'Invalid token. Please log in again!');

const handleJWTExpiredError = (): APIError =>
  new APIError(401, 'Your token has expired! Please log in again.');

const handleZodError = (err: z.ZodError): APIError => {
  const errors = err.errors.map(error => {
    return `${error.path.join('.')}: ${error.message}`;
  });
  const message = `Validation error. ${errors.join('. ')}`;
  return new APIError(400, message);
};

const sendErrorDev = (err: CustomError, req: Request, res: Response): void => {
  const requestId = req.headers['x-request-id'] as string;
  
  logger.error('Development error', {
    requestId,
    error: err.message,
    stack: err.stack || undefined,
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method
  });

  const errorResponse: ErrorResponse = {
    success: false,
    message: err.message,
    error: err.message,
    stack: err.stack || undefined,
    timestamp: new Date().toISOString(),
    requestId
  };

  res.status(err.statusCode || 500).json(errorResponse);
};

const sendErrorProd = (err: CustomError, req: Request, res: Response): void => {
  const requestId = req.headers['x-request-id'] as string;
  
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    logger.error('Operational error', {
      requestId,
      error: err.message,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method
    });

    const errorResponse: ErrorResponse = {
      success: false,
      message: err.message,
      error: err.message,
      timestamp: new Date().toISOString(),
      requestId
    };

    res.status(err.statusCode || 500).json(errorResponse);
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Programming error', {
      requestId,
      error: err.message,
      stack: err.stack || undefined,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method
    });

    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Something went wrong!',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId
    };

    res.status(500).json(errorResponse);
  }
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: CustomError = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error for monitoring
  logger.error('Error caught in global handler', {
    requestId: req.headers['x-request-id'] as string,
    error: err.message,
    stack: err.stack || undefined,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Handle specific error types
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err instanceof z.ZodError) error = handleZodError(err);

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};