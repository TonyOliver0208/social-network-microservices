import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let requestId = req.headers["x-request-id"] as string;

  if (!requestId) {
    requestId = `auth_${Date.now()}_${uuidv4().split("-")[0]}`;
  }

  if (Array.isArray(requestId)) {
    requestId = requestId[0];
  }

  req.headers["x-request-id"] = requestId;

  res.setHeader("x-request-id", requestId);

  (req as any).requestId = requestId;

  next();
};

/**
 * Correlation ID Middleware for Microservices
 * Ensures request tracing across multiple services
 */
export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const correlationId = (req.headers["x-correlation-id"] as string) || uuidv4();

  req.headers["x-correlation-id"] = correlationId;

  res.setHeader("x-correlation-id", correlationId);

  (req as any).correlationId = correlationId;

  next();
};
