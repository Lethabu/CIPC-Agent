import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import { popia } from "./middleware/popia";
import boRouter from './routes/bo';
import consentRouter from './routes/consent';
import aisensyWebhookRouter from './webhooks/aisensy';

const app = express();
const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*", credentials: true }));

// Webhook for AiSensy - must come before express.json() to get raw body
app.use('/webhooks/aisensy', express.raw({ type: 'application/json' }), aisensyWebhookRouter);

// Standard JSON body parser for all other routes
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// POPIA Middleware for data sanitization and logging
app.use(popia);

// API Routes
app.use('/api/bo', boRouter);
app.use('/api/consent', consentRouter);

app.get("/healthz", (_req, res) => res.json({ ok: true }));

export default app;
