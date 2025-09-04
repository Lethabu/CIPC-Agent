import { WhatsAppService, WhatsAppMessage, WhatsAppResponse } from './whatsappService.js';
import { AndroidHashGenerator } from '../utils/androidHashGenerator.js';

export interface AuthTemplateConfig {
  templateName: string;
  packageName: string;
  appSignatureHash: string;
  otpLength: number;
  expiryMinutes: number;
}

export interface OTPMessage {
  phoneNumber: string;
  otp: string;
  appHash: string;
  expiryTime: Date;
}

export class WhatsAppAuthService extends WhatsAppService {
  private authConfig: AuthTemplateConfig;

  constructor() {
    super();
    this.authConfig = {
      templateName: 'cipc_auth_otp',
      packageName: process.env.ANDROID_PACKAGE_NAME || 'com.cipcagent.app',
      appSignatureHash: process.env.ANDROID_APP_HASH || '',
      otpLength: 6,
      expiryMinutes: 5
    };
  }

  /**
   * Send OTP with zero-tap autofill support
   */
  async sendAuthOTP(phoneNumber: string, otp: string): Promise<WhatsAppResponse> {
    const message = this.formatOTPMessage(otp);
    
    try {
      // Use WhatsApp Business API template for auth
      const response = await fetch(`${this.apiUrl}/send-template`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: phoneNumber,
          template_name: this.authConfig.templateName,
          parameters: [
            { type: 'text', text: otp },
            { type: 'text', text: this.authConfig.expiryMinutes.toString() }
          ],
          // Zero-tap configuration
          autofill_button: {
            package_name: this.authConfig.packageName,
            signature_hash: this.authConfig.appSignatureHash,
            zero_tap: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`WhatsApp Auth API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        messageId: data.messages?.[0]?.id
      };
    } catch (error) {
      // Fallback to regular message
      return await this.sendMessage({
        to: phoneNumber,
        message: this.formatOTPMessage(otp),
        type: 'text'
      });
    }
  }

  /**
   * Format OTP message with app hash for SMS Retriever API
   */
  private formatOTPMessage(otp: string): string {
    const appHash = this.authConfig.appSignatureHash;
    return `Your CIPC Agent verification code is: ${otp}\n\nDo not share this code with anyone.\n\n${appHash}`;
  }

  /**
   * Generate OTP
   */
  generateOTP(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < this.authConfig.otpLength; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  /**
   * Update app signature hash
   */
  updateAppHash(sha256Fingerprint: string): void {
    this.authConfig.appSignatureHash = AndroidHashGenerator.generateAppHash(
      this.authConfig.packageName,
      sha256Fingerprint
    );
  }

  /**
   * Send login OTP
   */
  async sendLoginOTP(phoneNumber: string): Promise<{ otp: string; response: WhatsAppResponse }> {
    const otp = this.generateOTP();
    const response = await this.sendAuthOTP(phoneNumber, otp);
    
    return { otp, response };
  }

  /**
   * Send registration OTP
   */
  async sendRegistrationOTP(phoneNumber: string): Promise<{ otp: string; response: WhatsAppResponse }> {
    const otp = this.generateOTP();
    const response = await this.sendAuthOTP(phoneNumber, otp);
    
    return { otp, response };
  }
}

export const whatsappAuthService = new WhatsAppAuthService();