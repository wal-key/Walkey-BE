import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        logger.info('📦 Database connected successfully');

        const server = app.listen(env.PORT, () => {
            logger.info(`🚀 Server is running on port ${env.PORT}`);
            logger.info(`🌍 Environment: ${env.NODE_ENV}`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                await prisma.$disconnect();
                logger.info('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.error('Failed to start server', { error });
        await prisma.$disconnect();
        process.exit(1);
    }
};

startServer();
