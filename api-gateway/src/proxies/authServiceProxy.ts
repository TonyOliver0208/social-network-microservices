import proxy from "express-http-proxy";
import { Request, Response } from "express";
import AppLogger from "@/utils/logger";
import { env } from "@/config/environment";

const proxyOptions = {
  proxyReqPathResolver: (req: Request) => {
    // Transform /v1/auth/hello -> /api/auth/hello
    const transformedPath = req.originalUrl.replace(/^\/v1/, "/api");

    AppLogger.info("Auth proxy - path transformation", {
      originalUrl: req.originalUrl,
      transformedPath,
      method: req.method,
      targetUrl: `${env.AUTH_SERVICE_URL}${transformedPath}`,
      requestId: req.headers["x-request-id"] as string,
    });

    return transformedPath;
  },

  proxyReqOptDecorator: (proxyReqOpts: any, srcReq: Request) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },

  userResDecorator: (
    proxyRes: any,
    proxyResData: any,
    userReq: Request,
    userRes: Response
  ) => {
    AppLogger.info(
      `Response received from Auth service: ${proxyRes.statusCode}`,
      {
        method: userReq.method,
        url: userReq.originalUrl,
        statusCode: proxyRes.statusCode,
        requestId: userReq.headers["x-request-id"] as string,
      }
    );
    return proxyResData;
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
        errorCode: (err as any).code,
        errno: (err as any).errno,
        syscall: (err as any).syscall,
        address: (err as any).address,
        port: (err as any).port,
      });

      return res.status(500).json({
        success: false,
        message: "Auth service temporarily unavailable",
        error: "Internal server error",
        timestamp: new Date().toISOString(),
        requestId,
        debug: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
    return next();
  },
};

const authServiceProxy = proxy(env.AUTH_SERVICE_URL, proxyOptions);

export default authServiceProxy;
