import express from 'express';
import { PaymentService } from '../services/paymentService';

const router = express.Router();
const paymentService = new PaymentService();

// Create payment
router.post('/create', async (req, res) => {
  try {
    const { provider, amount, email, phone, description, service } = req.body;
    
    const paymentRequest = {
      amount: amount * 100, // Convert to cents
      currency: 'ZAR',
      email,
      phone,
      reference: `CIPC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: description || `CIPC ${service} Service`,
      callbackUrl: `${process.env.CLIENT_URL}/payment/callback`,
      metadata: { service, userId: req.body.userId }
    };

    const result = await paymentService.createPayment(provider, paymentRequest);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.get('/verify/:provider/:paymentId', async (req, res) => {
  try {
    const { provider, paymentId } = req.params;
    const result = await paymentService.verifyPayment(provider, paymentId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook handlers
router.post('/webhook/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const signature = req.headers['x-paystack-signature'] || req.headers['x-signature'];
    
    const result = await paymentService.processWebhook(provider, req.body, signature as string);
    
    // Handle successful payment
    if (result.event === 'charge.success' || result.event === 'payment_complete') {
      // Update payment status in database
      console.log('Payment successful:', result.data);
    }
    
    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get available payment providers
router.get('/providers', (req, res) => {
  const providers = paymentService.getAvailableProviders();
  res.json({ providers });
});

export default router;