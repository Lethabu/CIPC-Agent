export interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'text' | 'document' | 'template';
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  private apiUrl: string;
  private accessToken: string;

  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || '';
  }

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      // For development, simulate successful message sending
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          messageId: `msg_${Date.now()}`
        };
      }

      const response = await fetch(`${this.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: message.to,
          text: { body: message.message }
        })
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        messageId: data.messages?.[0]?.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WhatsApp service error'
      };
    }
  }

  async sendComplianceAlert(phoneNumber: string, alertMessage: string): Promise<WhatsAppResponse> {
    const formattedMessage = `🤖 *CIPC AI Commander Alert*

${alertMessage}

Reply 'HELP' for assistance or visit our portal for more details.`;

    return await this.sendMessage({
      to: phoneNumber,
      message: formattedMessage,
      type: 'text'
    });
  }

  async sendFormGeneratedNotification(phoneNumber: string, formType: string, downloadLink?: string): Promise<WhatsAppResponse> {
    const message = `✅ *Form Ready!*

Your ${formType} has been generated successfully.

${downloadLink ? `Download: ${downloadLink}` : 'Available in your dashboard'}

Ready to submit to CIPC? Reply 'SUBMIT' to proceed.`;

    return await this.sendMessage({
      to: phoneNumber,
      message,
      type: 'text'
    });
  }

  async sendFilingStatusUpdate(phoneNumber: string, filingType: string, status: string, reference?: string): Promise<WhatsAppResponse> {
    const statusEmoji = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳';
    
    const message = `${statusEmoji} *Filing Update*

${filingType} Status: *${status.toUpperCase()}*

${reference ? `Reference: ${reference}` : ''}

${status === 'rejected' ? 'We\'ll help you resolve any issues. Reply for assistance.' : ''}`;

    return await this.sendMessage({
      to: phoneNumber,
      message,
      type: 'text'
    });
  }

  parseIncomingMessage(webhookData: any): { from: string; message: string; messageId: string } | null {
    try {
      const entry = webhookData.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (!message) return null;

      return {
        from: message.from,
        message: message.text?.body || '',
        messageId: message.id
      };
    } catch (error) {
      console.error('Error parsing WhatsApp webhook:', error);
      return null;
    }
  }
}

export const whatsappService = new WhatsAppService();
