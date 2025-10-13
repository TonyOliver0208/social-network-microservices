import mongoose from "mongoose";

export type UserRole = "user" | "admin" | "moderator";

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
  location?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface UserMetadata {
  signupSource: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
}

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  preferences?: UserPreferences;
  metadata?: UserMetadata;
}

export interface IRefreshToken extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceId?: string;
    platform?: string;
  };
}
