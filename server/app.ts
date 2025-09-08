import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import ConnectPgSimple from 'connect-pg-simple';

import { securityHeaders, apiLimiter } from './security.js';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PgSession = ConnectPgSimple(session);

// Security Middleware
app.use(securityHeaders);
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true }));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session Management
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

// Rate Limiting
app.use(apiLimiter);

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

export default app;
