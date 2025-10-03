import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import AppLogger from "@/utils/logger";
import { APIResponse, ErrorResponse } from "@/types";

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

class AppError extends Error implements CustomError {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Your token has expired! Please log in again.", 401);

const handleZodError = (err: z.ZodError): AppError => {
  const errors = err.errors.map((error) => {
    return `${error.path.join(".")}: ${error.message}`;
  });
  const message = `Validation error. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: CustomError, req: Request, res: Response): void => {
  const requestId = req.headers["x-request-id"] as string;

  AppLogger.error("Development error", {
    requestId,
    error: err.message,
    stack: err.stack || undefined,
    statusCode: err.statusCode,
    url: req.originalUrl,
    method: req.method,
  });

  const errorResponse: ErrorResponse = {
    success: false,
    message: err.message,
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    requestId,
  };

  res.status(err.statusCode || 500).json(errorResponse);
};

const sendErrorProd = (err: CustomError, req: Request, res: Response): void => {
  const requestId = req.headers["x-request-id"] as string;

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    AppLogger.error("Operational error", {
      requestId,
      error: err.message,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
    });

    const errorResponse: ErrorResponse = {
      success: false,
      message: err.message,
      error: err.message,
      timestamp: new Date().toISOString(),
      requestId,
    };

    res.status(err.statusCode || 500).json(errorResponse);
  } else {
    // Programming or other unknown error: don't leak error details
    AppLogger.error("Programming error", {
      requestId,
      error: err.message,
      stack: err.stack || undefined,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
    });

    const errorResponse: ErrorResponse = {
      success: false,
      message: "Something went wrong!",
      error: "Internal server error",
      timestamp: new Date().toISOString(),
      requestId,
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

  AppLogger.error("Error caught in global handler", {
    requestId: req.headers["x-request-id"] as string,
    error: err.message,
    stack: err.stack || undefined,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (err instanceof z.ZodError) error = handleZodError(err);

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export { AppError };
