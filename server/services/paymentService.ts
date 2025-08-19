// CIPC Agent - Multi-Payment Gateway Integration
// Supporting PayStack, Yoco, PayFast, and other SA payment providers

import crypto from 'crypto';
import axios from 'axios';

// Payment provider configurations
interface PaymentConfig {
  paystack: {
    secretKey: string;
    publicKey: string;
    baseUrl: string;
  };
  yoco: {
    secretKey: string;
    publicKey: string;
    baseUrl: string;
  };
  payfast: {
    merchantId: string;
    merchantKey: string;
    passphrase: string;
    baseUrl: string;
  };
  ozow: {
    siteCode: string;
    apiKey: string;
    privateKey: string;
    baseUrl: string;
  };
}

const paymentConfig: PaymentConfig = {
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    baseUrl: 'https://api.paystack.co'
  },
  yoco: {
    secretKey: process.env.YOCO_SECRET_KEY || '',
    publicKey: process.env.YOCO_PUBLIC_KEY || '',
    baseUrl: 'https://online.yoco.com'
  },
  payfast: {
    merchantId: process.env.PAYFAST_MERCHANT_ID || '',
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
    passphrase: process.env.PAYFAST_PASSPHRASE || '',
    baseUrl: 'https://www.payfast.co.za'
  },
  ozow: {
    siteCode: process.env.OZOW_SITE_CODE || '',
    apiKey: process.env.OZOW_API_KEY || '',
    privateKey: process.env.OZOW_PRIVATE_KEY || '',
    baseUrl: 'https://api.ozow.com'
  }
};

// Payment interfaces
interface PaymentRequest {
  amount: number; // in cents
  currency: string;
  email: string;
  phone?: string;
  reference: string;
  description: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  reference?: string;
  error?: string;
  provider: string;
}

interface PaymentStatus {
  id: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  reference: string;
  provider: string;
  paidAt?: Date;
  failureReason?: string;
}

// Base payment provider interface
abstract class PaymentProvider {
  protected config: any;
  protected name: string;

  constructor(config: any, name: string) {
    this.config = config;
    this.name = name;
  }

  abstract createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  abstract verifyPayment(paymentId: string): Promise<PaymentStatus>;
  abstract processWebhook(body: any, signature?: string): Promise<any>;
}

// PayStack implementation
class PayStackProvider extends PaymentProvider {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/transaction/initialize`,
        {
          email: request.email,
          amount: request.amount,
          currency: request.currency,
          reference: request.reference,
          callback_url: request.callbackUrl,
          metadata: {
            phone: request.phone,
            description: request.description,
            ...request.metadata
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        return {
          success: true,
          paymentId: response.data.data.reference,
          checkoutUrl: response.data.data.authorization_url,
          reference: response.data.data.reference,
          provider: this.name
        };
      }

      return {
        success: false,
        error: response.data.message,
        provider: this.name
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'PayStack payment creation failed',
        provider: this.name
      };
    }
  }

  async verifyPayment(reference: string): Promise<PaymentStatus> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.secretKey}`
          }
        }
      );

      const data = response.data.data;
      return {
        id: data.id.toString(),
        status: data.status === 'success' ? 'success' : 
                data.status === 'failed' ? 'failed' : 'pending',
        amount: data.amount,
        currency: data.currency,
        reference: data.reference,
        provider: this.name,
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        failureReason: data.gateway_response
      };
    } catch (error: any) {
      throw new Error(`PayStack verification failed: ${error.message}`);
    }
  }

  async processWebhook(body: any, signature?: string): Promise<any> {
    if (signature) {
      const hash = crypto
        .createHmac('sha512', this.config.secretKey)
        .update(JSON.stringify(body))
        .digest('hex');
      
      if (hash !== signature) {
        throw new Error('Invalid PayStack webhook signature');
      }
    }

    return {
      event: body.event,
      data: body.data,
      provider: this.name
    };
  }
}

// PayFast implementation
class PayFastProvider extends PaymentProvider {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentData = {
        merchant_id: this.config.merchantId,
        merchant_key: this.config.merchantKey,
        return_url: request.callbackUrl,
        cancel_url: request.callbackUrl,
        notify_url: `${request.callbackUrl}/webhook/payfast`,
        name_first: 'CIPC',
        name_last: 'Agent Client',
        email_address: request.email,
        cell_number: request.phone,
        m_payment_id: request.reference,
        amount: (request.amount / 100).toFixed(2),
        item_name: request.description,
        item_description: request.description
      };

      const signature = this.generatePayFastSignature(paymentData);
      const formUrl = this.buildPayFastUrl({ ...paymentData, signature });

      return {
        success: true,
        paymentId: request.reference,
        checkoutUrl: formUrl,
        reference: request.reference,
        provider: this.name
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'PayFast payment creation failed',
        provider: this.name
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentStatus> {
    // PayFast verification through ITN
    return {
      id: paymentId,
      status: 'pending',
      amount: 0,
      currency: 'ZAR',
      reference: paymentId,
      provider: this.name
    };
  }

  async processWebhook(body: any): Promise<any> {
    const isValid = this.validatePayFastITN(body);
    if (!isValid) {
      throw new Error('Invalid PayFast ITN');
    }

    return {
      event: 'payment_complete',
      data: body,
      provider: this.name
    };
  }

  private generatePayFastSignature(data: any): string {
    const sortedKeys = Object.keys(data).sort();
    const queryString = sortedKeys
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&');

    const fullString = queryString + '&passphrase=' + this.config.passphrase;
    return crypto.createHash('md5').update(fullString).digest('hex');
  }

  private buildPayFastUrl(data: any): string {
    const params = new URLSearchParams(data);
    return `${this.config.baseUrl}/eng/process?${params.toString()}`;
  }

  private validatePayFastITN(data: any): boolean {
    const signature = data.signature;
    delete data.signature;
    const generatedSignature = this.generatePayFastSignature(data);
    return signature === generatedSignature;
  }
}

// Payment service orchestrator
export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    this.providers.set('paystack', new PayStackProvider(paymentConfig.paystack, 'paystack'));
    this.providers.set('payfast', new PayFastProvider(paymentConfig.payfast, 'payfast'));
  }

  async createPayment(provider: string, request: PaymentRequest): Promise<PaymentResponse> {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error(`Payment provider ${provider} not supported`);
    }

    return await paymentProvider.createPayment(request);
  }

  async verifyPayment(provider: string, paymentId: string): Promise<PaymentStatus> {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error(`Payment provider ${provider} not supported`);
    }

    return await paymentProvider.verifyPayment(paymentId);
  }

  async processWebhook(provider: string, body: any, signature?: string): Promise<any> {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error(`Payment provider ${provider} not supported`);
    }

    return await paymentProvider.processWebhook(body, signature);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export default PaymentService;