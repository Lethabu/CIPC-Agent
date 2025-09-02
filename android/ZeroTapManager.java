package com.cipcagent.app;

import android.app.Activity;
import android.content.IntentFilter;
import android.util.Log;
import com.google.android.gms.auth.api.phone.SmsRetriever;
import com.google.android.gms.tasks.Task;

/**
 * Manager for WhatsApp Zero-Tap Autofill integration
 * Handles SMS Retriever API for automatic OTP detection
 */
public class ZeroTapManager {
    private static final String TAG = "ZeroTapManager";
    private Activity activity;
    private SmsReceiver smsReceiver;
    private boolean isListening = false;

    public ZeroTapManager(Activity activity) {
        this.activity = activity;
        this.smsReceiver = new SmsReceiver();
    }

    /**
     * Start listening for WhatsApp OTP messages
     */
    public void startListening(SmsReceiver.OtpListener listener) {
        if (isListening) {
            Log.w(TAG, "Already listening for OTP");
            return;
        }

        smsReceiver.setOtpListener(listener);
        
        // Register SMS receiver
        IntentFilter intentFilter = new IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION);
        activity.registerReceiver(smsReceiver, intentFilter);
        
        // Start SMS Retriever
        Task<Void> task = SmsRetriever.getClient(activity).startSmsRetriever();
        task.addOnSuccessListener(aVoid -> {
            Log.d(TAG, "SMS Retriever started successfully - ready for zero-tap");
            isListening = true;
        });
        
        task.addOnFailureListener(e -> {
            Log.e(TAG, "Failed to start SMS Retriever", e);
            stopListening();
        });
    }

    /**
     * Stop listening for OTP messages
     */
    public void stopListening() {
        if (!isListening) {
            return;
        }
        
        try {
            activity.unregisterReceiver(smsReceiver);
            isListening = false;
            Log.d(TAG, "Stopped listening for OTP");
        } catch (IllegalArgumentException e) {
            Log.w(TAG, "Receiver not registered", e);
        }
    }

    public boolean isListening() {
        return isListening;
    }
}