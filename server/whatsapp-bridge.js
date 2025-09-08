import express from 'express';
import { TypebotClient } from '@typebot.io/js';

const app = express();
app.use(express.json());

const typebot = TypebotClient.create({
  url: process.env.TYPEBOT_VIEWER_URL || 'http://localhost:3002',
  typebot: 'cipc-compliance-bot' // This should be configured based on your Typebot setup
});

app.post('/webhooks/whatsapp', async (req, res) => {
  const { message, from } = req.body;

  try {
    // Send to Typebot for processing
    const response = await typebot.sendMessage({
      message,
      sessionId: from
    });

    // Return response to WhatsApp API
    res.json({ response: response.messages });
  } catch (error) {
    console.error('Error processing WhatsApp message with Typebot:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`WhatsApp Bridge listening on port ${PORT}`);
});
