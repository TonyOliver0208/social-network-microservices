import { Logger } from '@nestjs/common';
export declare class AppLogger extends Logger {
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    log(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
}
export declare function generateId(): string;
export declare function slugify(text: string): string;
export declare function calculatePagination(page: number, limit: number, total: number): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};
