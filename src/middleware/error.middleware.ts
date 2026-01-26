import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }

    logger.error('Unexpected error', { error: err.message, stack: err.stack });

    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
    next(ApiError.notFound('Route not found'));
};
