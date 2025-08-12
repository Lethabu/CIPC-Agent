import { Request, Response } from 'express'
import { WhatsAppWebhookService } from '../services/whatsappWebhook'

export async function handleWhatsAppWebhook(req: Request, res: Response) {
  if (req.method === 'POST') {
    const { Body, From, MediaUrl0 } = req.body
    
    try {
      const response = await WhatsAppWebhookService.processCIPCRequest({
        messageType: WhatsAppWebhookService.detectMessageType(Body, MediaUrl0),
        userId: From,
        content: Body,
        mediaUrl: MediaUrl0
      })
      
      // Return TwiML response
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${response}</Message>
</Response>`
      
      res.set('Content-Type', 'text/xml')
      res.send(twiml)
      
    } catch (error) {
      console.error('WhatsApp webhook error:', error)
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, I encountered an error. Please try again or contact support.</Message>
</Response>`
      res.set('Content-Type', 'text/xml')
      res.send(errorTwiml)
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}