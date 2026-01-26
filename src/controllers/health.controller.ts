import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
        });
    } catch {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
        });
    }
};
