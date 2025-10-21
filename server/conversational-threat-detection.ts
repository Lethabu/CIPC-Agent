// server/conversational-threat-detection.ts
import { OpenAI } from 'openai';
import { createHash } from 'crypto';

interface ConversationMessage {
  sender: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ThreatAnalysis {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  threats: Threat[];
  recommendations: string[];
  requiresAction: boolean;
}

interface Threat {
  type: string;
  description: string;
  severity: number; // 0-1
  evidence: string[];
  remediation: string[];
}

export class ConversationalThreatDetector {
  private openai: OpenAI;
  private threatPatterns = {
    injection: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b.*\b(FROM|INTO)\b)/i,
      /(\bUNION\b.*\bSELECT\b)/i,
      /('|(\\x27)|(\\x2D\\x2D)|(\\")|(\\x3B)|(\\x2F\\x2A)|(\\x2A\\x2F))/i
    ],
    xss: [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:[^"']*["']/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
      /javascript:.*?["']/gi
    ],
    dataExfiltration: [
      /\b(api[_-]?key|secret|token|password|credential)\b/i,
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card pattern
      /\b\d{13}\b/, // South African ID pattern
    ],
    socialEngineering: [
      /\b(admin|root|superuser|god[_-]?mode)\b/i,
      /\b(bypass|override|ignore|disable)\b.*\b(security|auth|verification)\b/i,
      /\b(urgent|emergency|critical|immediate)\b.*\b(action|payment|transfer)\b/i
    ]
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeConversationForThreats(
    conversation: ConversationMessage[]
  ): Promise<ThreatAnalysis> {
    const threats: Threat[] = [];

    // Pattern-based detection
    const patternThreats = await this.detectPatternBasedThreats(conversation);
    threats.push(...patternThreats);

    // AI-powered analysis
    const aiAnalysis = await this.performAIAnalysis(conversation);
    threats.push(...aiAnalysis.threats);

    // Behavioral analysis
    const behavioralThreats = await this.analyzeBehavioralPatterns(conversation);
    threats.push(...behavioralThreats);

    // Aggregate threat level
    const overallThreatLevel = this.calculateOverallThreatLevel(threats);
    const confidence = this.calculateConfidence(threats);

    return {
      threatLevel: overallThreatLevel,
      confidence,
      threats,
      recommendations: this.generateRecommendations(threats, overallThreatLevel),
      requiresAction: overallThreatLevel === 'high' || overallThreatLevel === 'critical'
    };
  }

  private async detectPatternBasedThreats(conversation: ConversationMessage[]): Promise<Threat[]> {
    const threats: Threat[] = [];
    const userMessages = conversation.filter(msg => msg.sender === 'user');

    for (const message of userMessages) {
      // Check each threat category
      for (const [category, patterns] of Object.entries(this.threatPatterns)) {
        for (const pattern of patterns) {
          if (pattern.test(message.content)) {
            const threat: Threat = {
              type: category,
              description: `${category.charAt(0).toUpperCase() + category.slice(1)} attack pattern detected`,
              severity: this.getPatternSeverity(category),
              evidence: [`Pattern match in user input: ${pattern.source}`],
              remediation: this.getPatternRemediation(category)
            };

            // Avoid duplicate threats
            if (!threats.some(t => t.type === threat.type && t.description === threat.description)) {
              threats.push(threat);
            }
          }
        }
      }
    }

    return threats;
  }

  private async performAIAnalysis(conversation: ConversationMessage[]): Promise<{ threats: Threat[] }> {
    if (!process.env.OPENAI_API_KEY || process.env.NODE_ENV === 'test') {
      return { threats: [] };
    }

    try {
      const conversationText = conversation
        .filter(msg => msg.sender === 'user') // Only analyze user inputs
        .map(msg => msg.content)
        .join('\n');

      const prompt = `
      Analyze this user input from a South African CIPC compliance conversation for potential security threats:

      User Input: "${conversationText.slice(0, 2000)}"  // Limit for token efficiency

      Focus on:
      1. Social engineering attempts (urgency, authority manipulation, etc.)
      2. Data exfiltration efforts
      3. Business logic manipulation
      4. Regulatory compliance violations
      5. Unusual or suspicious behavior patterns

      Context: This is for a conversational AI compliance platform in South Africa handling CIPC registrations, annual returns, and beneficial ownership.

      Respond with JSON containing:
      - threats: Array of {type, description, severity (0-1), evidence, remediation}
      - confidence: Overall confidence in analysis (0-1)
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1 // More deterministic for security analysis
      });

      const aiResult = JSON.parse(response.choices[0].message.content);

      return {
        threats: aiResult.threats || []
      };
    } catch (error) {
      console.warn('AI threat analysis failed:', error);
      return { threats: [] };
    }
  }

  private async analyzeBehavioralPatterns(conversation: ConversationMessage[]): Promise<Threat[]> {
    const threats: Threat[] = [];

    // Analyze message frequency and patterns
    const userMessages = conversation.filter(msg => msg.sender === 'user');

    if (userMessages.length > 10) {
      const timeSpans = userMessages.map((msg, index) => {
        if (index === 0) return 0;
        return msg.timestamp.getTime() - userMessages[index - 1].timestamp.getTime();
      });

      const avgTimeBetweenMessages = timeSpans.reduce((a, b) => a + b, 0) / timeSpans.length;

      // Very rapid messaging might indicate automation or attack
      if (avgTimeBetweenMessages < 1000) { // Less than 1 second between messages
        threats.push({
          type: 'behavioral',
          description: 'Automated messaging patterns detected',
          severity: 0.6,
          evidence: [`Average time between messages: ${avgTimeBetweenMessages}ms`],
          remediation: [
            'Implement rate limiting',
            'Require human verification',
            'Monitor for bot-like behavior'
          ]
        });
      }
    }

    // Check for repeated failed attempts
    const failedInteractions = conversation.filter(msg =>
      msg.content.toLowerCase().includes('error') ||
      msg.content.toLowerCase().includes('failed') ||
      msg.content.toLowerCase().includes('invalid')
    );

    if (failedInteractions.length > 3) {
      threats.push({
        type: 'behavioral',
        description: 'Multiple failed interactions detected',
        severity: 0.4,
        evidence: [`${failedInteractions.length} failed interactions in conversation`],
        remediation: [
          'Offer human assistance',
          'Implement progressive delays',
          'Collect user feedback on issues'
        ]
      });
    }

    return threats;
  }

  private async detectInjectionAttacks(message: string): Promise<boolean> {
    // Multi-layer injection detection
    const injectionIndicators = [
      ...this.threatPatterns.injection,
      ...this.threatPatterns.xss
    ];

    // Pattern matching
    for (const pattern of injectionIndicators) {
      if (pattern.test(message)) {
        return true;
      }
    }

    // AI-powered injection detection
    if (process.env.OPENAI_API_KEY && process.env.NODE_ENV !== 'test') {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Analyze this text for code injection attempts: "${message}". Return only "THREAT" or "SAFE".`
          }],
          temperature: 0
        });

