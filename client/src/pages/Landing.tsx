import React from 'react'

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Automate Your CIPC Compliance
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Never miss a deadline again. We handle Annual Returns, Beneficial Ownership, and New Company Registrations via WhatsApp.
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

          {/* Primary CTAs */}
          <div className="flex justify-center gap-4">
            <a
              href="https://wa.me/27825551234?text=Hi%2C%20I%20want%20to%20file%20my%20Annual%20Return"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              File Annual Return
            </a>
            <a
              href="https://wa.me/27825551234?text=Hi%2C%20I%20need%20to%20file%20Beneficial%20Ownership"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              File Beneficial Ownership
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 border rounded-lg">
            <h3 className="font-bold text-xl mb-2">Annual Returns Filing</h3>
            <p className="text-gray-600">Automated calculation of fees and deadlines, with submissions via CIPC eServices. We ensure your Beneficial Ownership is filed first.</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <h3 className="font-bold text-xl mb-2">Beneficial Ownership Declarations</h3>
            <p className="text-gray-600">We automatically detect individuals with 5%+ ownership and facilitate BO declarations via WhatsApp to ensure compliance.</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <h3 className="font-bold text-xl mb-2">New Company Registration</h3>
            <p className="text-gray-600">A WhatsApp-guided flow that automates name reservations and MOI generation for registration within 24 hours.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

            {/* Pay-as-you-go */}
            <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
              <h3 className="font-bold text-xl mb-2">Pay-as-you-go</h3>
              <ul className="text-sm text-gray-600 mb-6">
                <li>• Beneficial Ownership Filing: <span className="font-bold">R50</span></li>
                <li>• New Company Registration: <span className="font-bold">R125 - R425</span></li>
                <li>• Ideal for once-off needs</li>
              </ul>
              <a
                href="https://wa.me/27825551234?text=Hi%2C%20I%20need%20a%20once-off%20service"
                target="_blank"
                className="block w-full bg-gray-200 text-gray-800 py-2 rounded font-bold text-center"
              >
                Get Started
              </a>
            </div>

            {/* Starter Tier */}
            <div className="bg-white rounded-lg p-6 border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">Most Popular</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Starter</h3>
              <p className="text-3xl font-bold mb-4">R199<span className="text-sm font-normal">/month</span></p>
              <ul className="text-sm text-gray-600 mb-6">
                <li>• Auto Annual Returns</li>
                <li>• B-BBEE Certificates</li>
                <li>• Director Changes</li>
                <li>• Priority WhatsApp Support</li>
              </ul>
              <a
                href="https://wa.me/27825551234?text=I%20want%20the%20Starter%20plan"
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
                <li>• SARS eFiling Integration</li>
                <li>• Custom Compliance Alerts</li>
                <li>• Dedicated Account Manager</li>
              </ul>
              <button className="w-full bg-gray-800 text-white py-2 rounded font-bold" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Trusted by SMMEs</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-gray-600 mb-4">"CIPC Agent Army saved me from a massive headache. They sorted out my beneficial ownership filing in a day after I struggled for weeks."</p>
            <p className="font-bold">- Thabo M., Johannesburg</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-gray-600 mb-4">"The automated annual returns service is a game-changer. I don't have to worry about deadlines or penalties anymore."</p>
            <p className="font-bold">- Sarah P., Cape Town</p>
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