import { Button } from "@/components/ui/button";

export default function WhatsAppMockup() {
  return (
    <div className="whatsapp-mockup">
      {/* WhatsApp Header */}
      <div className="whatsapp-header">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-compliance-green" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zM7 8a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold">CIPC Commander</h3>
          <p className="text-sm opacity-90">Online</p>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="p-4 space-y-3 bg-gray-50 h-64 overflow-y-auto">
        <div className="flex justify-start">
          <div className="whatsapp-message whatsapp-message-received">
            <p className="text-sm">👋 Hi! I'm your CIPC AI assistant. Upload your company docs and I'll handle your annual returns in 90 seconds!</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <div className="whatsapp-message whatsapp-message-sent">
            <p className="text-sm">Need help with CoR 14.1 form</p>
          </div>
        </div>
        
        <div className="flex justify-start">
          <div className="whatsapp-message whatsapp-message-received">
            <p className="text-sm">✅ Perfect! I can auto-fill that. Send me your latest financials and director ID copies.</p>
          </div>
        </div>
        
        <div className="flex justify-start">
          <div className="whatsapp-message bg-compliance-green text-white rounded-bl-md">
            <p className="text-sm">📄 Form generated! Review and submit?</p>
            <Button className="bg-white text-compliance-green px-3 py-1 rounded mt-2 text-xs font-semibold hover:bg-gray-100">
              Review & Submit
            </Button>
          </div>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
            <span className="text-gray-500 text-sm">Type a message...</span>
          </div>
          <button className="bg-compliance-green text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
