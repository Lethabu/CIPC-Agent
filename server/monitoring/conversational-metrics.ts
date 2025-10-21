// server/monitoring/conversational-metrics.ts
import { collectDefaultMetrics, Registry, Gauge, Counter, Histogram } from 'prom-client';
import { EventEmitter } from 'events';

interface ConversationalMetrics {
  conversationStartTime: number;
  conversationId: string;
  userId: string;
  channel: 'whatsapp' | 'webchat' | 'telegram' | 'sms' | 'email';
  complianceType?: string;
  userJourney?: string[];
  result?: 'completed' | 'abandoned' | 'error';
  durationSeconds?: number;
  interactionsCount?: number;
  complianceViolations?: number;
  aiConfidence?: number;
}

export class ConversationalMetricsCollector extends EventEmitter {
  private registry: Registry;

  // Core conversational metrics
  private conversationDuration!: Histogram<string>;
  private conversationCompletions!: Counter<string>;
  private conversationStarts!: Counter<string>;
  private activeConversations!: Gauge<string>;

  // Channel performance metrics
  private channelResponseTime!: Histogram<string>;
  private channelErrorRate!: Counter<string>;
  private channelThroughput!: Counter<string>;

  // CIPC compliance specific metrics
  private complianceValidationSuccess!: Counter<string>;
  private complianceViolationCount!: Counter<string>;
  private popiaComplianceScore!: Gauge<string>;
  private cipcFilingSuccessRate!: Counter<string>;

  // AI and UX metrics
  private aiResponseConfidence!: Histogram<string>;
  private userSatisfactionScore!: Histogram<string>;
  private conversationAbandonmentRate!: Gauge<string>;

  // Error and threat metrics
  private securityThreatDetected!: Counter<string>;
  private errorClassification!: Counter<string>;

