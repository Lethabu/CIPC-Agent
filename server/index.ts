import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import pino from 'pino';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import { config } from './config';
import { TypebotOrchestrator } from './services/typebot-orchestrator';
import { ImmediateActionService } from './services/immediate-action.service';
import { createPrivateRouter } from './api/private-router';
import { createPublicRouter } from './api/public-router';
import { createImmediateActionRouter } from './routes/immediate-actions';
import { ImmediateWebhookHandler } from './webhooks/immediate-webhook';
import { authMiddleware } from './api/middleware/auth';
import { pool } from './db';
import { Redis } from 'ioredis';

const logger = pino({ level: config.logLevel });

const app = express();
const PgSession = ConnectPgSimple(session);

app.use(helmet());
app.use(cors({ origin: config.server.frontendUrl }));
app.use(express.json());

app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'cipc-agent-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
}));

const redis = new Redis(config.redis.url);
const orchestrator = new TypebotOrchestrator(logger);
const actionService = new ImmediateActionService(logger, orchestrator['eventEmitter'], redis);
const webhookHandler = new ImmediateWebhookHandler(logger, actionService);

const privateRouter = createPrivateRouter(orchestrator, config);
const publicRouter = createPublicRouter(orchestrator, config);
const actionRouter = createImmediateActionRouter(logger, actionService);

app.use('/api', publicRouter);
app.use('/api/actions', actionRouter);
app.use('/api', authMiddleware, privateRouter);

// Webhook endpoints for immediate actions
app.post('/webhook/whatsapp', (req, res) => webhookHandler.handleWhatsAppWebhook(req, res));
app.post('/webhook/typebot', (req, res) => webhookHandler.handleTypebotWebhook(req, res));
app.post('/webhook/payment', (req, res) => webhookHandler.handlePaymentWebhook(req, res));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const server = app.listen(config.server.port, async () => {
  logger.info(`Server listening on port ${config.server.port}`);
  await orchestrator.initialize();
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
