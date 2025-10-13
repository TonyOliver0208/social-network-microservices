import { Router, Request, Response } from "express";
import AuthController from "../controllers/auth-controller";
import { asyncHandler } from "../middleware/error";
import {
  authenticateToken,
  authenticateRefreshToken,
} from "../middleware/auth";
import {
  loginRateLimit,
  refreshRateLimit,
  generalRateLimit,
} from "../middleware/rateLimiter";

const router = Router();

/**
 * @route   POST /auth/google
 * @desc    Authenticate with Google OAuth
 * @access  Public
 * @body    { googleToken: string }
 */
router.post(
  "/google",
  loginRateLimit,
  asyncHandler(AuthController.validateGoogleToken.bind(AuthController))
);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refreshToken: string }
 */
router.post(
  "/refresh",
  refreshRateLimit,
  authenticateRefreshToken,
  asyncHandler(AuthController.refreshToken.bind(AuthController))
);

/**
 * @route   POST /auth/logout
 * @desc    Logout user and revoke refresh token
 * @access  Protected
 * @body    { refreshToken?: string }
 */
router.post(
  "/logout",
  generalRateLimit,
  authenticateToken,
  asyncHandler(AuthController.logout.bind(AuthController))
);

/**
 * @route   POST /auth/logout-all
 * @desc    Logout user from all devices
 * @access  Protected
 */
router.post(
  "/logout-all",
  generalRateLimit,
  authenticateToken,
  asyncHandler(AuthController.logoutAll.bind(AuthController))
);

/**
 * @route   GET /auth/me
 * @desc    Get current user profile
 * @access  Protected
 */
router.get(
  "/me",
  generalRateLimit,
  authenticateToken,
  asyncHandler(AuthController.getCurrentUser.bind(AuthController))
);

/**
 * @route   GET /auth/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get("/health", asyncHandler(AuthController.healthCheck.bind(AuthController)));

export default router;
