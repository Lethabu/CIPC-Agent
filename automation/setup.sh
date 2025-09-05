#!/bin/bash

echo "🤖 Setting up CIPC Automation System"
echo "===================================="

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
playwright install chromium

# Install Tesseract for CAPTCHA solving
echo "🔍 Installing Tesseract OCR..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get update
    sudo apt-get install -y tesseract-ocr
elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew install tesseract
fi

# Create environment file
echo "⚙️ Creating automation environment..."
cat > .env.automation << EOF
# CIPC Credentials (SECURE THESE!)
CIPC_USERNAME=your-cipc-username
CIPC_PASSWORD=your-cipc-password

# Email for OTP retrieval
CIPC_EMAIL=filings@cipcagent.co.za
CIPC_EMAIL_PASSWORD=your-app-password

# Redis for OTP caching
REDIS_URL=redis://localhost:6379

# Webhook for SMS OTP
SMS_WEBHOOK_URL=http://localhost:5000/sms-webhook
EOF

echo "✅ Automation setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Update .env.automation with your CIPC credentials"
echo "2. Set up dedicated CIPC filer account"
echo "3. Configure email app password for OTP retrieval"
echo "4. Test with: python3 cipc_runner.py annual_return '{\"company_name\": \"Test Co\"}'"
echo ""
echo "⚠️  SECURITY: Store credentials in HashiCorp Vault or AWS Secrets Manager for production"