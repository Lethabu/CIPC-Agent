import express from "express";
import helmet from "helmet";
import cors from "cors";
import pino from "pino";
const pinoHttp = require("pino-http");
import { popia } from "./middleware/popia.js";
import { checkDatabaseHealth } from './db/index.js';

const app = express();
const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*", credentials: true }));

// Standard JSON body parser for all other routes
app.use(express.json({ limit: "1mb" }));

// POPIA Middleware for data sanitization and logging
app.use(popia);

// Health check with database status
app.get("/healthz", async (_req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({ 
    ok: true, 
    database: dbHealth.healthy,
    timestamp: new Date().toISOString()
  });
});

export default app;