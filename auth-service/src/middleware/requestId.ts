import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware for Microservices
 * Generates unique request IDs for tracking and debugging
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Check if request ID already exists (from API Gateway or client)
  let requestId = req.headers['x-request-id'] as string;
  
  // Generate new request ID if not provided
  if (!requestId) {
    requestId = `auth_${Date.now()}_${uuidv4().split('-')[0]}`;
  }
  
  // Ensure it's a string and not an array
  if (Array.isArray(requestId)) {
    requestId = requestId[0];
  }
  
  // Add request ID to request headers for downstream services
  req.headers['x-request-id'] = requestId;
  
  // Add request ID to response headers for debugging
  res.setHeader('x-request-id', requestId);
  
  // Add request ID to request object for easy access
  (req as any).requestId = requestId;
  
  next();
};

/**
 * Correlation ID Middleware for Microservices
 * Ensures request tracing across multiple services
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  
  // Add to request headers
  req.headers['x-correlation-id'] = correlationId;
  
  // Add to response headers
  res.setHeader('x-correlation-id', correlationId);
  
  // Add to request object
  (req as any).correlationId = correlationId;
  
  next();
};