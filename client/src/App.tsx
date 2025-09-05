import React from 'react';

export default function App() {
  const whatsappNumber = process.env.WHATSAPP_NUMBER || "+27871234567";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace('+', '')}?text=hi`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section - Mobile First */}
      <div className="px-4 py-8 sm:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            CIPC Compliance in <span className="text-green-600">90 Seconds</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
            Get your free CIPC compliance score and fix any issues instantly via WhatsApp. 
            No paperwork, no queues, no stress.
          </p>
          
          {/* Main CTA - Mobile Optimized */}
          <a 
            href={whatsappLink}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-4 bg-green-600 text-white text-base sm:text-lg font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl mb-4 max-w-sm mx-auto sm:max-w-none"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Start on WhatsApp - FREE
          </a>
          
          <p className="text-xs sm:text-sm text-gray-500 px-4">
            ✅ Free score in 30 seconds • ✅ Fix from R99 • ✅ No signup
          </p>
        </div>
      </div>

      {/* Social Proof - Mobile Optimized */}
      <div className="bg-white py-8 sm:py-12">
        <div className="px-4 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Trusted by 1,000+ South African businesses</p>
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">R50k</div>
              <div className="text-xs sm:text-sm text-gray-600">Penalty avoided</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">90 sec</div>
              <div className="text-xs sm:text-sm text-gray-600">Avg completion</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">99.8%</div>
              <div className="text-xs sm:text-sm text-gray-600">Success rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services - Mobile First Grid */}
      <div className="py-8 sm:py-16">
        <div className="px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">PAYG Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Beneficial Ownership</h3>
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">R99</div>
              <div className="text-xs sm:text-sm text-gray-500">Urgent: R149</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Annual Return</h3>
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">R199</div>
              <div className="text-xs sm:text-sm text-gray-500">Urgent: R299</div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Director Amendment</h3>
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">R149</div>
              <div className="text-xs sm:text-sm text-gray-500">Urgent: R224</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8">
        <div className="px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-300">&copy; 2024 CIPC Agent (Pty) Ltd.</p>
          <p className="text-xs text-gray-400 mt-1">CIPC Authorized Filing Agent Application Submitted</p>
        </div>
      </footer>
    </div>
  );
}