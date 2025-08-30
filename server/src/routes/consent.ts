import { Router } from "express";
import { db } from "../db/drizzle";
import { consentLogs, insertConsentLogSchema } from "../../../shared/schema";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedData = insertConsentLogSchema.parse(req.body);

    const result = await db.insert(consentLogs).values(validatedData).returning();

    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    req.log.error({ err: error }, "Error logging consent");
    res.status(500).json({ success: false, error: "Failed to log consent" });
  }
});

export default router;
