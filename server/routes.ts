import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { aiOrchestrator } from "./services/aiOrchestrator.js";
import { DocumentProcessor, upload } from "./services/documentProcessor.js";
import { whatsappService } from "./services/whatsappService.js";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // AI Agent endpoints
  app.post('/api/agents/chat', async (req, res) => {
    try {
      const { message, userData } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await aiOrchestrator.orchestrateTask(message, userData);
      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/agents/status', async (req, res) => {
    try {
      const status = await aiOrchestrator.getAgentStatus();
      res.json(status);
    } catch (error) {
      console.error('Agent status error:', error);
      res.status(500).json({ error: 'Failed to get agent status' });
    }
  });

  // Document processing endpoints
  app.post('/api/documents/upload', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const documentType = req.body.documentType || 'general';
      const processed = await DocumentProcessor.processDocument(req.file, documentType);
      
      // Store in database
      const document = await storage.createDocument({
        companyId: req.body.companyId || 'default',
        fileName: processed.fileName,
        fileType: processed.fileType,
        filePath: processed.filePath,
        documentType,
        processedData: processed.extractedData
      });

      res.json({
        success: true,
        document,
        extractedData: processed.extractedData,
        popiaCompliant: processed.popiaCompliant
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Upload failed' });
    }
  });

  // Company management endpoints
  app.post('/api/companies', async (req, res) => {
    try {
      const company = await storage.createCompany(req.body);
      res.json(company);
    } catch (error) {
      console.error('Company creation error:', error);
      res.status(500).json({ error: 'Failed to create company' });
    }
  });

  app.get('/api/companies/:id', async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json(company);
    } catch (error) {
      console.error('Company fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch company' });
    }
  });

  // Compliance alerts endpoints
  app.get('/api/companies/:id/alerts', async (req, res) => {
    try {
      const alerts = await storage.getComplianceAlerts(req.params.id);
      res.json(alerts);
    } catch (error) {
      console.error('Alerts fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  app.post('/api/companies/:id/alerts', async (req, res) => {
    try {
      const alert = await storage.createComplianceAlert({
        companyId: req.params.id,
        ...req.body
      });
      res.json(alert);
    } catch (error) {
      console.error('Alert creation error:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  });

  // CIPC filing endpoints
  app.post('/api/filings', async (req, res) => {
    try {
      const filing = await storage.createCipcFiling(req.body);
      res.json(filing);
    } catch (error) {
      console.error('Filing creation error:', error);
      res.status(500).json({ error: 'Failed to create filing' });
    }
  });

  app.get('/api/filings/:id/status', async (req, res) => {
    try {
      const filing = await storage.getCipcFiling(req.params.id);
      if (!filing) {
        return res.status(404).json({ error: 'Filing not found' });
      }
      res.json({ status: filing.status, cipcReference: filing.cipcReference });
    } catch (error) {
      console.error('Filing status error:', error);
      res.status(500).json({ error: 'Failed to get filing status' });
    }
  });

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
        // Process the message through AI orchestrator
        const response = await aiOrchestrator.orchestrateTask(incomingMessage.message, {
          phoneNumber: incomingMessage.from,
          messageId: incomingMessage.messageId
        });

        // Send response back via WhatsApp if successful
        if (response.success && response.data?.response) {
          await whatsappService.sendMessage({
            to: incomingMessage.from,
            message: response.data.response,
            type: 'text'
          });
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Beneficial Ownership Filing endpoints
  app.post('/api/beneficial-ownership/generate', async (req: Request, res: Response) => {
    try {
      const { companyId, beneficialOwners, significantControl } = req.body;
      
      // Get company data
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Generate COR46 form using Form Autopilot agent
      const formResult = await aiOrchestrator.routeTask('generate_beneficial_ownership_form', {
        companyId,
        registrationNumber: company.registrationNumber,
        companyName: company.name,
        beneficialOwners,
        significantControl
      });

      // Create beneficial ownership filing record
      const beneficialOwnershipFiling = await storage.createBeneficialOwnershipFiling({
        companyId,
        beneficialOwners,
        significantControl,
        complianceStatus: 'pending',
        nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        remindersSent: 0
      });

      res.json({
        success: true,
        filing: beneficialOwnershipFiling,
        formResult
      });
    } catch (error) {
      console.error("Beneficial ownership generation error:", error);
      res.status(500).json({ error: 'Failed to generate beneficial ownership filing' });
    }
  });

  app.post('/api/beneficial-ownership/submit', async (req: Request, res: Response) => {
    try {
      const { filingId, formData } = req.body;
      
      // Submit form via Form Autopilot agent
      const submissionResult = await aiOrchestrator.routeTask('submit_cipc_form', {
        formType: 'COR46',
        formData
      }) as { cipcReference: string; [key: string]: any };

      // Create CIPC filing record
      const cipcFiling = await storage.createCipcFiling({
        companyId: formData.companyId,
        filingType: 'beneficial_ownership',
        status: 'submitted',
        submittedAt: new Date(),
        cipcReference: submissionResult.cipcReference,
        amount: 750, // R7.50 total cost
        submissionData: formData,
        agentId: 'form_autopilot'
      });

      res.json({
        success: true,
        filing: cipcFiling,
        submission: submissionResult
      });
    } catch (error) {
      console.error("Beneficial ownership submission error:", error);
      res.status(500).json({ error: 'Failed to submit beneficial ownership filing' });
    }
  });

  app.get('/api/beneficial-ownership/:companyId', async (req: Request, res: Response) => {
    try {
      const filing = await storage.getBeneficialOwnershipFiling(req.params.companyId);
      
      if (!filing) {
        return res.status(404).json({ error: 'No beneficial ownership filing found' });
      }

      // Check compliance status using Regulation Sentinel
      const complianceCheck = await aiOrchestrator.routeTask('check_beneficial_ownership_compliance', {
        companyId: req.params.companyId
      });

      res.json({
        filing,
        compliance: complianceCheck
      });
    } catch (error) {
      console.error("Beneficial ownership fetch error:", error);
      res.status(500).json({ error: 'Failed to fetch beneficial ownership data' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/dashboard/:companyId', async (req, res) => {
    try {
      const activities = await storage.getAgentActivities(req.params.companyId);
      const alerts = await storage.getComplianceAlerts(req.params.companyId);
      
      const stats = {
        activeAgents: 6,
        formsFiledThisMonth: activities.filter((a: any) => 
          a.activityType === 'form_generated' && 
          new Date(a.createdAt).getMonth() === new Date().getMonth()
        ).length,
        alertsSent: alerts.length,
        costSaved: 2400, // Mock calculation
        upcomingDeadlines: alerts.filter((a: any) => !a.isRead).length
      };

      res.json({ stats, activities: activities.slice(0, 5), alerts: alerts.slice(0, 3) });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
