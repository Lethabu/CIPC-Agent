import express from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { db } from '../db'; // Drizzle
import { beneficialOwners } from '../../shared/schema';
import { popia } from '../middleware/popia';

const router = express.Router();
router.use(popia);

const schema = z.object({ regNo: z.string(), name: z.string(), id: z.string(), pct: z.number() });

router.post('/assist', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: `Validate BO for ${parsed.data.name}` }],
  });
  await db.insert(beneficialOwners).values(parsed.data);
  res.json({ guidance: response.choices[0].message.content });
});

export default router;
