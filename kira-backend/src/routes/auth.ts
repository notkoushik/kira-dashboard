import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest, AuthSchema, UpdateProfileSchema } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';
import { AuthService } from '../services/AuthService';
import { logger } from '../config/logger';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authLimiter,
  validateRequest(AuthSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const name = req.body.name || email.split('@')[0];

    const result = await AuthService.register(email, password, name);

    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  '/login',
  authLimiter,
  validateRequest(AuthSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email.toLowerCase(), password);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/v1/auth/me
 * Get current user info
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.getUserById(req.userId!);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'NOT_FOUND',
      });
    }

    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  validateRequest(UpdateProfileSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.updateProfile(req.userId!, {
      name: req.body.name,
      location: req.body.location,
      tech_stack: req.body.tech_stack,
      target_roles: req.body.target_roles,
      experience: req.body.experience,
      github: req.body.github,
      linkedin: req.body.linkedin,
      daily_goal: req.body.daily_goal,
    });

    res.status(200).json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/auth/logout
 * Logout (client-side, just return success)
 */
router.post(
  '/logout',
  authenticate,
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    });
  }
);

export default router;
