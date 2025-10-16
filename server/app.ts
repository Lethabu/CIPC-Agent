import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/webhooks/typebot/onboarding', (req, res) => {
  res.json({ success: true });
});

app.post('/api/agents/onboarding', (req, res) => {
  res.json({ message: 'Onboarding processed', nextStep: 'complete' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`CIPC-Agent server running on port ${port}`);
});