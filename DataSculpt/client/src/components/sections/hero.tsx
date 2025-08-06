import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WhatsAppMockup from "@/components/ui/whatsapp-mockup";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-trust-blue to-blue-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center mb-4">
              <Badge className="bg-sa-orange text-white hover:bg-sa-orange/80 mr-3">
                🇿🇦 Made for SA SMMEs
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/30">
                POPIA Compliant
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              AI Agent Army for 
              <span className="text-sa-gold"> CIPC Compliance</span>
            </h1>
            
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Automate your entire CIPC workflow with specialized AI agents. From lead generation to annual returns - all through WhatsApp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button className="bg-compliance-green hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold transition-all transform hover:scale-105">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.506"/>
                </svg>
                Start with WhatsApp
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-trust-blue px-8 py-4 text-lg font-semibold">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-blue-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-compliance-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Free compliance alerts
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-compliance-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                90s auto-filing
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-compliance-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                R199/month
              </div>
            </div>
          </div>
          
          <div className="relative">
            <WhatsAppMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
