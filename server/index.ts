import app from "./app.js";
import { closeDbConnection } from "./db.js";

const PORT = process.env.API_PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`API server listening on port ${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await closeDbConnection();
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
