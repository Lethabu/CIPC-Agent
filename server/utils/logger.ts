import pino from 'pino';

// In a real-world application, you would configure different transports for different environments.
// For example, in development, you might use 'pino-pretty' for human-readable logs,
// while in production, you would stream logs to a service like Datadog or a file.

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Use a timestamp with a more human-readable format
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});
