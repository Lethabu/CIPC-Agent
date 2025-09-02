package com.cipcagent.app;

import android.os.Bundle;
import android.widget.EditText;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    
    private EditText otpEditText;
    private OtpAutoFillManager otpManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        otpEditText = findViewById(R.id.otp_edit_text);
        Button requestOtpButton = findViewById(R.id.request_otp_button);
        
        // Initialize OTP autofill manager
        otpManager = new OtpAutoFillManager(this, otpEditText);
        otpManager.setListener(new OtpAutoFillManager.OtpAutoFillListener() {
            @Override
            public void onOtpAutoFilled(String otp) {
                Toast.makeText(MainActivity.this, "OTP auto-filled", Toast.LENGTH_SHORT).show();
                // Auto-verify or enable submit button
            }
            
            @Override
            public void onOtpAutoFillFailed(String error) {
                Toast.makeText(MainActivity.this, "Auto-fill failed: " + error, Toast.LENGTH_SHORT).show();
            }
        });
        
        requestOtpButton.setOnClickListener(v -> {
            // Start SMS retriever before requesting OTP
            otpManager.startSmsRetriever();
            // Make API call to request OTP
            requestOtp();
        });
    }
    
    private void requestOtp() {
        // API call to /api/auth/send-otp
        // Implementation depends on your HTTP client
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (otpManager != null) {
            otpManager.stopSmsRetriever();
        }
    }
}