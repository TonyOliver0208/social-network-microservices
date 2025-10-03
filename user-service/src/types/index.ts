import { Request } from 'express';
import { Document, Types } from 'mongoose';

// Internal JWT Types (from API Gateway)
export interface InternalJWTPayload {
  userId: string;
  email: string;
  name: string;
  picture?: string | undefined;
  roles: string[];
  permissions: string[];
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: InternalJWTPayload;
}

// User Types with proper static methods interface
export interface IUserMethods {
  updateLastActive(): Promise<IUser>;
  updateReputation(points: number): Promise<IUser>;
  hasPermission(permission: string): boolean;
  hasRole(role: string): boolean;
  getPublicProfile(): any;
}

export interface IUserStatics {
  findByGoogleId(googleId: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  getTopUsers(limit?: number): Promise<IUser[]>;
}

export interface IUser extends Document, IUserMethods {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  username?: string;
  bio?: string;
  reputation: number;
  isEmailVerified: boolean;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      answers: boolean;
      comments: boolean;
      mentions: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      showEmail: boolean;
      showActivity: boolean;
    };
  };
  profile: {
    github?: string;
    linkedin?: string;
    website?: string;
    location?: string;
    skills: string[];
    experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface ErrorResponse extends APIResponse {
  success: false;
  error: string;
  stack?: string | undefined;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Validation Schemas
export interface CreateUserInput {
  googleId: string;
  email: string;
  name: string;
  picture?: string | undefined;
}

export interface UpdateUserInput {
  name?: string;
  username?: string;
  bio?: string;
  picture?: string;
  preferences?: Partial<IUser['preferences']>;
  profile?: Partial<IUser['profile']>;
}

export interface UserQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
  isActive?: string;
  sortBy?: 'createdAt' | 'reputation' | 'lastActiveAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Environment Types
export interface Environment {
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: string;
  JWT_SECRET: string;
  MONGODB_URI: string;
  REDIS_URL?: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: string;
  RATE_LIMIT_MAX_REQUESTS: string;
  
  // Monitoring
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  REQUEST_TIMEOUT: string;
}

// Utility Types
export interface DatabaseConfig {
  uri: string;
  options: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
    heartbeatFrequencyMS?: number;
  };
}

export interface CacheConfig {
  ttl: number;
  max: number;
  updateAgeOnGet: boolean;
}

// Service Response Types
export interface UserServiceResponse extends APIResponse {
  data?: {
    user?: IUser;
    users?: IUser[];
    pagination?: PaginatedResponse<IUser>['pagination'];
  };
}

// Authentication Types
export interface TokenValidationResult {
  isValid: boolean;
  payload?: InternalJWTPayload;
  error?: string;
}