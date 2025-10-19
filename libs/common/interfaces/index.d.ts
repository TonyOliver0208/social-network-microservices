export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    statusCode?: number;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
export interface UserPayload {
    userId: string;
    email: string;
    username?: string;
    roles?: string[];
}
export interface JwtPayload {
    sub: string;
    email: string;
    username?: string;
    type: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}
export interface EventPayload<T = any> {
    eventType: string;
    data: T;
    timestamp: Date;
    correlationId?: string;
    userId?: string;
}
export interface RabbitMQConfig {
    uri: string;
    queue: string;
    prefetchCount?: number;
    noAck?: boolean;
    durable?: boolean;
}
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db?: number;
    ttl?: number;
}
