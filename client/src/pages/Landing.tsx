import React from 'react'

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            CIPC Compliance in <span className="text-green-600">90 Seconds</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Stop spending R2000+ on annual returns. Our AI handles everything via WhatsApp.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm">POPIA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-sm">99.5% Filing Success</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span className="text-sm">24/7 WhatsApp Support</span>
            </div>
          </div>

          {/* Primary CTA */}
          <a
            href="https://wa.me/27825551234?text=Hi%2C%20I%20need%20my%20free%20CIPC%20compliance%20score"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors mb-4"
          >
            📱 Start on WhatsApp (FREE Score)
          </a>
          
          <p className="text-sm text-gray-500">
            First 10 businesses get 3 months FREE • No credit card required
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="font-bold mb-2">1. Upload Documents</h3>
            <p className="text-gray-600">Send your ID & company docs via WhatsApp</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-bold mb-2">2. AI Processing</h3>
            <p className="text-gray-600">Our agents auto-fill CIPC forms in seconds</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="font-bold mb-2">3. Auto-Submit</h3>
            <p className="text-gray-600">Direct filing to CIPC + confirmation</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            
            {/* Free Tier */}
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-xl mb-2">Free</h3>
              <p className="text-3xl font-bold mb-4">R0<span className="text-sm font-normal">/month</span></p>
              <ul className="text-sm text-gray-600 mb-6">
                <li>• CIPC deadline alerts</li>
                <li>• Compliance score check</li>
                <li>• WhatsApp support</li>
              </ul>
              <button className="w-full bg-gray-200 text-gray-800 py-2 rounded font-bold">
                Get Started
              </button>
            </div>

            {/* Starter Tier - Most Popular */}
            <div className="bg-white rounded-lg p-6 border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">Most Popular</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Starter</h3>
              <p className="text-3xl font-bold mb-4">R199<span className="text-sm font-normal">/month</span></p>
              <ul className="text-sm text-gray-600 mb-6">
                <li>• Auto annual returns</li>
                <li>• B-BBEE certificates</li>
                <li>• Director changes</li>
                <li>• Priority support</li>
              </ul>
              <a
                href="https://wa.me/27825551234?text=I%20want%20Starter%20plan%20R199"
                target="_blank"
                className="block w-full bg-green-500 text-white py-2 rounded font-bold text-center"
              >
                Choose Plan
              </a>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-xl mb-2">Pro</h3>
              <p className="text-3xl font-bold mb-4">R499<span className="text-sm font-normal">/month</span></p>
              <ul className="text-sm text-gray-600 mb-6">
                <li>• Everything in Starter</li>
                <li>• SARS eFiling</li>
                <li>• Custom compliance alerts</li>
                <li>• Dedicated account manager</li>
              </ul>
              <button className="w-full bg-gray-800 text-white py-2 rounded font-bold">
                Coming Soon
              </button>
            </div>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 CIPC Agent Army. POPIA Compliant. Made in South Africa 🇿🇦</p>
        </div>
      </footer>
    </main>
  )
}