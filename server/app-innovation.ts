import express from 'express';
import aisensyWebhook from './src/webhooks/aisensy';
import pino from 'pino';
import { config } from './config';
import { createApiRouter } from './api/router';
import { TypebotOrchestrator } from './services/typebot-orchestrator';
import { WhatsAppInnovationBridge } from './services/whatsapp-innovation-bridge';
import { RealtimeAnalytics } from './services/realtime-analytics';
import { InnovationMonitor } from './services/innovation-monitor';

const logger = pino({ level: config.logLevel });
const app = express();

// 🚀 Innovation Middleware Stack
app.use('/innovation/typebot', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 🔮 Revolutionary Services
const typebotOrchestrator = new TypebotOrchestrator(logger);
const whatsappBridge = new WhatsAppInnovationBridge();
/*
const aiOrchestrator = new AIOrchestrator(config);
*/
const analytics = new RealtimeAnalytics();
const monitor = new InnovationMonitor();

// ⚡ Typebot-First Routing
const apiRouter = createApiRouter(typebotOrchestrator, config);
app.use(apiRouter);
app.use('/webhooks/whatsapp/innovation', whatsappBridge.getWebhookRouter());
/*
app.use('/api/v2/ai', aiOrchestrator.getRouter());
*/
app.use('/api/v2/analytics', analytics.getRouter());
app.use('/innovation/health', monitor.getHealthRouter());

app.use('/webhooks/aisensy', aisensyWebhook);

// 🌟 Innovation Endpoints
app.post('/innovation/deploy-flow', async (req, res) => {
  const { flowType, configuration } = req.body;

  try {
    const deployment = await typebotOrchestrator.deployInnovationFlow({ flowType, configuration });
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

const port = config.server.port;
app.listen(port, () => {
  logger.info(`🚀 Innovation Server listening on port ${port}`);
});
