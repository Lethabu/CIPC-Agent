import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const logger = console; // Replace with winston if added

export const popia = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) req.body = sanitizePII(req.body);
  logProcessing(req);
  next();
};

function sanitizePII(data: any) {
  const sensitive = ['idNumber', 'fullName'];
  sensitive.forEach(field => {
    if (data[field]) data[field] = crypto.createHmac('sha256', process.env.ENCRYPTION_KEY || 'key').update(data[field]).digest('hex');
  });
  return data;
}

function logProcessing(req: Request) {
  logger.info(`[POPIA] ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
}
