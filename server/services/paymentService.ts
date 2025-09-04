// CIPC Agent - Multi-Payment Gateway Integration
// Supporting PayStack, Yoco, PayFast, and other SA payment providers

import axios from 'axios';

// Defines the shape of a payment request
interface PaymentRequest {
  amount: number; // in cents
  currency: string;
  email: string;
  phone?: string;
  reference: string;
  description: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
  provider: string; // 'paystack' | 'payfast' | 'yoco' | etc.
}

// Defines the shape of the response from the payment creation
interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  reference?: string;
  error?: string;
  provider: string;
}

// Defines the shape of the response from a payment status check
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

// Payment service orchestrator
export class PaymentService {
  private goWorkerUrl: string;

  constructor() {
    // The URL of the Go worker that exposes the /create-payment endpoint
    this.goWorkerUrl = process.env.GO_WORKER_URL || 'http://localhost:8081';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${this.goWorkerUrl}/create-payment`,
        {
          provider: request.provider,
          request: {
            // PayStack-specific fields
            email: request.email,
            amount: request.amount,
            currency: request.currency,
            reference: request.reference,
            callback_url: request.callbackUrl,
            metadata: request.metadata,

            // PayFast-specific fields (adjust as needed)
            merchant_id: process.env.PAYFAST_MERCHANT_ID,
            merchant_key: process.env.PAYFAST_MERCHANT_KEY,
            return_url: request.callbackUrl,
            cancel_url: request.callbackUrl,
            notify_url: `${request.callbackUrl}/webhook/payfast`,
            name_first: 'CIPC',
            name_last: 'Agent Client',
            cell_number: request.phone,
            m_payment_id: request.reference,
            item_name: request.description,
            item_description: request.description,

            // Yoco-specific fields
            successUrl: request.callbackUrl,
            failureUrl: request.callbackUrl, // Or a different URL for failure
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // The Go worker will return the result from the Temporal workflow
      return response.data as PaymentResponse;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || `Failed to create payment with ${request.provider}`,
        provider: request.provider,
      };
    }
  }

  async verifyPayment(provider: string, paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await axios.post(
        `${this.goWorkerUrl}/verify-payment`,
        {
          provider,
          paymentId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data as PaymentStatus;
    } catch (error: any) {
      // It's good practice to create a default error response
      // that matches the expected interface.
      return {
        id: paymentId,
        status: 'failed',
        amount: 0,
        currency: '',
        reference: '',
        provider: provider,
        failureReason: error.response?.data?.error || `Failed to verify payment with ${provider}`,
      };
    }
  }

  async processWebhook(provider: string, body: any, signature?: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.goWorkerUrl}/webhook?provider=${provider}`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Paystack-Signature': signature, // Forward the signature
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process webhook',
      };
    }
  }

  getAvailableProviders(): string[] {
    // The Go worker now determines the available providers
    // You could have an endpoint on the Go worker to fetch this information
    return ['paystack', 'payfast', 'yoco']; // For now, we'll hardcode this
  }
}

export default PaymentService;
