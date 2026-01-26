import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

type ValidateTarget = 'body' | 'query' | 'params';

export const validate = (schema: AnyZodObject, target: ValidateTarget = 'body') => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await schema.parseAsync(req[target]);
            req[target] = data;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                next(ApiError.badRequest(message));
            } else {
                next(error);
            }
        }
    };
};
