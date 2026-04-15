import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { logger } from '../config/logger';
import type { JWTPayload } from '../types';

export class AuthError extends Error {
  constructor(message: string, public code: string = 'AUTH_ERROR') {
    super(message);
  }
}

/**
 * Middleware to verify JWT token from Authorization header
 */
export function authenticate(req: Request, res: Response, next: NextFunction): any {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid Authorization header',
        code: 'MISSING_TOKEN',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      req.userId = decoded.userId;
      req.email = decoded.email;
      return next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }
  } catch (err) {
    logger.error({ err }, 'Auth middleware error');
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Optional authentication - doesn't fail if token is missing, but extracts if present
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): any {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
        req.userId = decoded.userId;
        req.email = decoded.email;
      } catch (err) {
        // Silently ignore invalid tokens in optional auth
        logger.debug('Optional auth: invalid token ignored');
      }
    }

    next();
  } catch (err) {
    next();
  }
}

/**
 * Generate JWT token
 */
export function generateToken(userId: string, email: string): string {
  return (jwt.sign as any)(
    {
      userId,
      email,
    },
    config.jwt.secret as string,
    {
      expiresIn: config.jwt.expiry,
    }
  );
}

/**
 * Verify JWT token (for testing)
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch {
    return null;
  }
}
