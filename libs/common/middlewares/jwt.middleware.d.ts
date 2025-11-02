import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export interface DecodedJwtPayload {
    sub: string;
    email?: string;
    iat?: number;
    exp?: number;
}
export declare class JwtMiddleware implements NestMiddleware {
    private readonly logger;
    use(req: Request, res: Response, next: NextFunction): void;
}
