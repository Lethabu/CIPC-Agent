import express from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../db/drizzle.js'; // Drizzle
import { beneficialOwners } from '@shared/schema.js';
import { popia } from '../middleware/popia.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
router.use(popia);
router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

const schema = z.object({
  regNo: z.string(),
  name: z.string(),
  id: z.string(),
  idNum: z.string(),
  pct: z.coerce.string(),
});

router.post('/assist', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Validate BO for ${parsed.data.name}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  await db.insert(beneficialOwners).values(parsed.data);
  res.json({ guidance: text });
});

export default router;
