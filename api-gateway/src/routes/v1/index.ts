import { Router, Request, Response } from "express";
import { requireAuth } from "@/middleware/authMiddleware";
import identityServiceProxy from "@/proxies/identityService";
import postServiceProxy from "@/proxies/postService";
import mediaServiceProxy from "@/proxies/mediaService";
import searchServiceProxy from "@/proxies/searchService";
import authServiceProxy from "@/proxies/authServiceProxy";
import { env, config } from "@/config/environment";
import AppLogger from "@/utils/logger";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    success: true,
    message: "API Gateway v1 is healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: env.NODE_ENV,
    uptime: {
      seconds: Math.floor(uptime),
      humanReadable: `${Math.floor(uptime / 3600)}h ${Math.floor(
        (uptime % 3600) / 60
      )}m ${Math.floor(uptime % 60)}s`,
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
    },
    services: config.services,
  });
});

router.get("/docs", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "DevColl API Gateway v1 Documentation",
    version: "1.0.0",
    baseUrl: "/v1",
    authentication: {
      type: "OAuth 2.0 (Google)",
      header: "Authorization: Bearer <google_id_token>",
      exchange:
        "Google ID tokens are exchanged for internal JWTs via auth-service",
      flow: "NextAuth → Auth Service → API Gateway → Microservices",
    },
    endpoints: {
      public: {
        "GET /v1/health": "Health check with system stats",
        "GET /v1/docs": "API documentation",
        "POST /v1/auth/*": "Authentication endpoints (auth-service proxy)",
      },
      protected: {
        "ALL /v1/questions/*": "Question management (post-service proxy)",
        "ALL /v1/answers/*": "Answer management (post-service proxy)",
        "ALL /v1/comments/*": "Comment management (post-service proxy)",
        "ALL /v1/media/*": "Media upload/management (media-service proxy)",
        "ALL /v1/search/*": "Search functionality (search-service proxy)",
        "ALL /v1/users/*": "User management (identity-service proxy)",
        "ALL /v1/tags/*": "Tag management (post-service proxy)",
      },
    },
    middleware: {
      "OAuth Token Exchange": "Converts Google tokens to internal JWTs",
      "Rate Limiting": "Request throttling and abuse prevention",
      "Request Tracking": "Correlation IDs and request logging",
      CORS: "Cross-origin resource sharing",
      "Security Headers": "Helmet.js security middleware",
    },
    errorHandling: {
      "Client Errors (4xx)": "Validation errors, authentication failures",
      "Server Errors (5xx)": "Service unavailable, internal errors",
      "Rate Limiting (429)": "Too many requests",
    },
  });
});

// Public routes (no authentication required)
// NextAuth calls /v1/auth/google with Google token to get internal tokens
router.use("/auth", authServiceProxy);

// Protected routes (internal token validation required)
// Content management
// router.use('/questions', requireAuth, postServiceProxy);
// router.use('/answers', requireAuth, postServiceProxy);
// router.use('/comments', requireAuth, postServiceProxy);
// router.use('/tags', requireAuth, postServiceProxy);

// // Media and search
// router.use('/media', requireAuth, mediaServiceProxy);
// router.use('/search', requireAuth, searchServiceProxy);

// // User management
// router.use('/users', requireAuth, identityServiceProxy);

// Catch-all for undefined v1 endpoints
router.all("*", (req: Request, res: Response) => {
  const requestId = req.headers["x-request-id"] as string;

  AppLogger.warn("API v1 route not found", {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    requestId,
  });

  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    error: `${req.method} ${req.originalUrl} is not a valid v1 endpoint`,
    timestamp: new Date().toISOString(),
    requestId,
    suggestions: [
      "Check the endpoint URL and method",
      "Refer to /v1/docs for available endpoints",
      "Ensure proper authentication for protected routes",
    ],
  });
});

export default router;
