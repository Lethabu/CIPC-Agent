import express from "express";
import helmet from "helmet";
import cors from "cors";
import pino from "pino";
const pinoHttp = require("pino-http");
import { popia } from "./middleware/popia.js";
import boRouter from './routes/bo.js';
import consentRouter from './routes/consent.js';
import aisensyWebhookRouter from './webhooks/aisensy.js';
import whatsappRouter from '../routes/whatsapp.js';
import sprintRouter from '../routes/sprint.js';
import { checkDatabaseHealth } from './db/index.js';
import { LeadScoutAgent } from '../services/agents/leadScoutAgent.js';
import { DeadlineSentinelAgent } from '../services/agents/deadlineSentinelAgent.js';

const app = express();
const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });

// Initialize agents
const leadScout = new LeadScoutAgent();
const sentinelAgent = new DeadlineSentinelAgent();

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*", credentials: true }));

// Webhook for AiSensy - must come before express.json() to get raw body
app.use('/webhooks/aisensy', express.raw({ type: 'application/json' }), aisensyWebhookRouter);

// Standard JSON body parser for all other routes
app.use(express.json({ limit: "1mb" }));

// POPIA Middleware for data sanitization and logging
app.use(popia);

// API Routes
app.use('/api/bo', boRouter);
app.use('/api/consent', consentRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/sprint', sprintRouter);

// Health check with database status
app.get("/healthz", async (_req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({ 
    ok: true, 
    database: dbHealth.healthy,
    timestamp: new Date().toISOString()
  });
});

// Start background agents
if (process.env.NODE_ENV !== 'test') {
  // Run lead scout every 4 hours
  setInterval(() => {
    leadScout.scoutLeads().catch(console.error);
  }, 4 * 60 * 60 * 1000);
  
  // Check deadlines every hour
  setInterval(() => {
    sentinelAgent.checkUpcomingDeadlines().catch(console.error);
  }, 60 * 60 * 1000);
}

export default app;