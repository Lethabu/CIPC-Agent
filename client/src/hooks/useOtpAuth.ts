import { useState } from 'react';

interface OtpAuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useOtpAuth = () => {
  const [state, setState] = useState<OtpAuthState>({
    loading: false,
    error: null,
    success: false
  });

  const sendOtp = async (phoneNumber: string) => {
    setState({ loading: true, error: null, success: false });
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setState({ loading: false, error: null, success: true });
      } else {
        setState({ loading: false, error: data.error, success: false });
      }
    } catch (error) {
      setState({ loading: false, error: 'Network error', success: false });
    }
  };

  const verifyOtp = async (otp: string) => {
    setState({ loading: true, error: null, success: false });
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setState({ loading: false, error: null, success: true });
        return true;
      } else {
        setState({ loading: false, error: data.error, success: false });
        return false;
      }
    } catch (error) {
      setState({ loading: false, error: 'Network error', success: false });
      return false;
    }
  };

  return {
    ...state,
    sendOtp,
    verifyOtp
  };
};