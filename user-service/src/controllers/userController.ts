import { Response, NextFunction } from 'express';
import { z } from 'zod';
import User from '@/models/User';
import { 
  AuthenticatedRequest, 
  APIResponse, 
  UserServiceResponse, 
  CreateUserInput, 
  UpdateUserInput,
  UserQueryParams,
  PaginatedResponse
} from '@/types';
import logger from '@/utils/logger';

// Validation schemas
const createUserSchema = z.object({
  googleId: z.string().min(1, 'Google ID is required'),
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  picture: z.string().url('Invalid picture URL').optional()
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  picture: z.string().url('Invalid picture URL').optional(),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      answers: z.boolean().optional(),
      comments: z.boolean().optional(),
      mentions: z.boolean().optional(),
    }).optional(),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'private']).optional(),
      showEmail: z.boolean().optional(),
      showActivity: z.boolean().optional(),
    }).optional(),
  }).optional(),
  profile: z.object({
    github: z.string().regex(/^https:\/\/github\.com\/[a-zA-Z0-9_-]+$/, 'Invalid GitHub URL').optional(),
    linkedin: z.string().regex(/^https:\/\/linkedin\.com\/in\/[a-zA-Z0-9_-]+$/, 'Invalid LinkedIn URL').optional(),
    website: z.string().url('Invalid website URL').optional(),
    location: z.string().max(100, 'Location too long').optional(),
    skills: z.array(z.string()).max(20, 'Maximum 20 skills allowed').optional(),
    experience: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  }).optional(),
});

const queryParamsSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  search: z.string().optional(),
  role: z.string().optional(),
  isActive: z.string().transform(v => v === 'true').optional(),
  sortBy: z.enum(['createdAt', 'reputation', 'lastActiveAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Enterprise User Controller
 * 
 * Handles user management with OAuth integration:
 * - Auto-creates users from OAuth data
 * - Manages user profiles and preferences
 * - Handles user reputation and permissions
 * - Provides comprehensive user search and filtering
 */

class UserController {
  /**
   * Get or create user from OAuth data
   * This is called when API Gateway forwards authenticated requests
   */
  public static async getOrCreateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          error: 'No user data provided',
          timestamp: new Date().toISOString(),
          requestId
        } as APIResponse);
        return;
      }

      // Check if user exists
      let user = await User.findByGoogleId(req.user.userId);
      
      if (!user) {
        // Create new user from OAuth data
        const userData: CreateUserInput = {
          googleId: req.user.userId,
          email: req.user.email,
          name: req.user.name,
          picture: req.user.picture
        };

        user = new User(userData);
        await user.save();

        logger.info('New user created from OAuth', {
          requestId,
          userId: user._id.toString(),
          email: user.email,
          googleId: user.googleId
        });
      } else {
        // Update last login time
        user.lastLoginAt = new Date();
        await user.updateLastActive();

        logger.info('Existing user authenticated', {
          requestId,
          userId: user._id.toString(),
          email: user.email
        });
      }

      const response: UserServiceResponse = {
        success: true,
        message: 'User authenticated successfully',
        data: { user },
        timestamp: new Date().toISOString(),
        requestId
      };

      res.status(200).json(response);

    } catch (error) {
      logger.error('Get or create user error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: req.user?.userId
      });

      res.status(500).json({
        success: false,
        message: 'User authentication failed',
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
    }
  }

  /**
   * Get current user profile
   */
  public static async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId
        } as APIResponse);
        return;
      }

      const user = await User.findByGoogleId(req.user.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'User profile does not exist',
          timestamp: new Date().toISOString(),
          requestId
        } as APIResponse);
        return;
      }

      const response: UserServiceResponse = {
        success: true,
        message: 'User profile retrieved successfully',
        data: { user },
        timestamp: new Date().toISOString(),
        requestId
      };

      res.status(200).json(response);

    } catch (error) {
      logger.error('Get current user error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: req.user?.userId
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile',
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
    }
  }

  /**
   * Update current user profile
   */
  public static async updateCurrentUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId
        } as APIResponse);
        return;
      }

      // Validate request body
      const validationResult = updateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid input data',
          error: validationResult.error.errors[0]?.message || 'Validation failed',
          timestamp: new Date().toISOString(),
          requestId
        } as APIResponse);
        return;
      }

      const updateData = validationResult.data;
      const user = await User.findByGoogleId(req.user.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'User profile does not exist',
          timestamp: new Date().toISOString(),
          requestId
        } as APIResponse);
        return;
      }

      // Check username uniqueness if provided
      if (updateData.username && updateData.username !== user.username) {
        const existingUser = await User.findByUsername(updateData.username);
        if (existingUser) {
          res.status(400).json({
            success: false,
            message: 'Username already taken',
            error: 'Please choose a different username',
            timestamp: new Date().toISOString(),
            requestId
          } as APIResponse);
          return;
        }
      }

      // Update user fields
      Object.assign(user, updateData);
      await user.save();

      logger.info('User profile updated', {
        requestId,
        userId: user._id.toString(),
        updatedFields: Object.keys(updateData)
      });

      const response: UserServiceResponse = {
        success: true,
        message: 'User profile updated successfully',
        data: { user },
        timestamp: new Date().toISOString(),
        requestId
      };

      res.status(200).json(response);

    } catch (error) {
      logger.error('Update current user error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: req.user?.userId
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update user profile',
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
    }
  }

  /**
   * Get user by ID (public profile)
   */
  public static async getUserById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString(),
          requestId
        } as APIResponse);
        return;
      }

      const user = await User.findById(userId);
      
      if (!user || !user.isActive) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'User does not exist or is inactive',
          timestamp: new Date().toISOString(),
          requestId
        } as APIResponse);
        return;
      }

      // Return public profile
      const publicProfile = user.getPublicProfile();

      const response: UserServiceResponse = {
        success: true,
        message: 'User profile retrieved successfully',
        data: { user: publicProfile as any },
        timestamp: new Date().toISOString(),
        requestId
      };

      res.status(200).json(response);

    } catch (error) {
      logger.error('Get user by ID error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId: req.params.userId
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile',
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
    }
  }

  /**
   * Search and list users with pagination
   */
  public static async getUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    
    try {
      // Validate query parameters
      const validationResult = queryParamsSchema.safeParse(req.query);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          error: validationResult.error.errors[0]?.message || 'Validation failed',
          timestamp: new Date().toISOString(),
          requestId
        } as APIResponse);
        return;
      }

      const { page, limit, search, role, isActive, sortBy, sortOrder } = validationResult.data;

      // Build query
      const query: any = {};
      
      if (isActive !== undefined) {
        query.isActive = isActive;
      } else {
        query.isActive = true; // Default to active users only
      }
      
      if (role) {
        query.roles = role;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        User.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('username name picture reputation profile.experience createdAt lastActiveAt'),
        User.countDocuments(query)
      ]);

      const pages = Math.ceil(total / limit);
      const pagination = {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      };

      logger.info('Users retrieved', {
        requestId,
        page,
        limit,
        total,
        searchTerm: search
      });

      const response: PaginatedResponse<any> = {
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        pagination,
        timestamp: new Date().toISOString(),
        requestId
      };

      res.status(200).json(response);

    } catch (error) {
      logger.error('Get users error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
    }
  }

  /**
   * Get top users by reputation
   */
  public static async getTopUsers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const requestId = req.headers['x-request-id'] as string || 'unknown';
    
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = await User.getTopUsers(Math.min(limit, 50));

      const response: UserServiceResponse = {
        success: true,
        message: 'Top users retrieved successfully',
        data: { users },
        timestamp: new Date().toISOString(),
        requestId
      };

      res.status(200).json(response);

    } catch (error) {
      logger.error('Get top users error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve top users',
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        requestId
      } as APIResponse);
    }
  }
}

export default UserController;