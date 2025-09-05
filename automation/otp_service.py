import imaplib
import email
import re
import time
import redis
from datetime import datetime, timedelta

class OTPService:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        self.email_config = {
            'server': 'imap.gmail.com',
            'port': 993,
            'username': 'filings@cipcagent.co.za',
            'password': 'your-app-password'
        }
    
    def get_latest_otp(self, timeout=300):
        """Get latest OTP with timeout"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            # Check Redis cache first
            otp = self.redis_client.get('latest_otp')
            if otp:
                self.redis_client.delete('latest_otp')  # Use once
                return otp
            
            # Check email for new OTP
            otp = self._check_email_for_otp()
            if otp:
                return otp
            
            time.sleep(10)  # Check every 10 seconds
        
        raise TimeoutError("OTP not received within timeout period")
    
    def _check_email_for_otp(self):
        """Check email inbox for CIPC OTP"""
        try:
            mail = imaplib.IMAP4_SSL(self.email_config['server'], self.email_config['port'])
            mail.login(self.email_config['username'], self.email_config['password'])
            mail.select('inbox')
            
            # Search for recent CIPC emails
            since_date = (datetime.now() - timedelta(minutes=10)).strftime("%d-%b-%Y")
            result, data = mail.search(None, f'(FROM "cipc.co.za" SINCE "{since_date}")')
            
            if data[0]:
                email_ids = data[0].split()
                latest_email_id = email_ids[-1]  # Get most recent
                
                result, data = mail.fetch(latest_email_id, '(RFC822)')
                raw_email = data[0][1]
                email_message = email.message_from_bytes(raw_email)
                
                # Extract OTP from email body
                if email_message.is_multipart():
                    for part in email_message.walk():
                        if part.get_content_type() == "text/plain":
                            body = part.get_payload(decode=True).decode()
                            otp = self._extract_otp_from_text(body)
                            if otp:
                                mail.close()
                                mail.logout()
                                return otp
                else:
                    body = email_message.get_payload(decode=True).decode()
                    otp = self._extract_otp_from_text(body)
                    if otp:
                        mail.close()
                        mail.logout()
                        return otp
            
            mail.close()
            mail.logout()
            return None
            
        except Exception as e:
            print(f"Email check failed: {e}")
            return None
    
    def _extract_otp_from_text(self, text):
        """Extract OTP code from email text"""
        # Common OTP patterns
        patterns = [
            r'OTP[:\s]*(\d{6})',
            r'code[:\s]*(\d{6})',
            r'verification[:\s]*(\d{6})',
            r'(\d{6})'  # Any 6-digit number
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def store_sms_otp(self, otp_code):
        """Store OTP received via SMS webhook"""
        self.redis_client.setex('latest_otp', 300, otp_code)  # 5-minute expiry
        print(f"OTP stored: {otp_code}")

# Flask webhook for SMS OTP
from flask import Flask, request, jsonify

app = Flask(__name__)
otp_service = OTPService()

@app.route('/sms-webhook', methods=['POST'])
def sms_webhook():
    """Webhook to receive SMS OTP"""
    data = request.json
    message_body = data.get('Body', '')
    
    # Extract OTP from SMS
    otp_match = re.search(r'\b(\d{6})\b', message_body)
    if otp_match:
        otp_code = otp_match.group(1)
        otp_service.store_sms_otp(otp_code)
        return jsonify({"status": "success", "otp": otp_code})
    
    return jsonify({"status": "no_otp_found"})

if __name__ == "__main__":
    # Test OTP retrieval
    service = OTPService()
    try:
        otp = service.get_latest_otp(timeout=60)
        print(f"Retrieved OTP: {otp}")
    except TimeoutError:
        print("No OTP received within timeout")