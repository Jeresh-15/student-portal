import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export function requireRole(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.studentContext) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = req.studentContext.role?.toUpperCase();
    const hasRole = allowedRoles.some((r) => r.toUpperCase() === userRole);

    if (!hasRole) {
      return next(
        new ForbiddenError(
          `Access denied: This portal is restricted to ${allowedRoles.join(', ')}. Current role: ${userRole || 'UNKNOWN'}`
        )
      );
    }

    next();
  };
}

export const requireStudentRole = requireRole(['STUDENT']);
