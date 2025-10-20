/* eslint-disable */
/**
 * Auto-generated from auth.proto
 * DO NOT EDIT MANUALLY
 */
import { Observable } from 'rxjs';

export const AUTH_PACKAGE_NAME = 'auth';

export interface RegisterRequest {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export interface User {
  id?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface ValidateTokenRequest {
  token?: string;
}

export interface ValidateTokenResponse {
  valid?: boolean;
  userId?: string;
  email?: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface LogoutRequest {
  userId?: string;
}

export interface LogoutResponse {
  success?: boolean;
}

export interface ResetPasswordRequest {
  email?: string;
}

export interface ResetPasswordResponse {
  success?: boolean;
  message?: string;
}

export interface AuthService {
  Register(request: RegisterRequest): Observable<AuthResponse>;
  Login(request: LoginRequest): Observable<AuthResponse>;
  ValidateToken(request: ValidateTokenRequest): Observable<ValidateTokenResponse>;
  RefreshToken(request: RefreshTokenRequest): Observable<AuthResponse>;
  Logout(request: LogoutRequest): Observable<LogoutResponse>;
  ResetPassword(request: ResetPasswordRequest): Observable<ResetPasswordResponse>;
}

export const AUTHSERVICE_SERVICE_NAME = 'AuthService';