  constructor() {
    super();
    this.registry = new Registry();

    // Enable default Node.js metrics collection
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'cipc_node_'
    });

    this.initializeMetrics();
    this.setupPeriodicUpdates();
  }

  private initializeMetrics() {
    // Conversation flow metrics
    this.conversationDuration = new Histogram({
      name: 'cipc_conversation_duration_seconds',
      help: 'Duration of compliance conversations in seconds',
      labelNames: ['channel', 'result', 'compliance_type'],
      buckets: [30, 60, 120, 300, 600, 1800, 3600] // 30s to 1hr
    });

    this.conversationCompletions = new Counter({
      name: 'cipc_conversation_completions_total',
      help: 'Total number of completed conversations',
      labelNames: ['channel', 'compliance_type', 'outcome']
    });

    this.conversationStarts = new Counter({
      name: 'cipc_conversation_starts_total',
      help: 'Total number of conversation starts',
      labelNames: ['channel', 'referrer']
    });

    this.activeConversations = new Gauge({
      name: 'cipc_active_conversations_current',
      help: 'Number of currently active conversations',
      labelNames: ['channel']
    });

    // Channel performance metrics
    this.channelResponseTime = new Histogram({
      name: 'cipc_channel_response_time_seconds',
      help: 'Response time by communication channel',
      labelNames: ['channel', 'operation'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
    });

    this.channelErrorRate = new Counter({
      name: 'cipc_channel_errors_total',
      help: 'Total errors by channel',
      labelNames: ['channel', 'error_type']
    });

    this.channelThroughput = new Counter({
      name: 'cipc_channel_messages_processed_total',
      help: 'Total messages processed by channel',
      labelNames: ['channel', 'message_type']
    });

    // Compliance metrics
    this.complianceValidationSuccess = new Counter({
      name: 'cipc_compliance_validation_success_total',
      help: 'Successful compliance validations',
      labelNames: ['regulation', 'validation_type']
    });

    this.complianceViolationCount = new Counter({
      name: 'cipc_compliance_violations_total',
      help: 'Total compliance violations detected',
      labelNames: ['regulation', 'severity', 'auto_remediated']
    });

    this.popiaComplianceScore = new Gauge({
      name: 'cipc_popia_compliance_score',
      help: 'Current POPIA compliance score (0-100)',
      labelNames: ['category']
    });

    this.cipcFilingSuccessRate = new Counter({
      name: 'cipc_filing_attempts_total',
      help: 'CIPC filing attempts and outcomes',
      labelNames: ['filing_type', 'outcome', 'channel']
    });

    // AI and UX metrics
    this.aiResponseConfidence = new Histogram({
      name: 'cipc_ai_response_confidence',
      help: 'AI response confidence scores',
      labelNames: ['operation', 'model'],
      buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    });

    this.userSatisfactionScore = new Histogram({
      name: 'cipc_user_satisfaction_score',
      help: 'User satisfaction scores from post-conversation surveys',
      labelNames: ['channel', 'time_of_day'],
      buckets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });

    this.conversationAbandonmentRate = new Gauge({
      name: 'cipc_conversation_abandonment_rate',
      help: 'Current conversation abandonment rate',
      labelNames: ['channel', 'stage']
    });

    // Security metrics
    this.securityThreatDetected = new Counter({
      name: 'cipc_security_threats_detected_total',
      help: 'Security threats detected',
      labelNames: ['threat_type', 'severity', 'auto_mitigated']
    });

    this.errorClassification = new Counter({
      name: 'cipc_error_classifications_total',
      help: 'Errors classified by type',
      labelNames: ['classification', 'severity', 'resolution_status']
    });

    // Register all metrics
    this.registry.registerMetric(this.conversationDuration);
    this.registry.registerMetric(this.conversationCompletions);
    this.registry.registerMetric(this.conversationStarts);
    this.registry.registerMetric(this.activeConversations);
    this.registry.registerMetric(this.channelResponseTime);
    this.registry.registerMetric(this.channelErrorRate);
    this.registry.registerMetric(this.channelThroughput);
    this.registry.registerMetric(this.complianceValidationSuccess);
    this.registry.registerMetric(this.complianceViolationCount);
    this.registry.registerMetric(this.popiaComplianceScore);
    this.registry.registerMetric(this.cipcFilingSuccessRate);
    this.registry.registerMetric(this.aiResponseConfidence);
    this.registry.registerMetric(this.userSatisfactionScore);
    this.registry.registerMetric(this.conversationAbandonmentRate);
    this.registry.registerMetric(this.securityThreatDetected);
    this.registry.registerMetric(this.errorClassification);
  }

  private setupPeriodicUpdates() {
    // Update active conversations every 30 seconds
    setInterval(() => {
      this.updateActiveConversations();
    }, 30000);

    // Update abandonment rates every minute
    setInterval(() => {
      this.updateAbandonmentRates();
    }, 60000);

    // Update compliance scores every 5 minutes
    setInterval(() => {
      this.updateComplianceScores();
    }, 300000);
  }

  // Public methods for recording metrics

  recordConversationStart(metrics: Pick<ConversationalMetrics, 'conversationId' | 'userId' | 'channel'>) {
    this.conversationStarts.labels(metrics.channel, 'direct').inc();
    this.activeConversations.labels(metrics.channel).inc();

    this.emit('conversation-started', {
      ...metrics,
      timestamp: new Date()
    });
  }

  recordConversationComplete(metrics: ConversationalMetrics) {
    const duration = metrics.durationSeconds || 0;

    // Record duration and completion
    this.conversationDuration
      .labels(metrics.channel, metrics.result || 'unknown', metrics.complianceType || 'general')
      .observe(duration);

    this.conversationCompletions
      .labels(metrics.channel, metrics.complianceType || 'general', metrics.result || 'unknown')
      .inc();

    this.activeConversations.labels(metrics.channel).dec();

    // Record additional metrics
    if (metrics.interactionsCount) {
      this.channelThroughput
        .labels(metrics.channel, 'interaction')
        .inc(metrics.interactionsCount);
    }

    if (metrics.aiConfidence) {
      this.aiResponseConfidence
        .labels('conversation', 'gpt-4')
        .observe(metrics.aiConfidence);
    }

    // Compliance-specific metrics
    if (metrics.complianceViolations && metrics.complianceViolations > 0) {
      this.complianceViolationCount
        .labels('POPIA', 'medium', 'false')
        .inc(metrics.complianceViolations);
    }

    this.emit('conversation-completed', {
      ...metrics,
      timestamp: new Date()
    });
  }

  recordChannelMetrics(channel: string, operation: string, responseTimeMs: number, success: boolean) {
    this.channelResponseTime
      .labels(channel, operation)
      .observe(responseTimeMs / 1000); // Convert to seconds

    this.channelThroughput.labels(channel, operation).inc();

    if (!success) {
      this.channelErrorRate.labels(channel, operation).inc();
    }
  }

  recordComplianceMetrics(
    regulation: string,
    validationType: string,
    success: boolean,
    violations?: number
  ) {
    if (success) {
      this.complianceValidationSuccess.labels(regulation, validationType).inc();
    }

    if (violations && violations > 0) {
      this.complianceViolationCount
        .labels(regulation, this.getSeverityFromViolations(violations), 'false')
        .inc(violations);
    }
  }

  recordSecurityMetrics(threatType: string, severity: string, autoMitigated: boolean) {
    this.securityThreatDetected
      .labels(threatType, severity, autoMitigated.toString())
      .inc();
  }

  recordErrorMetrics(classification: string, severity: string, resolved: boolean) {
    this.errorClassification
      .labels(classification, severity, resolved ? 'resolved' : 'unresolved')
      .inc();
  }

  recordFilingAttempt(filingType: string, success: boolean, channel: string) {
    this.cipcFilingSuccessRate
      .labels(filingType, success ? 'success' : 'failure', channel)
      .inc();
  }

  recordUserSatisfaction(channel: string, score: number, timeOfDay: string) {
    this.userSatisfactionScore.labels(channel, timeOfDay).observe(score);
  }

  // Helper methods
  private getSeverityFromViolations(count: number): string {
    if (count >= 5) return 'critical';
    if (count >= 3) return 'high';
    if (count >= 1) return 'medium';
    return 'low';
  }

  private async updateActiveConversations() {
    // In a real implementation, this would query the database
    // or use Redis to get current active conversation counts
    // For now, we'll just emit an event that other parts can listen to
    this.emit('active-conversations-update');
  }

  private async updateAbandonmentRates() {
    // Calculate abandonment rates based on recent conversation data
    // This would analyze conversation starts vs completions over time
    this.emit('abandonment-rate-update');
  }

  private async updateComplianceScores() {
    try {
      // Update overall compliance scores
      const scores = await this.calculateComplianceScores();

      // Update POPIA compliance score
      this.popiaComplianceScore.labels('overall').set(scores.overall);

      // Update other compliance metrics
      this.emit('compliance-scores-updated', scores);
    } catch (error) {
      console.error('Error updating compliance scores:', error);
    }
  }

  private async calculateComplianceScores(): Promise<any> {
    // In a real implementation, this would analyze:
    // - Recent compliance validation results
    // - Violation trends
    // - Audit findings
    // - Regulatory reporting status

    // For now, return placeholder scores
    return {
      overall: 87,
      popia: 92,
      cipc: 85,
      dataProtection: 88,
      lastUpdated: new Date()
    };
  }

  // Public API endpoints
  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }

  getMetricsRegistry(): Registry {
    return this.registry;
  }

  // Health check and system metrics
  async getSystemHealth(): Promise<any> {
    return {
      status: 'healthy',
      timestamp: new Date(),
      metrics: {
        activeConversations: await this.getActiveConversationCount(),
        errorRate: await this.getErrorRate(),
        complianceScore: await this.getLastComplianceScore()
      }
    };
  }

  private async getActiveConversationCount(): Promise<number> {
    // Implementation would query Redis/database
    return 0;
  }

  private async getErrorRate(): Promise<number> {
    // Calculate error rate over last hour
    return 0.02; // 2%
  }

  private async getLastComplianceScore(): Promise<number> {
    // Get cached compliance score
    return 87;
  }

  // Cleanup and graceful shutdown
  async close(): Promise<void> {
    this.emit('shutdown');
  }
}

// Export singleton instance
export const conversationalMetrics = new ConversationalMetricsCollector();

// Global error handling integration
process.on('unhandledRejection', () => {
  conversationalMetrics.recordErrorMetrics('unhandled_promise', 'high', false);
});

process.on('uncaughtException', () => {
  conversationalMetrics.recordErrorMetrics('uncaught_exception', 'critical', false);
});

// Request/Response timing middleware helper
export function recordApiMetrics(channel: string, operation: string) {
  return function (req: any, res: any, next: any) {
    const startTime = Date.now();

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      conversationalMetrics.recordChannelMetrics(
        channel,
        operation,
        responseTime,
        res.statusCode < 400
      );
    });

    next();
  };
}
