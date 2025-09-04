import 'express-session';

declare module 'express-session' {
  interface SessionData {
    otp?: string;
    phoneNumber?: string;
  }
}
