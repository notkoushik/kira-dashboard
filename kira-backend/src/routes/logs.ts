import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest, DailyLogSchema } from '../middleware/validation';
import { isValidUUIDGeneral } from '../middleware/validation-utils';
import { DailyLogService } from '../services/DailyLogService';

const router = Router();

// All routes in this file require authentication
router.use(authenticate);

/**
 * GET /api/v1/logs
 * Get all daily logs for current user with pagination and filtering
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await DailyLogService.getAll(req.userId!, {
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      skip: parseInt(req.query.skip as string) || 0,
      limit: parseInt(req.query.limit as string) || 50,
    });

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/v1/logs/stats/summary
 * Get daily log statistics
 * MUST be before /:id route to avoid being matched as an ID
 */
router.get(
  '/stats/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await DailyLogService.getStats(req.userId!);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/v1/logs/streak/current
 * Calculate current consecutive day streak (real date gap detection)
 * MUST be before /:id route to avoid being matched as an ID
 */
router.get(
  '/streak/current',
  asyncHandler(async (req: Request, res: Response) => {
    const streak = await DailyLogService.getCurrentStreak(req.userId!);

    res.status(200).json({
      success: true,
      data: streak,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/v1/logs/:id
 * Get single daily log
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid log ID format', 400, 'INVALID_ID');
    }

    const log = await DailyLogService.getById(req.userId!, req.params.id);

    if (!log) {
      res.status(404).json({
        success: false,
        error: 'Daily log not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: log,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/logs
 * Create a new daily log
 */
router.post(
  '/',
  validateRequest(DailyLogSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const log = await DailyLogService.create(req.userId!, req.body);

    res.status(201).json({
      success: true,
      data: log,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * PATCH /api/v1/logs/:id
 * Update a daily log
 */
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid log ID format', 400, 'INVALID_ID');
    }

    const validated = DailyLogSchema.partial().parse(req.body);
    const log = await DailyLogService.update(req.userId!, req.params.id, validated);

    res.status(200).json({
      success: true,
      data: log,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * DELETE /api/v1/logs/:id
 * Delete a daily log
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid log ID format', 400, 'INVALID_ID');
    }

    await DailyLogService.delete(req.userId!, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Daily log deleted',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/logs/bulk/delete
 * Delete multiple daily logs
 */
router.post(
  '/bulk/delete',
  asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || !ids.length) {
      res.status(400).json({
        success: false,
        error: 'Invalid ids array',
        code: 'INVALID_INPUT',
      });
      return;
    }

    // Validate all IDs are valid UUIDs
    const invalidIds = ids.filter(id => !isValidUUIDGeneral(id));
    if (invalidIds.length > 0) {
      res.status(400).json({
        success: false,
        error: 'One or more invalid log ID formats',
        code: 'INVALID_ID',
      });
      return;
    }

    const deletedCount = await DailyLogService.bulkDelete(req.userId!, ids);

    res.status(200).json({
      success: true,
      data: { deletedCount },
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
