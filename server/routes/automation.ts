import express from 'express';
import { AutomationService } from '../services/automationService.js';

const router = express.Router();
const automationService = new AutomationService();

// Set canary rollout percentage
router.post('/canary', async (req, res) => {
  try {
    const { percentage } = req.body;
    await automationService.updateCanaryRollout(percentage);
    
    res.json({ 
      success: true, 
      message: `Canary rollout updated to ${percentage}%`,
      percentage 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get automation stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await automationService.getAutomationStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test automation
router.post('/test', async (req, res) => {
  try {
    const { transaction_id } = req.body;
    const result = await automationService.processFilingTransaction(transaction_id || 'test-123');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;