import proxy from "express-http-proxy";
import { Request, Response } from "express";
import logger from "@/utils/logger";
import { AuthenticatedRequest } from "@/types/AuthenticatedRequest";

const proxyConfigs = {
  proxyReqPathResolver: (req: Request) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err: Error, res: Response, next: Function) => {
    if (err) {
      const requestId = res.getHeader("x-request-id") as string;
      logger.error("Post service proxy error", {
        requestId,
        error: err.message,
        stack: err.stack || undefined,
      });

      return res.status(500).json({
        success: false,
        message: "Post service temporarily unavailable",
        error: "Internal server error",
        timestamp: new Date().toISOString(),
        requestId,
      });
    }
    return next();
  },
  proxyReqOptDecorator: (proxyReqOpts: any, srcReq: AuthenticatedRequest) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";

    if (srcReq.internalToken) {
      proxyReqOpts.headers["x-internal-token"] = srcReq.internalToken;
      proxyReqOpts.headers["x-user-id"] = srcReq.user?.userId;
      proxyReqOpts.headers["x-user-email"] = srcReq.user?.email;
    }

    if (srcReq.headers["x-request-id"]) {
      proxyReqOpts.headers["x-request-id"] = srcReq.headers["x-request-id"];
    }

    return proxyReqOpts;
  },
  userResDecorator: (
    proxyRes: any,
    proxyResData: any,
    userReq: Request,
    userRes: Response
  ) => {
    const requestId = userReq.headers["x-request-id"] as string;

    logger.info("Post service response", {
      requestId,
      statusCode: proxyRes.statusCode,
      method: userReq.method,
      url: userReq.originalUrl,
    });

    return proxyResData;
  },
};

if (!process.env.POST_SERVICE_URL) {
  throw new Error("POST_SERVICE_URL environment variable is required");
}

const postServiceProxy = proxy(process.env.POST_SERVICE_URL, proxyConfigs);

export default postServiceProxy;
