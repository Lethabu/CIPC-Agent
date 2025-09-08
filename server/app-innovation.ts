import express from 'express';
import { TypebotOrchestrator } from './services/typebot-orchestrator';
import { WhatsAppInnovationBridge } from './services/whatsapp-innovation-bridge';
import { AIOrchestrator } from './services/ai-orchestrator';
import { RealtimeAnalytics } from './services/realtime-analytics';
import { InnovationMonitor } from './services/innovation-monitor';

const app = express();

// 🚀 Innovation Middleware Stack
app.use('/innovation/typebot', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 🔮 Revolutionary Services
const typebotOrchestrator = new TypebotOrchestrator();
const whatsappBridge = new WhatsAppInnovationBridge();
const aiOrchestrator = new AIOrchestrator();
const analytics = new RealtimeAnalytics();
const monitor = new InnovationMonitor();

// ⚡ Typebot-First Routing
app.use('/api/v2/conversations', typebotOrchestrator.getRouter());
app.use('/webhooks/whatsapp/innovation', whatsappBridge.getWebhookRouter());
app.use('/api/v2/ai', aiOrchestrator.getRouter());
app.use('/api/v2/analytics', analytics.getRouter());
app.use('/innovation/health', monitor.getHealthRouter());

// 🌟 Innovation Endpoints
app.post('/innovation/deploy-flow', async (req, res) => {
  const { flowType, configuration } = req.body;
  
  try {
    const deployment = await typebotOrchestrator.deployInnovationFlow({ flowType, configuration }); // This needs to be adjusted based on TypebotOrchestrator's actual method signature
    res.json({
      success: true,
      deploymentId: deployment.id,
      flowUrl: deployment.publicUrl,
      analyticsUrl: deployment.analyticsUrl
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      innovationSupport: 'Contact innovation @cipcagent.co.za'
    });
  }
});

export default app;
