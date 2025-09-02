package com.cipcagent.app;

import android.app.Activity;
import android.content.IntentFilter;
import android.widget.EditText;
import com.google.android.gms.auth.api.phone.SmsRetriever;
import com.google.android.gms.tasks.Task;

public class OtpAutoFillManager implements SmsReceiver.OtpListener {
    
    private Activity activity;
    private EditText otpEditText;
    private SmsReceiver smsReceiver;
    private OtpAutoFillListener listener;
    
    public interface OtpAutoFillListener {
        void onOtpAutoFilled(String otp);
        void onOtpAutoFillFailed(String error);
    }
    
    public OtpAutoFillManager(Activity activity, EditText otpEditText) {
        this.activity = activity;
        this.otpEditText = otpEditText;
        this.smsReceiver = new SmsReceiver();
        this.smsReceiver.setOtpListener(this);
    }
    
    public void setListener(OtpAutoFillListener listener) {
        this.listener = listener;
    }
    
    /**
     * Start SMS retriever for zero-tap autofill
     */
    public void startSmsRetriever() {
        SmsRetriever.getClient(activity).startSmsRetriever()
            .addOnSuccessListener(aVoid -> {
                // SMS retriever started successfully
                registerReceiver();
            })
            .addOnFailureListener(e -> {
                if (listener != null) {
                    listener.onOtpAutoFillFailed("Failed to start SMS retriever: " + e.getMessage());
                }
            });
    }
    
    /**
     * Stop SMS retriever and unregister receiver
     */
    public void stopSmsRetriever() {
        try {
            activity.unregisterReceiver(smsReceiver);
        } catch (IllegalArgumentException e) {
            // Receiver not registered
        }
    }
    
    private void registerReceiver() {
        IntentFilter filter = new IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION);
        activity.registerReceiver(smsReceiver, filter);
    }
    
    @Override
    public void onOtpReceived(String otp) {
        activity.runOnUiThread(() -> {
            if (otpEditText != null) {
                otpEditText.setText(otp);
                otpEditText.setSelection(otp.length());
            }
            
            if (listener != null) {
                listener.onOtpAutoFilled(otp);
            }
        });
    }
    
    @Override
    public void onOtpTimeout() {
        if (listener != null) {
            listener.onOtpAutoFillFailed("OTP retrieval timeout");
        }
    }
}