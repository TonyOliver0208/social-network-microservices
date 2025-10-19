import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
}
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: HttpException, host: ArgumentsHost): void;
}
