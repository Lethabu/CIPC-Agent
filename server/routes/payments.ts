import { Router } from 'express';
import { PaystackService } from '../services/paystackService';

const router = Router();
const paystackService = new PaystackService();

// Create payment
router.post('/create', async (req, res) => {
  try {
    const { email, amount, service, phone } = req.body;
    
    if (!email || !amount || !service) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, amount, and service are required' 
      });
    }

    const reference = paystackService.generateReference();
    const amountInKobo = amount * 100; // Convert to kobo

    const paymentRequest = {
      email,
      amount: amountInKobo,
      reference,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      metadata: {
        service,
        phone,
        custom_fields: [
          {
            display_name: "Service Type",
            variable_name: "service_type",
            value: service
          }
        ]
      }
    };

    const response = await paystackService.initializePayment(paymentRequest);

    if (response.status && response.data) {
      res.json({
        success: true,
        checkoutUrl: response.data.authorization_url,
        reference: response.data.reference,
        provider: 'paystack'
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.message || 'Payment initialization failed'
      });
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify payment
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    const verification = await paystackService.verifyPayment(reference);
    
    if (verification.status && verification.data.status === 'success') {
      res.json({
        success: true,
        status: 'success',
        amount: verification.data.amount / 100, // Convert from kobo
        reference: verification.data.reference,
        paidAt: verification.data.paid_at
      });
    } else {
      res.json({
        success: false,
        status: verification.data?.status || 'failed',
        message: verification.message
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

// Webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const payload = JSON.stringify(req.body);

    if (!paystackService.verifyWebhookSignature(payload, signature)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    
    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;
      
      console.log('Payment successful:', {
        reference,
        amount: amount / 100,
        email: customer.email
      });

      // TODO: Update database, trigger CIPC filing workflow
      // await triggerCIPCFiling(reference, event.data);
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;