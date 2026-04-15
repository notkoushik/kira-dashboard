import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest, ApplyQueueSchema } from '../middleware/validation';
import { isValidUUIDGeneral } from '../middleware/validation-utils';
import { ApplyQueueService } from '../services/ApplyQueueService';

const router = Router();

// All routes in this file require authentication
router.use(authenticate);

/**
 * GET /api/v1/queue
 * Get all apply queue items for current user with pagination and filtering
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await ApplyQueueService.getAll(req.userId!, {
      search: req.query.search as string,
      status: req.query.status as string,
      difficulty: req.query.difficulty as string,
      priority: req.query.priority as string,
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
 * GET /api/v1/queue/stats/summary
 * Get apply queue statistics
 * MUST be before /:id route to avoid being matched as an ID
 */
router.get(
  '/stats/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await ApplyQueueService.getStats(req.userId!);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/v1/queue/:id
 * Get single apply queue item
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid queue item ID format', 400, 'INVALID_ID');
    }

    const item = await ApplyQueueService.getById(req.userId!, req.params.id);

    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Apply queue item not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/queue
 * Create a new apply queue item
 */
router.post(
  '/',
  validateRequest(ApplyQueueSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const item = await ApplyQueueService.create(req.userId!, req.body);

    res.status(201).json({
      success: true,
      data: item,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * PATCH /api/v1/queue/:id
 * Update an apply queue item
 */
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid queue item ID format', 400, 'INVALID_ID');
    }

    const validated = ApplyQueueSchema.partial().parse(req.body);
    const item = await ApplyQueueService.update(req.userId!, req.params.id, validated);

    res.status(200).json({
      success: true,
      data: item,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * DELETE /api/v1/queue/:id
 * Delete an apply queue item
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid queue item ID format', 400, 'INVALID_ID');
    }

    await ApplyQueueService.delete(req.userId!, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Apply queue item deleted',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/queue/bulk/delete
 * Delete multiple apply queue items
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
        error: 'One or more invalid queue item ID formats',
        code: 'INVALID_ID',
      });
      return;
    }

    const deletedCount = await ApplyQueueService.bulkDelete(req.userId!, ids);

    res.status(200).json({
      success: true,
      data: { deletedCount },
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
