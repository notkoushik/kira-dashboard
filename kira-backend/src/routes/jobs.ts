import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest, JobSchema } from '../middleware/validation';
import { isValidUUIDGeneral } from '../middleware/validation-utils';
import { JobService } from '../services/JobService';

const router = Router();

// All routes in this file require authentication
router.use(authenticate);

/**
 * GET /api/v1/jobs
 * Get all jobs for current user with pagination and filtering
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.getJobs(req.userId!, {
      search: req.query.search as string,
      status: req.query.status as string,
      portal: req.query.portal as string,
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
 * GET /api/v1/jobs/stats/summary
 * Get job statistics
 * MUST be before /:id route to avoid being matched as an ID
 */
router.get(
  '/stats/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await JobService.getJobStats(req.userId!);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/v1/jobs/:id
 * Get single job
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate UUID format
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid job ID format', 400, 'INVALID_ID');
    }

    const job = await JobService.getJobById(req.userId!, req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
        code: 'NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: job,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/jobs
 * Create a new job
 */
router.post(
  '/',
  validateRequest(JobSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const job = await JobService.createJob(req.userId!, req.body);

    res.status(201).json({
      success: true,
      data: job,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * PATCH /api/v1/jobs/:id
 * Update a job
 */
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate UUID format
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid job ID format', 400, 'INVALID_ID');
    }

    // Validate incoming data against JobSchema (update fields only)
    const validated = JobSchema.partial().parse(req.body);

    const job = await JobService.updateJob(req.userId!, req.params.id, validated);

    res.status(200).json({
      success: true,
      data: job,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * DELETE /api/v1/jobs/:id
 * Delete a job
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate UUID format
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid job ID format', 400, 'INVALID_ID');
    }

    await JobService.deleteJob(req.userId!, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job deleted',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/jobs/bulk/delete
 * Delete multiple jobs
 */
router.post(
  '/bulk/delete',
  asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ids array',
        code: 'INVALID_INPUT',
      });
    }

    // Validate all IDs are valid UUIDs
    const invalidIds = ids.filter(id => !isValidUUIDGeneral(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'One or more invalid job ID formats',
        code: 'INVALID_ID',
      });
    }

    const deletedCount = await JobService.bulkDeleteJobs(req.userId!, ids);

    res.status(200).json({
      success: true,
      data: { deletedCount },
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
