import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import type { AppError } from '../types';

/**
 * Global error handling middleware
 */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const timestamp = new Date().toISOString();
  const requestId = (req as any).id || 'unknown';

  // Log error
  logger.error(
    {
      err,
      requestId,
      method: req.method,
      path: req.path,
      userId: req.userId,
      status: err.status || 500,
    },
    'Request error'
  );

  // Determine response
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(status).json({
    success: false,
    error: message,
    code,
    requestId,
    timestamp,
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
}

/**
 * Async error wrapper - wraps async route handlers to catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction): any => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create AppError
 */
export function createError(message: string, status: number = 500, code: string = 'ERROR'): AppError {
  const err = new Error(message) as AppError;
  err.status = status;
  err.code = code;
  return err;
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.path,
  });
}
