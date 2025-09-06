import express from 'express';
import { db } from '../src/db/index.js';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.execute('SELECT 1');
    
    // Check environment variables
    const requiredEnvs = ['DATABASE_URL', 'AISENSY_API_KEY'];
    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      missingEnvs: missingEnvs.length > 0 ? missingEnvs : undefined
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
});

router.get('/ready', async (req, res) => {
  try {
    // More comprehensive readiness check
    await db.execute('SELECT COUNT(*) FROM users LIMIT 1');
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;