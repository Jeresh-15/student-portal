import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return errorResponse(res, err.statusCode, err.message, err.code);
  }

  // Handle Zod validation errors
  if (err?.name === 'ZodError') {
    const message = err.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation error';
    return errorResponse(res, 400, message, 'VALIDATION_ERROR');
  }

  // Handle JWT / Auth errors
  if (err?.name === 'JsonWebTokenError' || err?.code === 'auth/id-token-expired') {
    return errorResponse(res, 401, 'Invalid or expired authentication token', 'UNAUTHORIZED');
  }

  // Log server error securely on server side
  console.error('[Unhandled Error]:', err);

  // Return sanitized generic error message to client - never expose database or stack traces
  return errorResponse(
    res,
    500,
    'An internal server error occurred. Please try again later.',
    'INTERNAL_SERVER_ERROR'
  );
}

export function notFoundHandler(_req: Request, res: Response) {
  return errorResponse(res, 404, 'Endpoint not found', 'NOT_FOUND');
}
