import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface DecodedJwtPayload {
  sub: string; // User ID
  email?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(`[JWT Middleware] Processing request: ${req.method} ${req.path}`);
    
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      this.logger.debug('[JWT Middleware] No authorization header - request will proceed without authentication (public access)');
      return next(); // Continue without user - guards will handle unauthorized access
    }

    this.logger.debug(`[JWT Middleware] Authorization header found: ${authHeader.substring(0, 20)}...`);

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      this.logger.warn('[JWT Middleware] Invalid authorization header format');
      return next(); // Continue without user
    }

    const token = parts[1];

    try {
      // Decode JWT without verification for now (verification should be done in auth-service)
      // In production, you should verify the signature with a shared secret or public key
      const decoded = jwt.decode(token) as DecodedJwtPayload;

      if (!decoded || !decoded.sub) {
        this.logger.warn('[JWT Middleware] Invalid token payload');
        return next(); // Continue without user
      }

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        this.logger.warn('[JWT Middleware] Token expired');
        return next(); // Continue without user - guard will reject
      }

      // Attach user to request
      (req as any).user = {
        userId: decoded.sub,
        email: decoded.email,
      };

      this.logger.log(`[JWT Middleware] ✅ User authenticated: ${decoded.sub}`);
      next();
    } catch (error) {
      this.logger.error(`[JWT Middleware] JWT decode error: ${error.message}`);
      next(); // Continue without user
    }
  }
}
