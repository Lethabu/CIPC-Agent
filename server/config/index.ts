import dotenv from 'dotenv';
dotenv.config();

export const config = {
    logLevel: process.env.LOG_LEVEL || 'info',
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
    },
    typebot: {
        url: process.env.TYPEBOT_URL || '',
        apiKey: process.env.TYPEBOT_API_KEY || '',
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
    },
};

export type AppConfig = typeof config;