        const result = response.choices[0].message.content?.trim();
        if (result === 'THREAT') {
          return true;
        }
      } catch (error) {
        console.warn('AI injection detection failed:', error);
      }
    }

    // Contextual analysis for CIPC-specific injection attempts
    const cipcKeywords = ['cipc', 'registration', 'annual return', 'beneficial ownership'];
    const hasCipcContext = cipcKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );

    // If it has CIPC context, be more suspicious of certain patterns
    if (hasCipcContext) {
      const suspiciousCipcPatterns = [
        /script/i,
        /javascript/i,
        /eval\(/i,
        /exec\(/i
      ];

      if (suspiciousCipcPatterns.some(pattern => pattern.test(message))) {
        return true;
      }
    }

    return false;
  }

  async rateLimitConversationalRequests(
    userId: string,
    conversationId: string,
    channel: string
  ): Promise<{ allowed: boolean; waitTime?: number; reason?: string }> {
    // Channel-specific rate limiting
    const channelLimits = {
      whatsapp: { requests: 10, window: 60 }, // 10 messages per minute
      webchat: { requests: 20, window: 60 },
      telegram: { requests: 15, window: 60 },
      sms: { requests: 5, window: 300 } // 5 SMS per 5 minutes
    };

    const limit = channelLimits[channel as keyof typeof channelLimits] || channelLimits.webchat;

    // Simple in-memory rate limiting (in production, use Redis)
    const key = `${userId}:${channel}`;
    const now = Date.now();

    // This is a simplified implementation - in production you'd use Redis or similar
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }

    const userRequests = global.rateLimitStore.get(key) || [];
    const windowStart = now - (limit.window * 1000);

    // Clean old requests
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= limit.requests) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = Math.ceil((limit.window * 1000 - (now - oldestRequest)) / 1000);

      return {
        allowed: false,
        waitTime,
        reason: `Rate limit exceeded for ${channel} channel. Wait ${waitTime} seconds.`
      };
    }

    // Add current request
    recentRequests.push(now);
    global.rateLimitStore.set(key, recentRequests);

    return { allowed: true };
  }

  private getPatternSeverity(category: string): number {
    const severities = {
      injection: 0.9,
      xss: 0.8,
      dataExfiltration: 0.9,
      socialEngineering: 0.7
    };

    return severities[category as keyof typeof severities] || 0.5;
  }

  private getPatternRemediation(category: string): string[] {
    const remediations = {
      injection: [
        'Sanitize user input',
        'Use parameterized queries',
        'Implement input validation',
        'Block suspicious patterns'
      ],
      xss: [
        'Implement Content Security Policy',
        'Encode user output',
        'Validate input on frontend and backend',
        'Use CSP nonces for inline scripts'
      ],
      dataExfiltration: [
        'Encrypt sensitive data in transit and at rest',
        'Implement data loss prevention',
        'Regular security audits',
        'Employee training on data handling'
      ],
      socialEngineering: [
        'Implement multi-factor authentication',
        'Employee security awareness training',
        'Automated approval workflows',
        'Regular security audits'
      ]
    };

    return remediations[category as keyof typeof remediations] || ['Implement additional security measures'];
  }

  private calculateOverallThreatLevel(threats: Threat[]): 'low' | 'medium' | 'high' | 'critical' {
    if (threats.length === 0) return 'low';

    const avgSeverity = threats.reduce((sum, threat) => sum + threat.severity, 0) / threats.length;
    const maxSeverity = Math.max(...threats.map(t => t.severity));

    // Weight both average and maximum threat
    const weightedSeverity = (avgSeverity * 0.7) + (maxSeverity * 0.3);

    if (weightedSeverity >= 0.8) return 'critical';
    if (weightedSeverity >= 0.6) return 'high';
    if (weightedSeverity >= 0.4) return 'medium';
    return 'low';
  }

  private calculateConfidence(threats: Threat[]): number {
    if (threats.length === 0) return 0;

    // Confidence increases with more threats and higher severity threats
    const threatCount = threats.length;
    const avgSeverity = threats.reduce((sum, threat) => sum + threat.severity, 0) / threats.length;

    // Base confidence on number of indicators
    let confidence = Math.min(threatCount * 0.1, 0.3); // Up to 30% from count

    // Add confidence from severity
    confidence += avgSeverity * 0.4; // Up to 40% from severity

    // Add confidence from evidence quality
    const evidenceScore = Math.min(threats.reduce((sum, threat) =>
      sum + threat.evidence.length * 0.1, 0) / threats.length, 0.3);

    confidence += evidenceScore;

    return Math.min(confidence, 1.0);
  }

  private generateRecommendations(threats: Threat[], threatLevel: string): string[] {
    const recommendations = new Set<string>();

    // Base recommendations
    recommendations.add('Implement input validation and sanitization');
    recommendations.add('Regular security audits and penetration testing');
    recommendations.add('Employee security awareness training');

    // Threat-specific recommendations
    for (const threat of threats) {
      threat.remediation.forEach(remediation => recommendations.add(remediation));
    }

    // Threat level specific
    switch (threatLevel) {
      case 'critical':
        recommendations.add('Immediate security incident response');
        recommendations.add('Isolate affected systems');
        recommendations.add('Notify relevant authorities if data breach suspected');
        break;
      case 'high':
        recommendations.add('Enhanced monitoring and alerting');
        recommendations.add('Implement stricter access controls');
        break;
      case 'medium':
        recommendations.add('Review and strengthen security policies');
        recommendations.add('Implement additional training');
        break;
    }

    // South African specific recommendations
    recommendations.add('Ensure POPIA compliance in incident response');
    recommendations.add('Consider notification to Information Regulator if personal data affected');

    return Array.from(recommendations);
  }

  // Generate hash for conversation monitoring
  generateConversationHash(conversation: ConversationMessage[]): string {
    const conversationString = conversation
      .map(msg => `${msg.sender}:${msg.content}`)
      .join('|');

    return createHash('sha256')
      .update(conversationString)
      .digest('hex');
  }

  // Anomaly detection for conversation patterns
  async detectConversationAnomalies(
    conversation: ConversationMessage[],
    _historicalPatterns?: any[]
  ): Promise<Threat[]> {
    const threats: Threat[] = [];

    // Check for unusual message length patterns
    const messageLengths = conversation
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.content.length);

    const avgLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;
    const unusualMessages = messageLengths.filter(length =>
      Math.abs(length - avgLength) > avgLength * 2
    );

    if (unusualMessages.length > 0) {
      threats.push({
        type: 'anomaly',
        description: 'Unusual message length patterns detected',
        severity: 0.3,
        evidence: [`${unusualMessages.length} messages with unusual lengths`],
        remediation: [
          'Monitor for potential data smuggling attempts',
          'Implement message length limits',
          'Analyze conversation context for legitimacy'
        ]
      });
    }

    return threats;
  }
}

// Export singleton
export const conversationalThreatDetector = new ConversationalThreatDetector();
