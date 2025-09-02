import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'cipc-agent-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 300000 } // 5 minutes
}));

export default app;