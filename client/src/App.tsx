import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 CIPC Agent</h1>
          <p className="text-gray-600">AI-Powered CIPC Compliance</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="font-semibold text-green-800 mb-2">📱 WhatsApp Bot</h2>
            <p className="text-sm text-green-700 mb-3">Get instant CIPC compliance help</p>
            <a 
              href="https://wa.me/27699171527?text=hi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start on WhatsApp
            </a>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">⚡ Quick Services</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Annual Return - R199</div>
              <div>• Beneficial Ownership - R99</div>
              <div>• Director Amendment - R149</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          Powered by AI • Available 24/7
        </div>
      </div>
    </div>
  );
}
