import React, { useState } from 'react';
import styles from './PaymentSelector.module.css';

interface PaymentSelectorProps {
  amount: number;
  service: string;
  onPaymentInitiated: (paymentUrl: string) => void;
}

const PaymentSelector: React.FC<PaymentSelectorProps> = ({ amount, service, onPaymentInitiated }) => {
  const [selectedProvider, setSelectedProvider] = useState('paystack');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const paymentProviders = [
    { id: 'paystack', name: 'PayStack', logo: '💳', description: 'Card payments' },
    { id: 'payfast', name: 'PayFast', logo: '🏦', description: 'EFT & Cards' }
  ];

  const handlePayment = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          amount,
          email,
          phone,
          service,
          description: `CIPC ${service} Service - R${amount}`
        })
      });

      const result = await response.json();
      
      if (result.success && result.checkoutUrl) {
        onPaymentInitiated(result.checkoutUrl);
      } else {
        alert(result.error || 'Payment initialization failed');
      }
    } catch (error) {
      alert('Payment error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentSelector}>
      <h3>Complete Your Payment - R{amount}</h3>
      
      <div className={styles.paymentForm}>
        <div className={styles.formGroup}>
          <label>Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0821234567"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Payment Method</label>
          <div className={styles.providerGrid}>
            {paymentProviders.map(provider => (
              <div
                key={provider.id}
                className={`${styles.providerCard} ${selectedProvider === provider.id ? styles.selected : ''}`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <div className={styles.providerLogo}>{provider.logo}</div>
                <div className={styles.providerInfo}>
                  <div className={styles.providerName}>{provider.name}</div>
                  <div className={styles.providerDesc}>{provider.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={styles.payButton}
          onClick={handlePayment}
          disabled={loading || !email}
        >
          {loading ? 'Processing...' : `Pay R${amount} with ${paymentProviders.find(p => p.id === selectedProvider)?.name}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentSelector;