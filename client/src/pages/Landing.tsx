import Navbar from "@/components/navigation/navbar";
import React from 'react';

export default function Landing() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-extrabold text-gray-900 mb-6">
              CIPC Compliance is Hard. We Make it Effortless.
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Tired of missed deadlines, payment errors, and unresponsive support? Our AI agents automate your Annual Returns, Beneficial Ownership, and New Company Registrations via WhatsApp.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex justify-center items-center gap-8 mb-10">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm font-medium">POPIA Compliant & Secure</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm font-medium">99.5% Filing Success Rate</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-sm font-medium">24/7 WhatsApp Support</span>
              </div>
            </div>

            {/* Primary CTAs */}
            <div className="flex justify-center gap-4">
              <a
                href="https://wa.me/27825551234?text=Hi%2C%20I%20want%20to%20automate%20my%20CIPC%20compliance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition-transform transform hover:scale-105"
              >
                Start with WhatsApp
              </a>
              <a
                href="#pricing"
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-10 rounded-lg text-lg transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">A Full Compliance Suite for Your SMME</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-8 border rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-2xl mb-3">Automated Annual Returns</h3>
              <p className="text-gray-600">Never miss a filing deadline. Our AI calculates fees, sends reminders, and submits your annual returns automatically, ensuring your business stays compliant.</p>
            </div>
            <div className="text-center p-8 border rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-2xl mb-3">Beneficial Ownership Declarations</h3>
              <p className="text-gray-600">We simplify the mandatory BO declaration process. Our system identifies owners, collects information via WhatsApp, and files with CIPC, hassle-free.</p>
            </div>
            <div className="text-center p-8 border rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-2xl mb-3">24-Hour Company Registration</h3>
              <p className="text-gray-600">Start your business faster. Our WhatsApp-guided flow handles name reservations and MOI generation, getting your company registered in record time.</p>
            </div>
            <div className="text-center p-8 border rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-2xl mb-3">Director & B-BBEE Changes</h3>
              <p className="text-gray-600">Easily update company director details or get your B-BBEE certificate. We handle the paperwork so you can focus on your business.</p>
            </div>
            <div className="text-center p-8 border rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-2xl mb-3">SARS eFiling Integration</h3>
              <p className="text-gray-600">Coming soon: A seamless connection to SARS eFiling to manage your tax obligations directly from our platform.</p>
            </div>
             <div className="text-center p-8 border rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-2xl mb-3">Payment Reconciliation</h3>
              <p className="text-gray-600">Our Payment Sentinel agent monitors transactions, matches them with CIPC invoices, and auto-reconciles discrepancies to prevent errors.</p>
            </div>
          </div>
        </section>
        
        {/* AI Agents Section */}
        <section id="agents" className="bg-gray-50 py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16">Your AI-Powered Compliance Team</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    <div className="bg-white p-6 rounded-lg border">
                        <h3 className="font-bold text-xl mb-2">Payment Sentinel</h3>
                        <p className="text-gray-600">Monitors bank transactions, matches them with CIPC invoices, and auto-reconciles discrepancies to prevent payment allocation errors.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg border">
                        <h3 className="font-bold text-xl mb-2">Support Orchestrator</h3>
                        <p className="text-gray-600">Uses sentiment analysis to prioritize high-frustration support cases, ensuring rapid resolution for the most critical issues.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg border">
                        <h3 className="font-bold text-xl mb-2">Regulation Sentinel</h3>
                        <p className="text-gray-600">Provides proactive alerts for upcoming deadlines to help SMMEs avoid deregistration and penalties.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

              {/* Pay-as-you-go */}
              <div className="bg-white rounded-lg p-8 border-2 border-gray-200 flex flex-col">
                <h3 className="font-bold text-2xl mb-4">Pay-as-you-go</h3>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li><span className="font-bold text-green-600">✓</span> Beneficial Ownership Filing: <span className="font-bold">R50</span></li>
                  <li><span className="font-bold text-green-600">✓</span> New Company Registration: <span className="font-bold">R125 - R425</span></li>
                  <li className="text-gray-400"><span className="font-bold">✗</span> Auto Annual Returns</li>
                </ul>
                <div className="mt-auto">
                  <a
                    href="https://wa.me/27825551234?text=Hi%2C%20I%20need%20a%20once-off%20service"
                    target="_blank"
                    className="block w-full bg-gray-200 text-gray-800 py-3 rounded font-bold text-center hover:bg-gray-300 transition-colors"
                  >
                    Get Started
                  </a>
                </div>
              </div>

              {/* Starter Tier */}
              <div className="bg-white rounded-lg p-8 border-2 border-green-500 relative flex flex-col">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">Most Popular</span>
                </div>
                <h3 className="font-bold text-2xl mb-2">Starter</h3>
                <p className="text-4xl font-bold mb-4">R199<span className="text-lg font-normal">/month</span></p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li><span className="font-bold text-green-600">✓</span> Auto Annual Returns</li>
                  <li><span className="font-bold text-green-600">✓</span> B-BBEE Certificates</li>
                  <li><span className="font-bold text-green-600">✓</span> Director Changes</li>
                  <li><span className="font-bold text-green-600">✓</span> Priority WhatsApp Support</li>
                </ul>
                <div className="mt-auto">
                  <a
                    href="https://wa.me/27825551234?text=I%20want%20the%20Starter%20plan"
                    target="_blank"
                    className="block w-full bg-green-500 text-white py-3 rounded font-bold text-center hover:bg-green-600 transition-colors"
                  >
                    Choose Plan
                  </a>
                </div>
              </div>

              {/* Pro Tier */}
              <div className="bg-white rounded-lg p-8 border-2 border-gray-200 flex flex-col">
                <h3 className="font-bold text-2xl mb-2">Pro</h3>
                <p className="text-4xl font-bold mb-4">R499<span className="text-lg font-normal">/month</span></p>
                <ul className="text-gray-600 mb-6 space-y-2">
                  <li><span className="font-bold text-green-600">✓</span> Everything in Starter</li>
                  <li><span className="font-bold text-green-600">✓</span> SARS eFiling Integration</li>
                  <li><span className="font-bold text-green-600">✓</span> Custom Compliance Alerts</li>
                  <li><span className="font-bold text-green-600">✓</span> Dedicated Account Manager</li>
                </ul>
                <div className="mt-auto">
                    <button className="w-full bg-gray-800 text-white py-3 rounded font-bold cursor-not-allowed" disabled>
                        Coming Soon
                    </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section id="compliance" className="bg-gray-50 py-20">
            <div className="container mx-auto px-4 text-center max-w-4xl">
                <h2 className="text-4xl font-bold text-center mb-8">POPIA Compliant and Secure by Design</h2>
                <p className="text-lg text-gray-600 mb-6">
                    We take your data privacy seriously. Our platform is built with the Protection of Personal Information Act (POPIA) at its core. All sensitive data, such as director IDs, is automatically redacted from documents and communications to prevent misuse and ensure you meet your compliance obligations, avoiding fines of up to R10 million.
                </p>
                <a href="#" className="text-green-600 font-bold hover:underline">Learn more about our security practices</a>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">Trusted by SMMEs Across South Africa</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg border shadow-sm">
              <p className="text-gray-600 mb-6">"CIPC Agent Army saved me from a massive headache. They sorted out my beneficial ownership filing in a day after I struggled for weeks."</p>
              <p className="font-bold text-right">- Thabo M., Johannesburg</p>
            </div>
            <div className="bg-white p-8 rounded-lg border shadow-sm">
              <p className="text-gray-600 mb-6">"My deposit to CIPC was stuck for a week. The Payment Sentinel agent fixed it in 24 hours. I'm never going back to manual filings."</p>
              <p className="font-bold text-right">- Fatima A., Durban</p>
            </div>
            <div className="bg-white p-8 rounded-lg border shadow-sm">
              <p className="text-gray-600 mb-6">"The automated annual returns service is a game-changer. I don't have to worry about deadlines or penalties anymore. Worth every cent."</p>
              <p className="font-bold text-right">- Sarah P., Cape Town</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="font-bold text-lg mb-4">Services</h4>
                        <ul>
                            <li className="mb-2"><a href="#features" className="hover:underline">Annual Returns</a></li>
                            <li className="mb-2"><a href="#features" className="hover:underline">Beneficial Ownership</a></li>
                            <li className="mb-2"><a href="#features" className="hover:underline">New Company Registration</a></li>
                            <li className="mb-2"><a href="#pricing" className="hover:underline">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Company</h4>
                        <ul>
                            <li className="mb-2"><a href="#" className="hover:underline">About Us</a></li>
                            <li className="mb-2"><a href="#" className="hover:underline">Contact</a></li>
                            <li className="mb-2"><a href="#" className="hover:underline">Careers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Legal</h4>
                        <ul>
                            <li className="mb-2"><a href="#" className="hover:underline">Terms of Service</a></li>
                            <li className="mb-2"><a href="#" className="hover:underline">Privacy Policy</a></li>
                            <li className="mb-2"><a href="#compliance" className="hover:underline">POPIA Compliance</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Connect</h4>
                        <a
                            href="https://wa.me/27825551234?text=Hi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:underline"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.506"/></svg>
                            WhatsApp Us
                        </a>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 CIPC Agent Army. All Rights Reserved. Made with 🇿🇦 in South Africa.</p>
                </div>
            </div>
        </footer>
      </main>
    </>
  )
}