import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // This route handles email verification redirects from Firebase.
  // It forwards the Firebase query parameters to the frontend application,
  // which can then use the Firebase SDK to apply the email verification.
  const frontendUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:3000');
  frontendUrl.pathname = '/auth/action';
  frontendUrl.search = new URLSearchParams(req.query as Record<string, string>).toString();

  res.redirect(frontendUrl.toString());
}
