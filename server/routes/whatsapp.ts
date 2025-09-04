import { Request, Response } from 'express'
import { WhatsAppWebhookService } from '../services/whatsappWebhook.js'
import { whatsappService } from '../services/whatsappService.js'

export async function handleWhatsAppWebhook(req: Request, res: Response) {
  if (req.method === 'POST') {
    const incomingMessage = req.body; // Assuming AiSensy sends JSON body
    
    try {
      // AiSensy webhook structure might be different, adjust as needed
      const messageType = WhatsAppWebhookService.detectMessageType(incomingMessage.text?.body, incomingMessage.media?.[0]?.url);
      const userId = incomingMessage.from;
      const content = incomingMessage.text?.body;
      const mediaUrl = incomingMessage.media?.[0]?.url;

      const responseMessage = await WhatsAppWebhookService.processCIPCRequest({
        messageType,
        userId,
        content,
        mediaUrl
      })
      
      await whatsappService.sendMessage({
        to: userId,
        message: responseMessage,
        type: 'text'
      });

      res.status(200).json({ status: 'success' });
      
    } catch (error) {
      console.error('WhatsApp webhook error:', error)
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}