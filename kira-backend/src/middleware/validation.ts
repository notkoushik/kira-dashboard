import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const JobSchema = z.object({
  company: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  portal: z.enum(['LinkedIn', 'Naukri', 'Wellfound', 'Hirist', 'Foundit', 'Cutshort', 'Instahyre', 'Direct', 'Other']),
  status: z.enum(['Applied', 'Screening', 'Interview', 'Offer', 'Rejected']),
  apply_link: z.string().url().optional().nullable(),
  hr_name: z.string().max(255).optional().nullable(),
  hr_linkedin: z.string().url().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const HRContactSchema = z.object({
  name: z.string().min(1).max(255),
  title: z.string().max(255).optional().nullable(),
  company: z.string().max(255).optional().nullable(),
  linkedin_url: z.string().url().optional().nullable(),
  email: z.string().email().optional().nullable(),
  status: z.enum(['Not Contacted', 'Email Drafted', 'Email Sent', 'LinkedIn Connected', 'Replied', 'Rejected']),
  notes: z.string().max(2000).optional().nullable(),
});

export const ApplyQueueSchema = z.object({
  company: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  apply_link: z.string().url().optional().nullable(),
  portal: z.enum(['LinkedIn', 'Naukri', 'Wellfound', 'Direct', 'Other']),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  priority: z.enum(['High', 'Medium']),
  fit_reason: z.string().max(2000).optional().nullable(),
  status: z.enum(['To Apply', 'Applied', 'Skipped']),
});

export const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

export const UpdateProfileSchema = z.object({
  name: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  tech_stack: z.string().max(1000).optional(),
  target_roles: z.string().max(1000).optional(),
  experience: z.string().max(255).optional(),
  github: z.string().max(255).optional(),
  linkedin: z.string().max(255).optional(),
  daily_goal: z.number().int().min(1).max(50).optional(),
});

export const DailyLogSchema = z.object({
  log_text: z.string().min(1).max(5000),
  log_date: z.string().date(),
  tasks_completed: z.number().int().min(0).max(100).optional().nullable(),
  streak_count: z.number().int().min(0).optional().nullable(),
});

export const PlannerTaskSchema = z.object({
  task_slot: z.enum(['8:00 AM', '10:00 AM', '12:00 PM', '6:00 PM']),
  task_date: z.string().date(),
  completed: z.boolean().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
});

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): any => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      return next();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        logger.warn({ errors: err.errors }, 'Validation error');
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Invalid request',
      });
    }
  };
}

// ============================================
// SANITIZATION
// ============================================

/**
 * Sanitize strings to prevent XSS
 */
export function sanitizeString(str: string): string {
  if (!str) return '';
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, 10000); // Limit length
}

export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

export function sanitizeRequestBody(req: Request, _res: Response, next: NextFunction) {
  req.body = sanitizeObject(req.body);
  next();
}
