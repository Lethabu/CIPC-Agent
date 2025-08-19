import React, { useState } from 'react';

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
    <div className="payment-selector">
      <h3>Complete Your Payment - R{amount}</h3>
      
      <div className="payment-form">
        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0821234567"
          />
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <div className="provider-grid">
            {paymentProviders.map(provider => (
              <div
                key={provider.id}
                className={`provider-card ${selectedProvider === provider.id ? 'selected' : ''}`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <div className="provider-logo">{provider.logo}</div>
                <div className="provider-info">
                  <div className="provider-name">{provider.name}</div>
                  <div className="provider-desc">{provider.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="pay-button"
          onClick={handlePayment}
          disabled={loading || !email}
        >
          {loading ? 'Processing...' : `Pay R${amount} with ${paymentProviders.find(p => p.id === selectedProvider)?.name}`}
        </button>
      </div>

      <style jsx>{`
        .payment-selector {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .payment-form {
          margin-top: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .provider-grid {
          display: grid;
          gap: 1rem;
        }

        .provider-card {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .provider-card:hover {
          border-color: #3b82f6;
        }

        .provider-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .provider-logo {
          font-size: 2rem;
          margin-right: 1rem;
        }

        .provider-name {
          font-weight: 600;
          color: #374151;
        }

        .provider-desc {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .pay-button {
          width: 100%;
          padding: 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .pay-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .pay-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PaymentSelector;