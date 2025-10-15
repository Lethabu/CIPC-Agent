import crypto from 'crypto';

interface PaystackPaymentRequest {
  email: string;
  amount: number; // in kobo
  reference: string;
  callback_url: string;
  metadata?: any;
}

interface PaystackPaymentResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export class PaystackService {
  private secretKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required');
    }
  }

  async initializePayment(request: PaystackPaymentRequest): Promise<PaystackPaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Paystack initialization failed: ${error}`);
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Paystack verification failed: ${error}`);
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  }

  generateReference(): string {
    return `CIPC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}