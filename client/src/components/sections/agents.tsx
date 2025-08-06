import AgentCard from "@/components/ui/agent-card";

export default function Agents() {
  const agents = [
    {
      name: "Lead Scout",
      description: "Finds SMMEs needing CIPC services and generates free compliance score reports.",
      icon: "search",
      color: "sa-orange",
      features: ["LinkedIn SMME discovery", "Free compliance scoring", "Automated outreach"],
      viralHook: "🎯 Free \"CIPC Health Check\" Report"
    },
    {
      name: "KYC Onboarder", 
      description: "Extracts company and director data with OCR and POPIA-compliant processing.",
      icon: "user-check",
      color: "compliance-green",
      features: ["WhatsApp ID scanning", "Auto-fill capabilities", "POPIA redaction"],
      viralHook: "📱 Scan ID → Instant Form Fill"
    },
    {
      name: "Form Autopilot",
      description: "Generates CIPC documents including CoR 14.1, annual returns, and B-BBEE certificates.",
      icon: "file-alt",
      color: "trust-blue", 
      features: ["CoR 14.1 generation", "Annual returns", "B-BBEE certificates"],
      viralHook: "⚡ Upload Financials → Compliant in 90s"
    },
    {
      name: "Regulation Sentinel",
      description: "Monitors CIPC regulatory changes and sends proactive deadline alerts.",
      icon: "bell",
      color: "sa-gold",
      features: ["Real-time monitoring", "SMS & WhatsApp alerts", "Deadline tracking"],
      viralHook: "📢 Never Miss a Deadline Again"
    },
    {
      name: "Payment Runner",
      description: "Handles CIPC submissions and payment processing with secure PayFast integration.",
      icon: "credit-card",
      color: "green-600",
      features: ["Secure payments", "Auto-submission", "Status tracking"],
      viralHook: "💳 One-Click Filing + Payment"
    },
    {
      name: "TikTok Growth Bot",
      description: "Creates viral CIPC compliance tips and automatically posts to TikTok for growth.",
      icon: "video",
      color: "black",
      features: ["Auto-generated tips", "Viral content creation", "Growth analytics"],
      viralHook: "🎬 15s CIPC Tips That Go Viral",
      isNew: true
    }
  ];

  return (
    <section id="agents" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">
            Meet Your AI Agent Army
          </h2>
          <p className="text-xl text-medium-gray max-w-3xl mx-auto">
            Each specialized agent handles a specific part of your CIPC compliance workflow, working together under the CIPC Commander's orchestration.
          </p>
        </div>

        {/* CIPC Commander - Master Orchestrator */}
        <div className="bg-gradient-to-r from-trust-blue to-blue-700 rounded-2xl p-8 mb-12 text-white">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-6">
              <svg className="w-8 h-8 text-trust-blue" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM17 4a1 1 0 10-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">CIPC Commander</h3>
              <p className="text-blue-100">Master Orchestrator - Your Workflow Quarterback</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🎯 Intelligent Routing</h4>
              <p className="text-sm text-blue-100">Routes tasks to the right agent based on your needs</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">🔗 Agent Coordination</h4>
              <p className="text-sm text-blue-100">Manages communication between all specialized agents</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">📊 Progress Tracking</h4>
              <p className="text-sm text-blue-100">Monitors and reports on all compliance activities</p>
            </div>
          </div>
        </div>

        {/* Specialized Sub-Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <AgentCard key={index} agent={agent} />
          ))}
        </div>
      </div>
    </section>
  );
}
