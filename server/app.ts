import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import aisensyWebhook from './src/webhooks/aisensy.js';
import { securityHeaders, apiLimiter, validateInput, logDataAccess } from './security.js';

dotenv.config();

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Use express.raw() for the webhook route to preserve the raw body for signature verification
app.use('/webhooks/aisensy', express.raw({ type: 'application/json' }), aisensyWebhook);

// Use express.json() for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(apiLimiter);
app.use(validateInput);
app.use(logDataAccess);

app.use(session({
  secret: process.env.SESSION_SECRET || 'cipc-agent-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 300000 } // 5 minutes
}));

// Your other routes should be defined here, after the body-parsing middleware
import bo from "./src/routes/bo.js";
import authRoutes from "./routes/auth.js";
import partnersRoutes from "./routes/partners.js";
import managePlanRoutes from "./routes/manage-plan.js";
import paymentsRoutes from "./routes/payments.js";
import whatsappWebhookRoutes from "./routes/whatsapp-webhook.js";
import sprintDashboardRoutes from "./routes/sprint-dashboard.js";

// Import webhook and health routes
import webhookRoutes from "./routes/webhook.js";
import healthRoutes from "./routes/health.js";

app.use("/api/bo", bo);
app.use("/api/auth", authRoutes);
app.use("/api/partners", partnersRoutes);
app.use("/api", managePlanRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/whatsapp", whatsappWebhookRoutes);
app.use("/api/sprint", sprintDashboardRoutes);
app.use("/webhook", webhookRoutes);
app.use("/", healthRoutes);

export default app;
