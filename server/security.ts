import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// 1. Rate Limiting
// General API limiter for all incoming requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Security Headers with a Stricter Content Security Policy (CSP)
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'"], // Only allow scripts from the same origin
      "style-src": ["'self'", "https://fonts.googleapis.com"], // Allow styles from self and Google Fonts
      "img-src": ["'self'", "data:", "https:"], // Allow images from self, data URIs, and HTTPS sources
    },
  },
  crossOriginEmbedderPolicy: false, // Set to false to allow services like Typebot to embed content
});
