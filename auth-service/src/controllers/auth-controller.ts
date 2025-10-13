import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import jwtService from '../utils/jwt';
import AppLogger from '../utils/logger';
import { 
  GoogleTokenRequest, 
  RefreshTokenRequest, 
  AuthResponse, 
  JwtPayload 
} from '../types';

class AuthController {
  private googleClient: OAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is required');
    }
    this.googleClient = new OAuth2Client(clientId);
  }

  /**
   * Main endpoint for NextAuth integration - validates Google tokens
   */
  async validateGoogleToken(req: GoogleTokenRequest, res: Response<AuthResponse>): Promise<void> {
    try {
      const { token, tokenType = 'id_token' } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token is required'
        });
        return;
      }

      // Validate Google token
      let googleUser: any;
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
          throw new Error('Google Client ID not configured');
        }
        
        // Ensure googleClient is initialized
        if (!this.googleClient) {
          throw new Error('Google OAuth client not initialized');
        }
        
        AppLogger.info('Validating Google token', { 
          tokenLength: token.length,
          clientId: clientId.substring(0, 20) + '...',
          hasGoogleClient: !!this.googleClient
        });
        
        const ticket = await this.googleClient.verifyIdToken({
          idToken: token,
          audience: clientId,
        });
        googleUser = ticket.getPayload();
        
        AppLogger.info('Google token validation successful', {
          email: googleUser?.email,
          sub: googleUser?.sub
        });
      } catch (error: any) {
        AppLogger.warn('Google token validation failed', { 
          error: error.message,
          stack: error.stack,
          hasGoogleClient: !!this.googleClient
        });
        res.status(401).json({
          success: false,
          message: 'Invalid Google token'
        });
        return;
      }

      if (!googleUser) {
        res.status(401).json({
          success: false,
          message: 'Invalid Google token payload'
        });
        return;
      }

      // Find or create user
      let user = await User.findOne({ 
        $or: [
          { email: googleUser.email },
          { googleId: googleUser.sub }
        ]
      });

      if (!user) {
        user = new User({
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          googleId: googleUser.sub,
          role: 'user',
          isEmailVerified: true,
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await user.save();
        AppLogger.info('New user created', { userId: user._id.toString(), email: user.email });
      } else {
        // Update user info
        user.name = googleUser.name;
        user.picture = googleUser.picture;
        user.lastLoginAt = new Date();
        user.updatedAt = new Date();
        await user.save();
        AppLogger.info('User updated on login', { userId: user._id.toString(), email: user.email });
      }

      // Generate internal tokens
      const accessToken = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          tokenType: 'access' as const
        } as JwtPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );      const refreshTokenValue = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          tokenType: 'refresh' as const
        } as JwtPayload,
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      );

      // Store refresh token
      await RefreshToken.create({
        token: refreshTokenValue,
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        createdAt: new Date()
      });

      AppLogger.info('Google token validated successfully', { 
        userId: user._id.toString(), 
        email: user.email 
      });

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken: refreshTokenValue,
          tokenType: 'Bearer',
          expiresIn: 900, // 15 minutes
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          }
        }
      });

    } catch (error: any) {
      AppLogger.error('Token validation error', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(req: RefreshTokenRequest, res: Response<AuthResponse>): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }

      // Validate refresh token
      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
      } catch (error) {
        res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
        return;
      }

      // Check if refresh token exists in database
      const storedToken = await RefreshToken.findOne({ 
        token: refreshToken,
        userId: decoded.userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (!storedToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not found or expired'
        });
        return;
      }

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
        return;
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          tokenType: 'access' as const
        } as JwtPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      AppLogger.info('Token refreshed successfully', { userId: user._id.toString() });

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          tokenType: 'Bearer',
          expiresIn: 900
        }
      });

    } catch (error: any) {
      AppLogger.error('Token refresh error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }



  /**
   * Logout and invalidate refresh token
   */
  async logout(req: RefreshTokenRequest, res: Response<AuthResponse>): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Deactivate refresh token
        await RefreshToken.updateOne(
          { token: refreshToken },
          { isActive: false, updatedAt: new Date() }
        );
        AppLogger.info('Refresh token deactivated during logout');
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error: any) {
      AppLogger.error('Logout error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Logout from all devices - revoke all refresh tokens for user
   */
  async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required'
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token not provided'
        });
        return;
      }
      
      const decoded = jwtService.verifyAccessToken(token);

      // Revoke all refresh tokens for this user
      await jwtService.revokeAllUserTokens(decoded.userId);

      AppLogger.info('User logged out from all devices', { 
        userId: decoded.userId,
        email: decoded.email
      });

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });

    } catch (error: any) {
      AppLogger.error('Logout all error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get current user profile from token
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required'
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Token not provided'
        });
        return;
      }
      
      const decoded = jwtService.verifyAccessToken(token);

      // Get user details from database
      const user = await User.findById(decoded.userId).select('-__v');
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            picture: user.picture,
            role: user.role,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });

    } catch (error: any) {
      AppLogger.error('Get current user error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }



  /**
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection by counting users
      const userCount = await User.countDocuments();
      
      res.json({
        status: 'healthy',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        dependencies: {
          database: {
            status: 'connected',
            userCount
          },
          google: {
            status: 'configured',
            clientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing'
          }
        }
      });
    } catch (error: any) {
      AppLogger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }
}

export default new AuthController();