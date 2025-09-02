# Android Debug Keystore Setup

## Issue: Debug keystore not found

The Android debug keystore doesn't exist yet. You need to:

## Option 1: Install Android Studio
1. Download Android Studio from https://developer.android.com/studio
2. Create a new Android project
3. Build the project - this creates the debug keystore automatically

## Option 2: Create debug keystore manually
```cmd
"C:\Program Files\Java\jdk-24\bin\keytool" -genkey -v -keystore "%USERPROFILE%\.android\debug.keystore" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

## Option 3: Use production keystore
If you have a production keystore:
```cmd
"C:\Program Files\Java\jdk-24\bin\keytool" -list -v -keystore "path\to\your\keystore.jks" -alias your_alias
```

## After keystore exists:
1. Get SHA-256 fingerprint:
   ```cmd
   "C:\Program Files\Java\jdk-24\bin\keytool" -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
   ```

2. Generate app hash:
   ```cmd
   npm run generate-hash "YOUR_SHA256_FINGERPRINT"
   ```

3. Update `.env.local` with real values

## Current Status
Using sample hash `mZNKAd++fwN` for development. Replace with actual hash for production.