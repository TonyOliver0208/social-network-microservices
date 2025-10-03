import logger from "../config/logger";

interface LogMeta {
  requestId?: string;
  userId?: string;
  email?: string;
  [key: string]: any;
}

export class AppLogger {
  static info(message: string, meta?: LogMeta) {
    logger.info(message, { 
      ...meta, 
      service: meta?.service || 'api-gateway'
    });
  }

  static warn(message: string, meta?: LogMeta) {
    logger.warn(message, { 
      ...meta, 
      service: meta?.service || 'api-gateway'
    });
  }

  static error(message: string, meta?: LogMeta) {
    logger.error(message, { 
      ...meta, 
      service: meta?.service || 'api-gateway'
    });
  }

  static debug(message: string, meta?: LogMeta) {
    logger.debug(message, { 
      ...meta, 
      service: meta?.service || 'api-gateway'
    });
  }

  static http(message: string, meta?: LogMeta) {
    logger.http(message, { 
      ...meta, 
      service: meta?.service || 'api-gateway'
    });
  }
}

export default AppLogger;
