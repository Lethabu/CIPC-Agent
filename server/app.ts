import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import aisensyWebhook from './src/webhooks/aisensy.js'; // Import the webhook

dotenv.config();

const app = express();

app.use(cors());

// Use express.raw() for the webhook route to preserve the raw body for signature verification
app.use('/webhooks/aisensy', express.raw({ type: 'application/json' }), aisensyWebhook);

// Use express.json() for all other routes
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'cipc-agent-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 300000 } // 5 minutes
}));

// Your other routes should be defined here, after the body-parsing middleware
import bo from "./src/routes/bo.js";
import authRoutes from "./routes/auth.js";
app.use("/api/bo", bo);
app.use("/api/auth", authRoutes);

export default app;
