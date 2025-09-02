# Zero-Tap Autofill Deployment Guide

## Quick Setup

1. **Generate App Hash**:
   ```bash
   # Get keystore fingerprint
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Generate hash
   npm run generate-hash "YOUR_SHA256_FINGERPRINT"
   ```

2. **Update Environment**:
   ```bash
   ANDROID_PACKAGE_NAME="com.cipcagent.app"
   ANDROID_SHA256_FINGERPRINT="YOUR_FINGERPRINT"
   ANDROID_APP_HASH="GENERATED_HASH"
   ```

3. **WhatsApp Template**:
   - Meta Business Manager → Message Templates
   - Create auth template with autofill button
   - Package: `com.cipcagent.app`
   - Hash: Generated hash

4. **Android Integration**:
   - Copy files from `/android` folder
   - Add dependencies to `build.gradle`
   - Implement `OtpAutoFillManager` in Activity

## API Endpoints

- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/generate-app-hash` - Generate hash

## Testing

- Physical Android device (11+)
- WhatsApp Business API configured
- Valid app signature hash