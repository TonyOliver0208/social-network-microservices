import { Request, Response, NextFunction } from 'express';
import AppLogger from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const requestId = req.headers['x-request-id'];
    const correlationId = req.headers['x-correlation-id'];
    const logMeta: any = {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };
    
    if (requestId) {
      logMeta.requestId = Array.isArray(requestId) ? requestId[0] : requestId;
    }
    
    if (correlationId) {
      logMeta.correlationId = Array.isArray(correlationId) ? correlationId[0] : correlationId;
    }
    
    if ((req as any).user?.userId) {
      logMeta.userId = (req as any).user.userId;
    }
    
    AppLogger.http(`${req.method} ${req.originalUrl}`, logMeta);
  });
  next();
}