import { Badge } from "@/components/ui/badge";

interface Agent {
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  viralHook: string;
  isNew?: boolean;
}

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      search: (
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      ),
      "user-check": (
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      "file-alt": (
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      ),
      bell: (
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      ),
      "credit-card": (
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zm14 5H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
      ),
      video: (
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l5.5-6 2.5 3 4-5 4 8z" clipRule="evenodd" />
      )
    };
    return icons[iconName] || icons.search;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; viral: string }> = {
      "sa-orange": {
        bg: "bg-sa-orange",
        text: "text-sa-orange",
        viral: "bg-sa-orange/10 text-sa-orange"
      },
      "compliance-green": {
        bg: "bg-compliance-green",
        text: "text-compliance-green", 
        viral: "bg-compliance-green/10 text-compliance-green"
      },
      "trust-blue": {
        bg: "bg-trust-blue",
        text: "text-trust-blue",
        viral: "bg-trust-blue/10 text-trust-blue"
      },
      "sa-gold": {
        bg: "bg-sa-gold",
        text: "text-sa-gold",
        viral: "bg-sa-gold/10 text-sa-gold"
      },
      "green-600": {
        bg: "bg-green-600",
        text: "text-green-600",
        viral: "bg-green-600/10 text-green-600"
      },
      "black": {
        bg: "bg-black",
        text: "text-black",
        viral: "bg-black/10 text-black"
      }
    };
    return colorMap[color] || colorMap["trust-blue"];
  };

  const colors = getColorClasses(agent.color);

  return (
    <div className={`agent-card ${agent.isNew ? 'border-2 border-sa-orange' : ''}`}>
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mr-4`}>
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            {getIcon(agent.icon)}
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-dark-gray">{agent.name}</h3>
          {agent.isNew && (
            <Badge className="bg-sa-orange text-white hover:bg-sa-orange/80 text-xs">
              NEW
            </Badge>
          )}
        </div>
      </div>
      
      <p className="text-medium-gray mb-4">
        {agent.description}
      </p>
      
      <div className="space-y-2 mb-4">
        {agent.features.map((feature, index) => (
          <div key={index} className="flex items-center text-sm">
            <svg className="w-4 h-4 text-compliance-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{feature}</span>
          </div>
        ))}
      </div>
      
      <div className={`${colors.viral} rounded-lg p-3`}>
        <p className={`text-sm font-semibold ${colors.text}`}>
          {agent.viralHook}
        </p>
      </div>
    </div>
  );
}
