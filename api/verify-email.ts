import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'https://cipc-agent.vercel.app';
    const redirectUrl = `${frontendUrl}/auth/action?${new URLSearchParams(req.query as Record<string, string>).toString()}`;
    
    res.redirect(302, redirectUrl);
  } catch (error) {
    res.status(500).json({ error: 'Redirect failed' });
  }
}
