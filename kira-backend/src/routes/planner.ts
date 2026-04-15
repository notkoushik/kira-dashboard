import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest, PlannerTaskSchema } from '../middleware/validation';
import { isValidUUIDGeneral } from '../middleware/validation-utils';
import { PlannerTaskService } from '../services/PlannerTaskService';

const router = Router();

// All routes in this file require authentication
router.use(authenticate);

/**
 * GET /api/v1/planner
 * Get all planner tasks for current user with pagination and filtering
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await PlannerTaskService.getAll(req.userId!, {
      taskDate: req.query.taskDate as string,
      completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
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
 * GET /api/v1/planner/stats/summary
 * Get planner task statistics
 * MUST be before /:id route to avoid being matched as an ID
 */
router.get(
  '/stats/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await PlannerTaskService.getStats(req.userId!);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/v1/planner/:id
 * Get single planner task
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid planner task ID format', 400, 'INVALID_ID');
    }

    const task = await PlannerTaskService.getById(req.userId!, req.params.id);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Planner task not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/planner
 * Create a new planner task
 */
router.post(
  '/',
  validateRequest(PlannerTaskSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const task = await PlannerTaskService.create(req.userId!, req.body);

    res.status(201).json({
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * PATCH /api/v1/planner/:id
 * Update a planner task
 */
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid planner task ID format', 400, 'INVALID_ID');
    }

    const validated = PlannerTaskSchema.partial().parse(req.body);
    const task = await PlannerTaskService.update(req.userId!, req.params.id, validated);

    res.status(200).json({
      success: true,
      data: task,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * DELETE /api/v1/planner/:id
 * Delete a planner task
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid planner task ID format', 400, 'INVALID_ID');
    }

    await PlannerTaskService.delete(req.userId!, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Planner task deleted',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/planner/bulk/delete
 * Delete multiple planner tasks
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
        error: 'One or more invalid planner task ID formats',
        code: 'INVALID_ID',
      });
      return;
    }

    const deletedCount = await PlannerTaskService.bulkDelete(req.userId!, ids);

    res.status(200).json({
      success: true,
      data: { deletedCount },
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
