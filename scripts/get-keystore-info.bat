@echo off
set KEYTOOL_PATH="C:\Program Files\Java\jdk-24\bin\keytool.exe"
set KEYSTORE_PATH="%USERPROFILE%\.android\debug.keystore"

echo Checking for debug keystore...
if not exist %KEYSTORE_PATH% (
    echo Debug keystore not found at %KEYSTORE_PATH%
    echo You need to create an Android project first or install Android Studio
    exit /b 1
)

echo Getting SHA-256 fingerprint...
%KEYTOOL_PATH% -list -v -keystore %KEYSTORE_PATH% -alias androiddebugkey -storepass android -keypass android | findstr "SHA256"

echo.
echo Copy the SHA-256 fingerprint above and run:
echo npm run generate-hash "YOUR_SHA256_FINGERPRINT"