interface CIPCRequest {
  messageType: 'onboard' | 'document_upload' | 'filing_request' | 'status_check'
  userId: string
  content: string
  mediaUrl?: string
}

export class WhatsAppWebhookService {
  
  static detectMessageType(body: string, mediaUrl?: string): CIPCRequest['messageType'] {
    if (mediaUrl) return 'document_upload'
    if (body?.toLowerCase().includes('status')) return 'status_check'
    if (body?.toLowerCase().includes('file') || body?.toLowerCase().includes('submit')) return 'filing_request'
    return 'onboard'
  }

  static async processCIPCRequest(request: CIPCRequest): Promise<string> {
    switch (request.messageType) {
      case 'onboard':
        return `🤖 Welcome to CIPC Agent Army!

I can help you with:
📄 Annual returns (R199)
🏢 B-BBEE certificates  
📋 Director changes
📊 Free compliance score

To get started, upload a photo of your ID document or company registration.

Type HELP for more options.`

      case 'document_upload':
        await this.processDocument(request.userId, 'uploaded_document')
        return `✅ Document received! 

I'm analyzing your information now...

Found company: [Company Name]
Registration: [Reg Number]
Status: Active
Next filing due: [Date]

Shall I prepare your annual return? (Cost: R199)
Reply YES to continue.`

      case 'filing_request':
        const paymentLink = await this.generatePaymentLink(request.userId, 199)
        return `🎉 Annual return prepared!

Summary:
• CoR 30.1 form completed
• Filing fee: R175 (CIPC) + R24 (processing)
• Total: R199

Pay here to submit: ${paymentLink}

Once paid, I'll submit directly to CIPC within 2 hours.`

      case 'status_check':
        return `📊 Your CIPC Status:

Company: [Company Name]  
Reg: [2023/123456/07]
Status: ✅ Active
Last filed: [Date]
Next due: [Date]

Need help with anything? Type MENU for options.`

      default:
        return "I didn't understand that. Type HELP for available commands."
    }
  }

  private static async processDocument(userId: string, documentPath: string): Promise<void> {
    // TODO: Implement Unstructured.io OCR + POPIA redaction
    console.log(`Processing document for user ${userId}: ${documentPath}`)
  }

  private static async generatePaymentLink(userId: string, amount: number): Promise<string> {
    // TODO: Implement PayFast payment link generation
    return `https://payfast.com/pay/cipc_${userId}_${Date.now()}`
  }
}