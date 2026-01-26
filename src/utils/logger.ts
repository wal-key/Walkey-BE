import { env } from '../config/env.js';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
    level: LogLevel;
    message: string;
    timestamp: string;
    data?: unknown;
}

const formatLog = (log: LogMessage): string => {
    const { level, message, timestamp, data } = log;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
};

const createLogFn = (level: LogLevel) => {
    return (message: string, data?: unknown) => {
        const log: LogMessage = {
            level,
            message,
            timestamp: new Date().toISOString(),
            data,
        };

        if (env.NODE_ENV === 'production') {
            console.log(JSON.stringify(log));
        } else {
            console.log(formatLog(log));
        }
    };
};

export const logger = {
    info: createLogFn('info'),
    warn: createLogFn('warn'),
    error: createLogFn('error'),
    debug: createLogFn('debug'),
};
