// server/conversational-error-logger.ts
import { EventEmitter } from 'events';
import winston from 'winston';
import * as promClient from 'prom-client';
import { OpenAI } from 'openai';

interface ConversationalError {
  conversationId: string;
  userId: string;
  channel: 'whatsapp' | 'webchat' | 'telegram' | 'sms';
  error: Error;
  context: {
    step?: string;
    userInput?: string;
    complianceType?: string;
    timestamp: Date;
    sessionData?: any;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceError extends ConversationalError {
  regulationType?: 'POPIA' | 'Companies Act' | 'CIPC Regulations' | 'ECTA';
  breachRisk?: number; // 0-1 scale
  remediationRequired: boolean;
  dataSubjectsAffected?: number;
}

export class ConversationalErrorLogger extends EventEmitter {
  private logger: winston.Logger;
  private metrics: {
    errorCount: promClient.Counter<string>;
    errorSeverity: promClient.Gauge<string>;
    complianceErrorRate: promClient.Gauge<string>;
  };
  private openai: OpenAI;

  constructor() {
    super();
    this.initializeLogger();
    this.initializeMetrics();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  private initializeLogger() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'cipc-agent-conversational' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({
          filename: 'logs/conversational-errors.log',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5
        }),
        // Compliance-specific log for POPIA auditing
        new winston.transports.File({
          filename: 'logs/compliance-audit.log',
          maxsize: 50 * 1024 * 1024, // 50MB
          maxFiles: 10,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    });
  }

  private initializeMetrics() {
    this.metrics = {
      errorCount: new promClient.Counter({
        name: 'cipc_conversational_errors_total',
        help: 'Total number of conversational errors',
        labelNames: ['channel', 'severity', 'compliance_type']
      }),
      errorSeverity: new promClient.Gauge({
        name: 'cipc_error_severity_score',
        help: 'Current error severity score',
        labelNames: ['channel']
      }),
      complianceErrorRate: new promClient.Gauge({
        name: 'cipc_compliance_error_rate',
        help: 'Rate of compliance-related errors'
      })
    };
  }

  async logConversationalError(error: ConversationalError): Promise<void> {
    try {
      // AI-powered error classification
      const enrichedError = await this.classifyErrorWithAI(error);

      // Log the error
      this.logger.error('Conversational Error', {
        conversationId: error.conversationId,
        userId: error.userId,
        channel: error.channel,
        error: error.error.message,
        stack: error.error.stack,
        context: error.context,
        severity: enrichedError.severity,
        compliance: enrichedError.compliance,
        aiInsights: enrichedError.aiInsights
      });

      // Update metrics
      this.metrics.errorCount
        .labels(error.channel, enrichedError.severity, error.context.complianceType || 'general')
        .inc();

      this.metrics.errorSeverity
        .labels(error.channel)
        .set(this.calculateSeverityScore(enrichedError.severity));

      // Handle compliance-specific errors
      if (enrichedError.compliance?.breachRisk > 0.5) {
        await this.handleComplianceError(enrichedError as ComplianceError);
      }

      // Emit event for real-time monitoring
      this.emit('error-logged', enrichedError);

      // Check for error patterns and trigger alerts
      await this.analyzeErrorPatterns(enrichedError);

    } catch (loggingError) {
      // Fallback logging if primary logging fails
      console.error('CRITICAL: Error logging failed:', loggingError);
      console.error('Original error:', error);
    }
  }

  private async classifyErrorWithAI(error: ConversationalError): Promise<any> {
    if (!process.env.OPENAI_API_KEY || process.env.NODE_ENV === 'test') {
      // Fallback classification without AI
      return this.classifyErrorLocally(error);
    }

    try {
      const prompt = `
      Analyze this conversational error from a CIPC compliance platform and classify it:

      Error: ${error.error.message}
      Channel: ${error.channel}
      Context: ${JSON.stringify(error.context)}
      User Input: ${error.context.userInput || 'N/A'}

      Classify the error and provide:
      1. Severity level (low/medium/high/critical)
      2. Potential compliance implications
      3. Whether user notification is needed
      4. Suggested remediation steps
      5. Breach risk score (0-1)

      Return as JSON.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const aiClassification = JSON.parse(response.choices[0].message.content);

      return {
        ...error,
        severity: aiClassification.severity || 'medium',
        compliance: {
          regulationType: aiClassification.compliance_implications?.regulation,
          breachRisk: aiClassification.breach_risk_score || 0,
          remediationRequired: aiClassification.needs_remediation || false
        },
        aiInsights: {
          classification: aiClassification,
          recommendedActions: aiClassification.remediation_steps,
          userNotificationNeeded: aiClassification.user_notification_needed
        }
      };
    } catch (aiError) {
      console.warn('AI classification failed, using fallback:', aiError);
      return this.classifyErrorLocally(error);
    }
  }

  private classifyErrorLocally(error: ConversationalError): any {
    let severity: ConversationalError['severity'] = 'medium';
    let breachRisk = 0;
    let regulationType: string | undefined;

    // Rule-based error classification
    const errorMessage = error.error.message.toLowerCase();

    // Critical errors - immediate business impact
    if (errorMessage.includes('payment') && errorMessage.includes('failed')) {
      severity = 'high';
    }

    // Compliance-related errors
    if (errorMessage.includes('cipc') || errorMessage.includes('companies act')) {
      breachRisk = 0.7;
      regulationType = 'Companies Act';
      severity = 'high';
    }

    if (errorMessage.includes('popia') || errorMessage.includes('data protection')) {
      breachRisk = 0.9;
      regulationType = 'POPIA';
      severity = 'critical';
    }

    // Channel-specific errors
    if (error.channel === 'whatsapp' && errorMessage.includes('api limit')) {
      severity = 'high';
    }

    return {
      ...error,
      severity,
      compliance: {
        regulationType,
        breachRisk,
        remediationRequired: severity === 'critical' || breachRisk > 0.7
      },
      aiInsights: null // No AI insights for local classification
    };
  }

  private async handleComplianceError(error: ComplianceError): Promise<void> {
    // Create compliance audit entry for POPIA requirements
    const auditEntry = {
      errorId: `compliance-error-${Date.now()}`,
      timestamp: new Date().toISOString(),
      conversationId: error.conversationId,
      userId: error.userId,
      regulationType: error.regulationType,
      breachRisk: error.breachRisk,
      dataSubjectsAffected: error.dataSubjectsAffected || 1,
      description: error.error.message,
      remediationStatus: 'pending',
      reportingDeadline: this.calculateReportingDeadline(error.context.timestamp)
    };

    // Log to compliance audit trail
    this.logger.info('Compliance Error Audit', auditEntry);

    // Update compliance error rate metric
    this.metrics.complianceErrorRate.set(error.breachRisk || 0);

    // Trigger compliance workflow if breach risk is high
    if (error.breachRisk > 0.8) {
      await this.triggerComplianceWorkflow(auditEntry);
    }
  }

  private async analyzeErrorPatterns(error: any): Promise<void> {
    // Check for error patterns that require immediate attention
    const recentErrors = await this.getRecentErrors(10); // Last 10 errors

    const channelErrors = recentErrors.filter(e => e.channel === error.channel);
    const similarErrors = recentErrors.filter(e =>
      e.error.message.includes(error.error.message.split(' ')[0])
    );

    // Alert patterns
    if (channelErrors.length >= 5) {
      this.emit('channel-error-spike', {
        channel: error.channel,
        errorCount: channelErrors.length,
        timeWindow: '10 errors'
      });
    }

    if (similarErrors.length >= 3) {
      this.emit('recurring-error-pattern', {
        pattern: error.error.message.split(' ')[0],
        occurrences: similarErrors.length
      });
    }
  }

  private calculateSeverityScore(severity: string): number {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 };
    return scores[severity as keyof typeof scores] || 2;
  }

  private calculateReportingDeadline(incidentTime: Date): Date {
    // POPIA requires reporting within 72 hours
    const deadline = new Date(incidentTime);
    deadline.setHours(deadline.getHours() + 72);
    return deadline;
  }

  private async triggerComplianceWorkflow(auditEntry: any): Promise<void> {
    // Trigger compliance escalation workflow
    // This would integrate with your existing Temporal workflows
    console.log('Triggering compliance workflow for high-risk error:', auditEntry.errorId);
  }

  private async getRecentErrors(count: number): Promise<any[]> {
    // In a real implementation, this would query a database or cache
    // For now, return an empty array as this is a simplified implementation
    return [];
  }

  // Public methods for external access
  async getErrorMetrics(): Promise<string> {
    return await promClient.register.metrics();
  }

  getLogger(): winston.Logger {
    return this.logger;
  }

  // Graceful shutdown
  async close(): Promise<void> {
    await new Promise((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }
}

// Export singleton instance
export const conversationalErrorLogger = new ConversationalErrorLogger();

// Global error handler enhancement
process.on('unhandledRejection', (reason, promise) => {
  conversationalErrorLogger.logConversationalError({
    conversationId: 'system-error',
    userId: 'system',
    channel: 'webchat',
    error: new Error(`Unhandled Rejection: ${reason}`),
    context: {
      timestamp: new Date(),
      promise: promise.toString()
    },
    severity: 'high'
  });
});

process.on('uncaughtException', (error) => {
  conversationalErrorLogger.logConversationalError({
    conversationId: 'system-error',
    userId: 'system',
    channel: 'webchat',
    error,
    context: {
      timestamp: new Date(),
      userInput: 'system_error'
    },
    severity: 'critical'
  });
});
