import { Request } from "express";

export interface GoogleTokenRequest extends Request {
  body: {
    token: string;
    tokenType?: string;
  };
}

export interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  requestId?: string;
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
