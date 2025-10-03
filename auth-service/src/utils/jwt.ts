import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken';
import AppLogger from './logger';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tokenType: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

class JwtService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    // Import config here to avoid circular dependency
    const { config } = require('../config');
    this.accessTokenSecret = config.jwt.accessSecret;
    this.refreshTokenSecret = config.jwt.refreshSecret;
    this.accessTokenExpiry = config.jwt.accessExpiry;
    this.refreshTokenExpiry = config.jwt.refreshExpiry;
  }

  generateAccessToken(payload: Omit<JwtPayload, 'tokenType'>): string {
    try {
      const tokenPayload: JwtPayload = {
        ...payload,
        tokenType: 'access'
      };

      return jwt.sign(tokenPayload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry as any,
        issuer: 'devcoll-auth-service',
        audience: 'devcoll-api-gateway',
        subject: payload.userId
      });
    } catch (error) {
      AppLogger.error('Error generating access token:', { error });
      throw new Error('Failed to generate access token');
    }
  }

  generateRefreshToken(payload: Omit<JwtPayload, 'tokenType'>): string {
    try {
      const tokenPayload: JwtPayload = {
        ...payload,
        tokenType: 'refresh'
      };

      return jwt.sign(tokenPayload, this.refreshTokenSecret, {
        expiresIn: this.refreshTokenExpiry as any,
        issuer: 'devcoll-auth-service',
        audience: 'devcoll-api-gateway',
        subject: payload.userId
      });
    } catch (error) {
      AppLogger.error('Error generating refresh token:', { error });
      throw new Error('Failed to generate refresh token');
    }
  }

  async generateTokenPair(userId: string, email: string, role: string): Promise<TokenPair> {
    try {
      const payload = { userId, email, role };
      
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      await RefreshToken.create({
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + this.parseExpiry(this.refreshTokenExpiry))
      });

      const decoded = jwt.decode(accessToken) as any;
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
      };
    } catch (error) {
      AppLogger.error('Error generating token pair:', { error });
      throw new Error('Failed to generate token pair');
    }
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret) as JwtPayload;
      
      if (payload.tokenType !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      }
      throw error;
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret) as JwtPayload;
      
      if (payload.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  async validateRefreshTokenInDB(token: string): Promise<boolean> {
    try {
      const refreshToken = await RefreshToken.findOne({ 
        token, 
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      });

      return !!refreshToken;
    } catch (error) {
      AppLogger.error('Error validating refresh token in DB:', { error });
      return false;
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      await RefreshToken.updateOne(
        { token },
        { 
          isRevoked: true,
          revokedAt: new Date()
        }
      );
    } catch (error) {
      AppLogger.error('Error revoking refresh token:', { error });
      throw new Error('Failed to revoke refresh token');
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await RefreshToken.updateMany(
        { userId, isRevoked: false },
        { 
          isRevoked: true,
          revokedAt: new Date()
        }
      );
    } catch (error) {
      AppLogger.error('Error revoking all user tokens:', { error });
      throw new Error('Failed to revoke user tokens');
    }
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  private parseExpiry(expiry: string): number {
    const value = parseInt(expiry.slice(0, -1));
    const unit = expiry.slice(-1);
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 15 * 60 * 1000;
    }
  }

}

export const jwtService = new JwtService();
export default jwtService;