import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
