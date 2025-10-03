import winston from 'winston';

interface LogMeta {
  service?: string;
  requestId?: string;
  userId?: string | undefined;
  email?: string;
  duration?: string;
  error?: string | undefined;
  stack?: string | undefined;
  url?: string;
  method?: string;
  [key: string]: any;
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'errors.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Enhanced logger with TypeScript support
export class Logger {
  private winston: winston.Logger;

  constructor() {
    this.winston = logger;
  }

  info(message: string, meta?: LogMeta): void {
    this.winston.info(message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.winston.warn(message, meta);
  }

  error(message: string, meta?: LogMeta): void {
    this.winston.error(message, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    this.winston.debug(message, meta);
  }
}

const loggerInstance = new Logger();
export default loggerInstance;