export default function Compliance() {
  const securityFeatures = [
    {
      title: "POPIA Compliant",
      description: "Full compliance with South Africa's Protection of Personal Information Act",
      icon: "shield",
      color: "compliance-green"
    },
    {
      title: "AWS KMS Encryption", 
      description: "Bank-grade encryption for all data in transit and at rest",
      icon: "lock",
      color: "trust-blue"
    },
    {
      title: "Data Redaction",
      description: "Automatic PII redaction modules protect sensitive information",
      icon: "eye-slash",
      color: "sa-orange"
    },
    {
      title: "CIPC Authorized",
      description: "Officially registered service provider with CIPC e-Services",
      icon: "building",
      color: "sa-gold"
    }
  ];

  const risks = [
    {
      risk: "CIPC Portal Downtime",
      severity: "High",
      severityColor: "bg-red-100 text-red-800",
      mitigation: "Fallback to email PDF submissions"
    },
    {
      risk: "Data Breaches", 
      severity: "Critical",
      severityColor: "bg-red-600 text-white",
      mitigation: "AWS KMS encryption + POPIA redaction"
    },
    {
      risk: "Low SMME Tech Adoption",
      severity: "Medium", 
      severityColor: "bg-yellow-100 text-yellow-800",
      mitigation: "WhatsApp-first UX + offline support"
    }
  ];

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      shield: (
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      ),
      lock: (
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      ),
      "eye-slash": (
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
      ),
      building: (
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
      )
    };
    return icons[iconName] || icons.shield;
  };

  return (
    <section id="compliance" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">
            Enterprise-Grade Security & Compliance
          </h2>
          <p className="text-xl text-medium-gray">
            Your data is protected with the highest security standards
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="text-center">
              <div className={`w-20 h-20 bg-${feature.color}/10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-8 h-8 text-${feature.color}`} fill="currentColor" viewBox="0 0 20 20">
                  {getIcon(feature.icon)}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-dark-gray mb-2">{feature.title}</h3>
              <p className="text-sm text-medium-gray">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Risk Mitigation Table */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-dark-gray mb-8 text-center">Risk Mitigation Strategy</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 text-medium-gray font-semibold">Risk</th>
                  <th className="text-left py-4 px-6 text-medium-gray font-semibold">Severity</th>
                  <th className="text-left py-4 px-6 text-medium-gray font-semibold">Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {risks.map((risk, index) => (
                  <tr key={index}>
                    <td className="py-4 px-6 font-semibold">{risk.risk}</td>
                    <td className="py-4 px-6">
                      <span className={`${risk.severityColor} px-3 py-1 rounded-full text-sm font-semibold`}>
                        {risk.severity}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">{risk.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
