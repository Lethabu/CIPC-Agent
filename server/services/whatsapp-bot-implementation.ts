import { db } from '../src/db/drizzle';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function handlePOPIAConsent(phoneNumber: string, message?: string) {
  let user = await db.query.users.findFirst({
    where: eq(users.phoneNumber, phoneNumber),
  });

  if (!user) {
    // Create user if not exists
    const newUser = await db.insert(users).values({ phoneNumber }).returning();
    user = newUser[0];
  }

  if (user.consentGiven) {
    return { consented: true };
  }

  if (message) {
    const lowerMessage = message.toLowerCase().trim();
    if (lowerMessage === 'yes' || lowerMessage === 'y') {
      await db
        .update(users)
        .set({
          consentGiven: true,
          consentDate: new Date(),
        })
        .where(eq(users.phoneNumber, phoneNumber));
      return { consented: true, stored: true };
    } else if (lowerMessage === 'no' || lowerMessage === 'n') {
      return { consented: false };
    }
  }

  // Send consent prompt (mock/log; in production, integrate with AISensy/WhatsApp API)
  console.log(`POPIA Consent Prompt to ${phoneNumber}: Do you consent to the processing of your personal information in accordance with POPIA? Reply YES to consent or NO to decline.`);
  // Example: await sendWhatsAppMessage(phoneNumber, promptText);

  return { promptSent: true, needsResponse: true };
}