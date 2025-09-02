# Android Zero-Tap Autofill Setup

## 1. Generate App Signature Hash

### Get SHA-256 Fingerprint:
```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Production keystore
keytool -list -v -keystore /path/to/your/keystore.jks -alias your_alias
```

### Generate Hash:
```bash
cd server/utils
node generate-app-hash.js
```

## 2. Configure Environment
Add to `.env.local`:
```
ANDROID_PACKAGE_NAME="com.cipcagent.app"
ANDROID_SHA256_FINGERPRINT="YOUR_SHA256_HERE"
ANDROID_APP_HASH="GENERATED_HASH_HERE"
```

## 3. WhatsApp Template Setup
1. Go to Meta Business Manager
2. Create auth template with autofill button
3. Provide:
   - Package Name: `com.cipcagent.app`
   - App Signature Hash: Generated hash

## 4. Android Integration
1. Add dependencies to `build.gradle`
2. Copy `SmsReceiver.java` and `OtpAutoFillManager.java`
3. Update `AndroidManifest.xml`
4. Implement in your Activity:

```java
OtpAutoFillManager otpManager = new OtpAutoFillManager(this, otpEditText);
otpManager.setListener(new OtpAutoFillManager.OtpAutoFillListener() {
    @Override
    public void onOtpAutoFilled(String otp) {
        // OTP auto-filled
    }
    
    @Override
    public void onOtpAutoFillFailed(String error) {
        // Handle failure
    }
});

// Start listening
otpManager.startSmsRetriever();
```

## 5. Testing
- Use physical device (Android 11+)
- Test with WhatsApp OTP messages
- Verify zero-tap functionality