import { Router } from 'express';
import { whatsappAuthService } from '../services/whatsappAuthService.js';
import { AndroidHashGenerator } from '../utils/androidHashGenerator.js';

const router = Router();

// Send OTP for login
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }
    
    const { otp, response } = await whatsappAuthService.sendLoginOTP(phoneNumber);
    
    if (response.success) {
      // Store OTP in session/cache for verification
      req.session.otp = otp;
      req.session.phoneNumber = phoneNumber;
      res.json({ success: true, messageId: response.messageId });
    } else {
      res.status(500).json({ error: response.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    const sessionOtp = req.session?.otp;
    
    if (!otp || !sessionOtp) {
      return res.status(400).json({ error: 'OTP required' });
    }
    
    if (otp === sessionOtp) {
      // Clear session OTP
      req.session.otp = undefined;
      res.json({ success: true, verified: true });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Generate app hash (admin endpoint)
router.post('/generate-app-hash', async (req, res) => {
  try {
    const { sha256Fingerprint } = req.body;
    
    if (!sha256Fingerprint) {
      return res.status(400).json({ error: 'SHA-256 fingerprint required' });
    }
    
    const appHash = AndroidHashGenerator.generateAppHash(
      'com.cipcagent.app',
      sha256Fingerprint
    );
    
    // Update service configuration
    whatsappAuthService.updateAppHash(sha256Fingerprint);
    
    res.json({ 
      success: true, 
      appHash,
      packageName: 'com.cipcagent.app'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate app hash' });
  }
});

export default router;