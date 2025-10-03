import express from 'express';
import UserController from '@/controllers/userController';
import { 
  validateInternalToken, 
  requirePermission, 
  requireRole, 
  optionalAuth 
} from '@/middleware/authMiddleware';

const router = express.Router();

/**
 * User Service Routes
 * 
 * All routes expect internal JWT tokens from API Gateway
 * No direct OAuth handling - that's done at the gateway level
 */

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User service is healthy',
    timestamp: new Date().toISOString(),
    service: 'user-service',
    version: '1.0.0'
  });
});

// Authentication and profile routes
router.post('/auth/session', validateInternalToken, UserController.getOrCreateUser);
router.get('/profile', validateInternalToken, UserController.getCurrentUser);
router.put('/profile', validateInternalToken, requirePermission('profile:update'), UserController.updateCurrentUser);

// Public user routes (with optional auth for enhanced features)
router.get('/users', optionalAuth, UserController.getUsers);
router.get('/users/top', UserController.getTopUsers);
router.get('/users/:userId', optionalAuth, UserController.getUserById);

// Admin routes (require specific roles)
router.get('/admin/users', 
  validateInternalToken, 
  requireRole('admin'), 
  UserController.getUsers
);

export default router;