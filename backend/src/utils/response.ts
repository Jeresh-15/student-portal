import { Response } from 'express';

export function successResponse<T>(res: Response, data: T, statusCode: number = 200, message?: string) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
}

export function errorResponse(res: Response, statusCode: number, message: string, code?: string) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: code || 'ERROR',
      message,
    },
  });
}
