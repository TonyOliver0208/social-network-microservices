import logger from "../config/logger";

interface LogMeta {
  requestId?: string;
  correlationId?: string;  
  userId?: string;
  email?: string;
  [key: string]: any;
}

export class AppLogger {
  static info(message: string, meta?: LogMeta) {
    logger.info(message, meta);
  }

  static warn(message: string, meta?: LogMeta) {
    logger.warn(message, meta);
  }

  static error(message: string, meta?: LogMeta) {
    logger.error(message, meta);
  }

  static debug(message: string, meta?: LogMeta) {
    logger.debug(message, meta);
  }

  static http(message: string, meta?: LogMeta) {
    logger.log("http", message, meta);
  }
}

export default AppLogger;
