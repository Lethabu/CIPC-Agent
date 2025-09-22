import dotenv from 'dotenv';
dotenv.config();

// Helper function to get and validate environment variables
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export interface AppConfig {
  logLevel: string;
  database: {
    url: string;
  };
  typebot: {
    url: string;
    apiKey: string;
  };
  redis: {
    url: string;
  };
  gemini: {
    apiKey: string;
  };
  server: {
    port: number;
    frontendUrl: string;
  };
  firebase: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };
}

export const config: AppConfig = {
  logLevel: getEnv('LOG_LEVEL', 'info'),
  database: {
    url: getEnv('DATABASE_URL'),
  },
  typebot: {
    url: getEnv('TYPEBOT_VIEWER_URL', 'http://localhost:3002'),
    apiKey: getEnv('TYPEBOT_API_KEY'),
  },
  redis: {
    url: getEnv('REDIS_URL'),
  },
  gemini: {
    apiKey: getEnv('GEMINI_API_KEY'),
  },
  server: {
    port: parseInt(getEnv('PORT', '8080'), 10),
    frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:3000'),
  },
  firebase: {
    projectId: getEnv('FIREBASE_PROJECT_ID'),
    clientEmail: getEnv('FIREBASE_CLIENT_EMAIL'),
    privateKey: getEnv('FIREBASE_PRIVATE_KEY'),
  },
};
