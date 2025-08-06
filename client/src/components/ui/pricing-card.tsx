import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  popular: boolean;
}

interface PricingCardProps {
  plan: Plan;
}

export default function PricingCard({ plan }: PricingCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-8 shadow-lg relative ${plan.popular ? 'border-2 border-trust-blue shadow-xl' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-trust-blue text-white hover:bg-trust-blue/80 px-4 py-2">
            Most Popular
          </Badge>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-dark-gray mb-2">{plan.name}</h3>
        <div className={`text-4xl font-bold mb-2 ${plan.popular ? 'text-trust-blue' : 'text-dark-gray'}`}>
          {plan.price}
        </div>
        <p className="text-medium-gray">{plan.period}</p>
      </div>
      
      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-compliance-green mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        variant={plan.buttonVariant}
        className={`w-full py-3 font-semibold ${
          plan.buttonVariant === "default" 
            ? "bg-trust-blue text-white hover:bg-blue-700" 
            : plan.name === "Enterprise"
              ? "border-2 border-dark-gray text-dark-gray hover:bg-dark-gray hover:text-white"
              : "border-2 border-trust-blue text-trust-blue hover:bg-trust-blue hover:text-white"
        }`}
      >
        {plan.buttonText}
      </Button>
    </div>
  );
}
