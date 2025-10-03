import proxy from "express-http-proxy";
import { Request, Response } from "express";
import AppLogger from "@/utils/logger";
import { env } from "@/config/environment";

const proxyConfigs = {
  proxyReqPathResolver: (req: Request) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err: Error, res: Response, next: Function) => {
    if (err) {
      const requestId = res.getHeader("x-request-id") as string;
      AppLogger.error("Auth service proxy error", {
        requestId,
        error: err.message,
        stack: err.stack || undefined,
        service: "api-gateway",
        component: "auth-service-proxy",
      });

      return res.status(500).json({
        success: false,
        message: "Auth service temporarily unavailable",
        error: "Internal server error",
        timestamp: new Date().toISOString(),
        requestId,
      });
    }
    return next();
  },
};

const authServiceProxy = proxy(env.AUTH_SERVICE_URL, proxyConfigs);

export default authServiceProxy;
