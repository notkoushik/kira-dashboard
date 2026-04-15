import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { validateRequest, HRContactSchema } from '../middleware/validation';
import { isValidUUIDGeneral } from '../middleware/validation-utils';
import { HRContactService } from '../services/HRContactService';

const router = Router();

// All routes in this file require authentication
router.use(authenticate);

/**
 * GET /api/v1/hrcontacts
 * Get all HR contacts for current user with pagination and filtering
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const result = await HRContactService.getAll(req.userId!, {
      search: req.query.search as string,
      status: req.query.status as string,
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
 * GET /api/v1/hrcontacts/stats/summary
 * Get HR contact statistics
 * MUST be before /:id route to avoid being matched as an ID
 */
router.get(
  '/stats/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await HRContactService.getStats(req.userId!);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/v1/hrcontacts/:id
 * Get single HR contact
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid HR contact ID format', 400, 'INVALID_ID');
    }

    const contact = await HRContactService.getById(req.userId!, req.params.id);

    if (!contact) {
      res.status(404).json({
        success: false,
        error: 'HR contact not found',
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: contact,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/hrcontacts
 * Create a new HR contact
 */
router.post(
  '/',
  validateRequest(HRContactSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const contact = await HRContactService.create(req.userId!, req.body);

    res.status(201).json({
      success: true,
      data: contact,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * PATCH /api/v1/hrcontacts/:id
 * Update an HR contact
 */
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid HR contact ID format', 400, 'INVALID_ID');
    }

    const validated = HRContactSchema.partial().parse(req.body);
    const contact = await HRContactService.update(req.userId!, req.params.id, validated);

    res.status(200).json({
      success: true,
      data: contact,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * DELETE /api/v1/hrcontacts/:id
 * Delete an HR contact
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    if (!isValidUUIDGeneral(req.params.id)) {
      throw createError('Invalid HR contact ID format', 400, 'INVALID_ID');
    }

    await HRContactService.delete(req.userId!, req.params.id);

    res.status(200).json({
      success: true,
      message: 'HR contact deleted',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/v1/hrcontacts/bulk/delete
 * Delete multiple HR contacts
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
        error: 'One or more invalid HR contact ID formats',
        code: 'INVALID_ID',
      });
      return;
    }

    const deletedCount = await HRContactService.bulkDelete(req.userId!, ids);

    res.status(200).json({
      success: true,
      data: { deletedCount },
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
