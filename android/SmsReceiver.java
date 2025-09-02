package com.cipcagent.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.google.android.gms.auth.api.phone.SmsRetriever;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.common.api.Status;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SmsReceiver extends BroadcastReceiver {
    
    private static final String TAG = "SmsReceiver";
    private OtpListener otpListener;
    
    public interface OtpListener {
        void onOtpReceived(String otp);
        void onOtpTimeout();
    }
    
    public void setOtpListener(OtpListener listener) {
        this.otpListener = listener;
    }
    
    @Override
    public void onReceive(Context context, Intent intent) {
        if (SmsRetriever.SMS_RETRIEVED_ACTION.equals(intent.getAction())) {
            Bundle extras = intent.getExtras();
            Status status = (Status) extras.get(SmsRetriever.EXTRA_STATUS);
            
            switch (status.getStatusCode()) {
                case CommonStatusCodes.SUCCESS:
                    String message = extras.getString(SmsRetriever.EXTRA_SMS_MESSAGE);
                    if (message != null) {
                        String otp = extractOtp(message);
                        if (otp != null && otpListener != null) {
                            otpListener.onOtpReceived(otp);
                        }
                    }
                    break;
                    
                case CommonStatusCodes.TIMEOUT:
                    if (otpListener != null) {
                        otpListener.onOtpTimeout();
                    }
                    break;
            }
        }
    }
    
    /**
     * Extract OTP from WhatsApp/SMS message for zero-tap autofill
     * Supports various OTP formats for CIPC Agent
     */
    private String extractOtp(String message) {
        // Pattern for 4-6 digit OTP (WhatsApp typically uses 6 digits)
        Pattern pattern = Pattern.compile("\\b\\d{4,6}\\b");
        Matcher matcher = pattern.matcher(message);
        
        if (matcher.find()) {
            return matcher.group();
        }
        
        // Fallback pattern for "code is: 123456" format
        Pattern fallbackPattern = Pattern.compile("code is:?\\s*(\\d{4,8})");
        Matcher fallbackMatcher = fallbackPattern.matcher(message);
        
        if (fallbackMatcher.find()) {
            return fallbackMatcher.group(1);
        }
        
        return null;
    }
}