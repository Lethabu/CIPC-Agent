import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for webhooks
  message: 'Webhook rate limit exceeded'
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// Input validation
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const { body } = req;
  
  // Basic XSS protection
  if (typeof body === 'object') {
    for (const key in body) {
      if (typeof body[key] === 'string') {
        body[key] = body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  }
  
  next();
};

// POPIA compliance logging
export const logDataAccess = (req: Request, res: Response, next: NextFunction) => {
  if (req.body?.phoneNumber || req.body?.from) {
    console.log(`[POPIA] Data access: ${req.method} ${req.path} - ${new Date().toISOString()}`);
  }
  next();
};