import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceResponse, JwtPayload } from '@app/common';
import { RegisterDto, LoginDto, GoogleAuthDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Initialize Google OAuth2 client
    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    if (googleClientId) {
      this.googleClient = new OAuth2Client(googleClientId);
      this.logger.log('Google OAuth2 client initialized');
    } else {
      this.logger.warn('GOOGLE_CLIENT_ID not configured - Google OAuth will not work');
    }
  }

  async register(registerDto: RegisterDto): Promise<ServiceResponse> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ email: registerDto.email }, { username: registerDto.username }],
        },
      });

      if (existingUser) {
        if (existingUser.email === registerDto.email) {
          throw new ConflictException('Email already exists');
        }
        throw new ConflictException('Username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 12);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.username);

      this.logger.log(`User registered: ${user.email}`);

      return {
        success: true,
        data: {
          user,
          ...tokens,
        },
        message: 'User registered successfully',
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  async googleAuth(googleAuthDto: GoogleAuthDto): Promise<ServiceResponse> {
    try {
      this.logger.log('🔐 [Auth Service] Google OAuth request received');
      this.logger.log(`📋 [Auth Service] Token type: ${googleAuthDto.tokenType}`);
      this.logger.log(`📋 [Auth Service] Token length: ${googleAuthDto.token?.length || 0}`);
      this.logger.log(`📋 [Auth Service] Has Google client: ${!!this.googleClient}`);
      this.logger.log(`📋 [Auth Service] Google client ID configured: ${!!this.configService.get('GOOGLE_CLIENT_ID')}`);

      if (!this.googleClient) {
        this.logger.error('❌ [Auth Service] Google OAuth is not configured');
        throw new BadRequestException('Google OAuth is not configured');
      }

      let googleUserId: string;
      let email: string;
      let name: string;
      let picture: string;
      let givenName: string;
      let familyName: string;

      // Verify Google token (supports both id_token and access_token)
      if (googleAuthDto.tokenType === 'id_token') {
        this.logger.log('🔍 [Auth Service] Verifying Google ID token...');
        
        try {
          // Verify ID token
          const ticket = await this.googleClient.verifyIdToken({
            idToken: googleAuthDto.token,
            audience: this.configService.get('GOOGLE_CLIENT_ID'),
          });

          const payload = ticket.getPayload();
          
          if (!payload) {
            this.logger.error('❌ [Auth Service] Invalid Google token - no payload');
            throw new UnauthorizedException('Invalid Google token');
          }

          googleUserId = payload.sub;
          email = payload.email || '';
          name = payload.name || email.split('@')[0];
          picture = payload.picture || '';
          givenName = payload.given_name || '';
          familyName = payload.family_name || '';

          this.logger.log(`✅ [Auth Service] Google ID token verified for user: ${email}`);
        } catch (verifyError) {
          this.logger.error('❌ [Auth Service] Google token verification failed:', verifyError.message);
          throw new UnauthorizedException(`Invalid Google token: ${verifyError.message}`);
        }
      } else {
        throw new BadRequestException('Only id_token is currently supported');
      }

      if (!email) {
        throw new UnauthorizedException('Email not provided by Google');
      }

      // Check if user exists with this Google account
      let user = await this.prisma.user.findFirst({
        where: {
          provider: 'google',
          providerId: googleUserId,
        } as any,
      }) as any;

      if (!user) {
        // Check if user exists with this email (from local registration)
        user = await this.prisma.user.findUnique({
          where: { email },
        }) as any;

        if (user) {
          // Link Google account to existing user
          this.logger.log(`Linking Google account to existing user: ${email}`);
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              provider: 'google',
              providerId: googleUserId,
              profileImage: picture || (user as any).profileImage,
              firstName: givenName || (user as any).firstName,
              lastName: familyName || (user as any).lastName,
              isVerified: true, // Google accounts are pre-verified
              lastLoginAt: new Date(),
            } as any,
          }) as any;
        } else {
          // Create new user from Google account
          this.logger.log(`Creating new user from Google account: ${email}`);
          
          // Generate unique username from email
          let username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
          let usernameExists = await this.prisma.user.findUnique({
            where: { username },
          });
          
          let counter = 1;
          while (usernameExists) {
            username = `${email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}_${counter}`;
            usernameExists = await this.prisma.user.findUnique({
              where: { username },
            });
            counter++;
          }

          user = await this.prisma.user.create({
            data: {
              email,
              username,
              provider: 'google',
              providerId: googleUserId,
              profileImage: picture,
              firstName: givenName,
              lastName: familyName,
              isVerified: true, // Google accounts are pre-verified
              isActive: true,
              lastLoginAt: new Date(),
            } as any,
          }) as any;

          this.logger.log(`New Google user created: ${email} (${username})`);
        }
      } else {
        // Update existing Google user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            profileImage: picture || (user as any).profileImage,
            firstName: givenName || (user as any).firstName,
            lastName: familyName || (user as any).lastName,
            lastLoginAt: new Date(),
          } as any,
        }) as any;

        this.logger.log(`Google user logged in: ${email}`);
      }

      // Check if user is active
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Generate internal JWT tokens for our system
      const tokens = await this.generateTokens(user.id, user.email, user.username);

      // Parse expiration times to get seconds
      const accessExpiration = this.parseExpiration(
        this.configService.get('JWT_ACCESS_EXPIRATION', '15m')
      );
      const refreshExpiration = this.parseExpiration(
        this.configService.get('JWT_REFRESH_EXPIRATION', '7d')
      );

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: (user as any).firstName,
            lastName: (user as any).lastName,
            profileImage: (user as any).profileImage,
            provider: (user as any).provider,
            isVerified: user.isVerified,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: accessExpiration,
          refreshExpiresIn: refreshExpiration,
        },
        message: 'Google authentication successful',
      };
    } catch (error) {
      this.logger.error('❌ [Auth Service] Google auth error:', error);
      this.logger.error(`❌ [Auth Service] Error message: ${error.message}`);
      this.logger.error(`❌ [Auth Service] Error stack: ${error.stack}`);
      
      if (error.message?.includes('Token used too late') || 
          error.message?.includes('Invalid token') ||
          error.message?.includes('Token used too early')) {
        this.logger.error('❌ [Auth Service] Google token validation failed');
        return {
          success: false,
          error: 'Invalid or expired Google token. Please try signing in again.',
          statusCode: 401,
        };
      }

      // If it's already an UnauthorizedException or BadRequestException, preserve it
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        error: error.message || 'Google authentication failed',
        statusCode: error.status || 500,
      };
    }
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900;
    }
  }

  async login(loginDto: LoginDto): Promise<ServiceResponse> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Check if password exists (OAuth users don't have passwords)
      if (!user.password) {
        throw new UnauthorizedException('Invalid credentials. Please use OAuth login.');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.username);

      this.logger.log(`User logged in: ${user.email}`);

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
          },
          ...tokens,
        },
        message: 'Login successful',
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<ServiceResponse> {
    try {
      this.logger.log('🔄 [Auth Service] Refresh token request received');
      this.logger.log(`🔍 [Auth Service] Token length: ${refreshToken?.length || 0}`);
      this.logger.log(`🔍 [Auth Service] Token preview: ${refreshToken?.substring(0, 50)}...`);

      // Find refresh token
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        this.logger.error('❌ [Auth Service] Refresh token not found in database');
        this.logger.error(`🔍 [Auth Service] Searched for token: ${refreshToken?.substring(0, 50)}...`);
        
        // Check how many tokens are in the database
        const tokenCount = await this.prisma.refreshToken.count();
        this.logger.error(`🔍 [Auth Service] Total refresh tokens in DB: ${tokenCount}`);
        
        throw new UnauthorizedException('Invalid refresh token');
      }

      this.logger.log(`✅ [Auth Service] Refresh token found for user: ${storedToken.user.email}`);

      // Check if expired
      if (new Date() > storedToken.expiresAt) {
        this.logger.error(`❌ [Auth Service] Refresh token expired at: ${storedToken.expiresAt}`);
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        throw new UnauthorizedException('Refresh token expired');
      }

      this.logger.log('🔄 [Auth Service] Generating new tokens...');

      // Generate new tokens (this will create a NEW refresh token in DB)
      const tokens = await this.generateTokens(
        storedToken.user.id,
        storedToken.user.email,
        storedToken.user.username,
      );

      this.logger.log(`🔑 [Auth Service] New refresh token created: ${tokens.refreshToken.substring(0, 50)}...`);

      // Delete old refresh token
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

      this.logger.log(`🗑️  [Auth Service] Old refresh token deleted: ${refreshToken.substring(0, 50)}...`);
      this.logger.log('✅ [Auth Service] Token refresh successful');
      this.logger.log('📤 [Auth Service] Returning NEW tokens to client');

      return {
        success: true,
        data: tokens,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      this.logger.error(`❌ [Auth Service] Refresh token error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: error.status || 500,
      };
    }
  }

  async logout(userId: string): Promise<ServiceResponse> {
    try {
      // Delete all refresh tokens for user
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async validateToken(token: string): Promise<ServiceResponse> {
    try {
      const payload = this.jwtService.verify(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
          isVerified: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token',
        statusCode: 401,
      };
    }
  }

  private async generateTokens(userId: string, email: string, username: string) {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email,
      username,
      type: 'access',
    };

    const accessExpiration = this.configService.get('JWT_ACCESS_EXPIRATION', '15m');
    const refreshExpiration = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');

    const accessToken = this.jwtService.sign(jwtPayload, {
      expiresIn: accessExpiration,
    });

    const refreshPayload: JwtPayload = {
      ...jwtPayload,
      type: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiration,
    });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    // Parse expiration times to seconds for frontend
    const accessExpiresIn = this.parseExpiration(accessExpiration);
    const refreshExpiresIn = this.parseExpiration(refreshExpiration);

    this.logger.log(`🔑 [Auth Service] Tokens generated: access=${accessExpiresIn}s, refresh=${refreshExpiresIn}s`);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      refreshExpiresIn: refreshExpiresIn,
    };
  }
}
