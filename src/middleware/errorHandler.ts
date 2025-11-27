import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log error for debugging 
  console.error(`[${new Date().toISOString()}] Error ${statusCode}: ${message}`);
  if (statusCode >= 500) {
    console.error(error.stack);
  }

  // erros on in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
};
