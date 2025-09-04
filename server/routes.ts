import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { aiOrchestrator } from "./services/aiOrchestrator.js";
import { DocumentProcessor, upload } from "./services/documentProcessor.js";
import { whatsappService } from "./services/whatsappService.js";
import { startAIWhatsAppWorkflow, startOnboardingWorkflow, startFilingWorkflow } from "./services/temporal.js";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ... (other routes remain the same)

  // WhatsApp webhook endpoints
  app.get('/api/whatsapp/webhook', (req, res) => {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'cipc_ai_commander';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WhatsApp webhook verified');
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  });

  app.post('/api/whatsapp/webhook', async (req, res) => {
    try {
      const incomingMessage = whatsappService.parseIncomingMessage(req.body);
      
      if (incomingMessage) {
        const from = incomingMessage.from;
        const messageText = incomingMessage.message;
        const messageLower = messageText.toLowerCase().trim();

        if (messageLower === 'start') {
          await startOnboardingWorkflow(from);
        } else if (messageLower.startsWith('file')) {
          const parts = messageText.trim().split(' ');
          if (parts.length >= 3) {
            const companyRegNum = parts[1];
            const serviceType = parts.slice(2).join(' '); // Allow service types with spaces
            await startFilingWorkflow({
              UserPhone: from,
              CompanyRegNum: companyRegNum,
              ServiceType: serviceType,
              Documents: [], // Document URLs would be passed here in a real scenario
            });
          } else {
            await whatsappService.sendMessage({
              to: from,
              message: "Invalid command. To start a filing, use the format: `file <RegistrationNumber> <ServiceType>` (e.g., `file 2023/123456/07 Annual Return`)`",
              type: 'text'
            });
          }
        } else {
          await startAIWhatsAppWorkflow(from, messageText);
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      res.status(200).json({ success: false, error: 'Internal server error' });
    }
  });

  // ... (rest of the routes remain the same)

  const httpServer = createServer(app);
  return httpServer;
}
