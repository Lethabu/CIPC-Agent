import { Request, Response, NextFunction } from 'express';
import { auth } from '../../services/firebase';
import { sendEmail } from '../../services/email';
import { config } from '../../config';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({
      error: {
        code: 'auth/no-token',
        message: 'Unauthorized: No token provided.',
      },
    });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);

    if (!decodedToken.email) {
      return res.status(400).json({
        error: {
          code: 'auth/no-email',
          message: 'Bad Request: No email found in token.',
        },
      });
    }

    if (!decodedToken.email_verified) {
      const actionCodeSettings = {
        url: `${config.server.frontendUrl}/auth/action`,
      };

      const link = await auth.generateEmailVerificationLink(
        decodedToken.email,
        actionCodeSettings
      );

      await sendEmail(
        decodedToken.email,
        'Verify your email address',
        `Please click on the following link to verify your email address: ${link}`
      );

      return res.status(403).json({
        error: {
          code: 'auth/email-not-verified',
          message: 'Forbidden: Email not verified. A verification email has been sent.',
        },
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified
    } as { uid: string; email: string; email_verified: boolean };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: {
        code: 'auth/invalid-token',
        message: 'Unauthorized: Invalid token.',
      },
    });
  }
};
