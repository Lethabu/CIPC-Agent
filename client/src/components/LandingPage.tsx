import React, { useState, useEffect } from 'react';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [serviceType, setServiceType] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);

  useEffect(() => {
    // Fade in animation observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Lead capture timer
    const timer = setTimeout(() => setShowLeadCapture(true), 30000);

    // Exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitIntent) {
        setShowExitIntent(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      observer.disconnect();
    };
  }, [showExitIntent]);

  const calculatePrice = () => {
    let baseFee = 0;
    let docFee = pageCount * 24;

    switch(serviceType) {
      case 'annual': baseFee = 175; break;
      case 'bo': baseFee = 50; docFee = 0; break;
      case 'registration': baseFee = 650; break;
      case 'recovery': baseFee = 0; docFee = 0; break;
    }

    return { baseFee, docFee, total: baseFee + docFee };
  };

  const openWhatsApp = (message: string) => {
    const phoneNumber = '27876543210'; // AI Sensy WhatsApp number
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const price = calculatePrice();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <nav className="nav container">
          <a href="#" className="logo">CIPC Agent</a>
          <ul className="nav-links">
            <li><a href="#services">Services</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#" className="cta-button">Get Started Free</a></li>
          </ul>
        </nav>
      </header>

      {/* Urgency Banner */}
      <div className="urgency-banner">
        ⚠️ URGENT: Beneficial Ownership filings due! Avoid R50,000 penalties - File now in 5 minutes
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1>Automate Your CIPC Compliance in Minutes</h1>
          <p className="subtitle">
            South Africa's most trusted AI-powered platform for Annual Returns, Beneficial Ownership filings, 
            and Company Registration. No more manual paperwork, no more missed deadlines.
          </p>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">15,000+</span>
              <span className="stat-label">Companies Compliant</span>
            </div>
            <div className="stat">
              <span className="stat-number">97%</span>
              <span className="stat-label">Success Rate</span>
            </div>
            <div className="stat">
              <span className="stat-number">2 Min</span>
              <span className="stat-label">Average Filing Time</span>
            </div>
          </div>
          
          <button 
            className="cta-button"
            onClick={() => openWhatsApp("🚀 I want to file my CIPC returns in 2 minutes! Please help me get started.")}
          >
            🚀 File in 2 Minutes via WhatsApp
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="services" id="services">
        <div className="container">
          <h2 className="section-title">Complete CIPC Compliance Suite</h2>
          <div className="services-grid">
            {[
              {
                icon: '📋',
                title: 'Annual Returns Filing',
                price: 'From R175',
                description: 'Automated annual return filings with real-time CIPC integration. Never miss another deadline.',
                features: ['Auto-calculates due dates', 'Instant CIPC submission', 'SMS & email confirmations', 'Penalty avoidance guaranteed']
              },
              {
                icon: '👥',
                title: 'Beneficial Ownership',
                price: 'R50',
                description: 'Mandatory BO filings made simple. WhatsApp us your director details, we handle the rest.',
                features: ['WhatsApp-based data collection', 'Auto-compliance checking', 'Instant CIPC filing', 'Avoid R50,000 penalties']
              },
              {
                icon: '🏢',
                title: 'Company Registration',
                price: 'R650',
                description: 'Register new companies in 24 hours with our AI-powered document processing.',
                features: ['AI document extraction', 'Same-day registration', 'Auto B-BBEE certificates', 'SARS/UIF registration included']
              },
              {
                icon: '🔄',
                title: 'Payment Recovery',
                price: 'No Fee',
                description: 'Stuck CIPC payments? Our Payment Sentinel Agent recovers your money automatically.',
                features: ['Blockchain payment tracking', 'Auto-reconciliation', 'CIPC escalation', '100% success rate']
              }
            ].map((service, index) => (
              <div key={index} className="service-card fade-in">
                <span className="service-icon">{service.icon}</span>
                <h3 className="service-title">{service.title}</h3>
                <div className="service-price">{service.price}</div>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Demo Section */}
      <section className="whatsapp-demo" id="how-it-works">
        <div className="container">
          <h2 className="section-title">File Your Returns via WhatsApp in 2 Minutes</h2>
          <p style={{fontSize: '1.2rem', marginBottom: '2rem'}}>
            No apps to download, no complex forms. Just WhatsApp us your documents.
          </p>
          
          <div className="whatsapp-mockup">
            <div className="chat-message">
              <strong>You:</strong> Hi, I need to file my annual return
            </div>
            <div className="chat-reply">
              <strong>CIPC Agent:</strong> 🤖 Great! Send me your company registration number and I'll check your status.
            </div>
            <div className="chat-message">
              <strong>You:</strong> 2023/123456/07
            </div>
            <div className="chat-reply">
              <strong>CIPC Agent:</strong> ✅ Found it! Your annual return is due 15 March 2025. Cost: R175. Send me your updated director details to proceed.
            </div>
            <div className="chat-message">
              <strong>You:</strong> *sends ID documents*
            </div>
            <div className="chat-reply">
              <strong>CIPC Agent:</strong> 🎉 Perfect! Filing now... DONE! ✅<br/><br/>
              Confirmation: AR2025/123456<br/>
              Next due: 15 March 2026<br/>
              Calendar reminder set!
            </div>
          </div>
          
          <button 
            className="cta-button"
            style={{background: 'white', color: '#25d366', fontSize: '1.2rem', padding: '1rem 2rem'}}
            onClick={() => openWhatsApp("Hi, I need help with my CIPC compliance")}
          >
            📱 Start on WhatsApp Now
          </button>
        </div>
      </section>

      {/* Pricing Calculator */}
      <section className="pricing" id="pricing">
        <div className="container">
          <h2 className="section-title">Transparent Pricing</h2>
          <div className="pricing-calculator">
            <h3 style={{textAlign: 'center', marginBottom: '2rem'}}>Calculate Your Filing Cost</h3>
            <select 
              className="calculator-input" 
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            >
              <option value="">Select Service</option>
              <option value="annual">Annual Return</option>
              <option value="bo">Beneficial Ownership</option>
              <option value="registration">Company Registration</option>
              <option value="recovery">Payment Recovery</option>
            </select>
            <input 
              type="number" 
              className="calculator-input" 
              placeholder="Number of document pages"
              value={pageCount || ''}
              onChange={(e) => setPageCount(parseInt(e.target.value) || 0)}
            />
            {serviceType && (
              <div className="price-breakdown">
                {serviceType === 'recovery' ? (
                  <div style={{textAlign: 'center', color: 'var(--success)', fontWeight: 'bold'}}>
                    💚 FREE SERVICE<br/>
                    <small>We only succeed when you get your money back!</small>
                  </div>
                ) : (
                  <>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Base fee:</span>
                      <span>R{price.baseFee}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Document processing:</span>
                      <span>R{price.docFee}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ccc', paddingTop: '10px', marginTop: '10px'}}>
                      <span>Total:</span>
                      <span>R{price.total}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>CIPC Agent</h3>
              <p>South Africa's leading AI-powered CIPC compliance platform. Trusted by 15,000+ businesses.</p>
              <p><strong>📱 WhatsApp:</strong> <a href="https://wa.me/27876543210">087 654 3210</a></p>
              <p><strong>📧 Email:</strong> <a href="mailto:hello@cipcagent.co.za">hello@cipcagent.co.za</a></p>
            </div>
            <div className="footer-section">
              <h3>Services</h3>
              <a href="#">Annual Returns</a>
              <a href="#">Beneficial Ownership</a>
              <a href="#">Company Registration</a>
              <a href="#">Payment Recovery</a>
              <a href="#">B-BBEE Certificates</a>
            </div>
            <div className="footer-section">
              <h3>Support</h3>
              <a href="#">24/7 WhatsApp Support</a>
              <a href="#">Filing Status Check</a>
              <a href="#">Payment Tracking</a>
              <a href="#">Compliance Calendar</a>
              <a href="#">Knowledge Base</a>
            </div>
            <div className="footer-section">
              <h3>Legal</h3>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">POPIA Compliance</a>
              <a href="#">Refund Policy</a>
              <p style={{marginTop: '1rem'}}>🔒 CIPC Registered Agent<br/>🛡️ Bank-grade Security</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 CIPC Agent. All rights reserved. Reg: 2025/123456/07 | Licensed CIPC Filing Agent</p>
          </div>
        </div>
      </footer>

      {/* Live Chat Button */}
      <div className="live-chat" onClick={() => openWhatsApp("Hi CIPC Agent! I need help with my compliance. Can you assist me?")}>
        💬
      </div>

      {/* Lead Capture Popup */}
      {showLeadCapture && (
        <div className="popup-overlay" onClick={() => setShowLeadCapture(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowLeadCapture(false)}>&times;</button>
            <h3>⚠️ Don't Risk Deregistration!</h3>
            <p>Get your FREE compliance check now. We'll tell you exactly what filings you need and when they're due.</p>
            <button 
              className="popup-button"
              onClick={() => {
                openWhatsApp("🆓 I want my FREE compliance check! Please tell me what filings I need and when they're due.");
                setShowLeadCapture(false);
              }}
            >
              Get My FREE Compliance Check
            </button>
          </div>
        </div>
      )}

      {/* Exit Intent Popup */}
      {showExitIntent && (
        <div className="popup-overlay" onClick={() => setShowExitIntent(false)}>
          <div className="popup-content exit-intent" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowExitIntent(false)}>&times;</button>
            <h2>⚠️ Wait! Don't Leave!</h2>
            <h3 style={{color: '#fbbf24'}}>Special Offer: 50% Off First Filing</h3>
            <p>Join 15,000+ businesses who never miss a CIPC deadline. Get your first filing for just R87.50!</p>
            <button 
              className="popup-button discount"
              onClick={() => {
                openWhatsApp("🎉 I want to claim my 50% discount! Please help me file my first return for R87.50.");
                setShowExitIntent(false);
              }}
            >
              🎉 Claim 50% Discount Now
            </button>
            <p style={{fontSize: '0.9rem', marginTop: '1rem', opacity: 0.8}}>
              * Limited time offer. Valid for new customers only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;