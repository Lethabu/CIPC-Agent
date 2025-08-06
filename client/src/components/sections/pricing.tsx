import { Button } from "@/components/ui/button";
import PricingCard from "@/components/ui/pricing-card";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "R0",
      period: "Forever free compliance alerts",
      features: [
        "WhatsApp compliance alerts",
        "Deadline notifications",
        "Free compliance score", 
        "Basic document templates"
      ],
      buttonText: "Start Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Pro",
      price: "R199",
      period: "Per month, per company",
      features: [
        "Everything in Free",
        "Auto-filing in 90 seconds",
        "B-BBEE certificate generation",
        "Document OCR & auto-fill",
        "Priority WhatsApp support", 
        "Advanced analytics"
      ],
      buttonText: "Start Pro Trial",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "For larger organizations",
      features: [
        "Everything in Pro",
        "Multi-company management",
        "Custom agent training",
        "API access",
        "Dedicated support",
        "Custom integrations"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-medium-gray">
            Start free, upgrade when you need more power
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
            <svg className="w-12 h-12 text-compliance-green mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h4 className="font-bold text-dark-gray mb-2">30-Day Money-Back Guarantee</h4>
            <p className="text-sm text-medium-gray">Try risk-free. If you're not satisfied, get a full refund.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
