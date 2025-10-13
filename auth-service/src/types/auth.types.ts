import { Request } from "express";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tokenType: "access" | "refresh";
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthenticatedRequest extends Request {
  user?:
    | {
        id: string;
        email: string;
        role?: string;
        iat?: number;
        exp?: number;
      }
    | undefined;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export type TokenType = "access" | "refresh";
