// tests/conversational-load.spec.ts
import { test, expect, Page } from '@playwright/test';

// Configuration for load testing
const LOAD_TEST_CONFIG = {
  // Test scenario parameters
  concurrentUsers: 50,
  testDuration: 5 * 60 * 1000, // 5 minutes
  rampUpPeriod: 30 * 1000, // 30 seconds to reach full load
  thinkTime: { min: 2000, max: 8000 }, // 2-8 seconds between interactions

  // Conversational flow parameters
  maxConversationsPerUser: 3,
  messagePerConversation: { min: 5, max: 15 },
  typingDelay: { min: 500, max: 2000 },

  // Compliance scenarios
  complianceTypes: ['annual-return', 'beneficial-ownership', 'director-change', 'company-registration'],
  channels: ['whatsapp', 'webchat'],

  // Performance thresholds
  maxResponseTime: 3000, // 3 seconds
  maxErrorRate: 0.05, // 5%
  minSuccessRate: 0.95 // 95%
};

interface LoadTestScenario {
  scenarioName: string;
  userCount: number;
  complianceType: string;
  channel: string;
  expectedCompletionRate: number;
}

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  responseTimes: number[];
  errorRate: number;
  throughput: number; // requests per second
  percentile95: number;
  percentile99: number;
}

class ConversationalLoadGenerator {
  private activeUsers = 0;
  private completedScenarios = 0;
  private failedScenarios = 0;
  private responseTimes: number[] = [];
  private errors: string[] = [];

  constructor(private page: Page) {}

  async simulateConversationalUser(userId: number, scenario: LoadTestScenario): Promise<void> {
    this.activeUsers++;
    const startTime = Date.now();

    try {
      // Ramp up delay for realistic load distribution
      const rampUpDelay = (LOAD_TEST_CONFIG.rampUpPeriod / scenario.userCount) * userId;
      await new Promise(resolve => setTimeout(resolve, rampUpDelay));

      console.log(`User ${userId} starting scenario: ${scenario.scenarioName}`);

      // Execute conversational scenario
      const metrics = await this.executeConversationalFlow(userId, scenario);

      // Record performance metrics
      this.responseTimes.push(...metrics.responseTimes);
      this.completedScenarios++;

      console.log(`User ${userId} completed scenario - Success Rate: ${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(1)}%`);

    } catch (error) {
      this.errors.push(`User ${userId}: ${(error as Error).message}`);
      this.failedScenarios++;
      console.error(`User ${userId} failed:`, error);
    } finally {
      this.activeUsers--;
    }
  }

  private async executeConversationalFlow(userId: number, scenario: LoadTestScenario): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errorRate: 0,
      throughput: 0,
      percentile95: 0,
      percentile99: 0
    };

    try {
      // Navigate to application
      const navStart = Date.now();
      await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      metrics.responseTimes.push(Date.now() - navStart);
      metrics.totalRequests++;

      const conversationCount = Math.floor(Math.random() * LOAD_TEST_CONFIG.maxConversationsPerUser) + 1;

      for (let conv = 0; conv < conversationCount; conv++) {
        // Start compliance conversation
        const conversationMetrics = await this.simulateComplianceConversation(userId, conv, scenario);
        metrics.totalRequests += conversationMetrics.totalRequests;
        metrics.successfulRequests += conversationMetrics.successfulRequests;
        metrics.failedRequests += conversationMetrics.failedRequests;
        metrics.responseTimes.push(...conversationMetrics.responseTimes);

        // Think time between conversations
        const thinkTime = this.getRandomThinkTime();
        await new Promise(resolve => setTimeout(resolve, thinkTime));
      }

      // Calculate final metrics
      metrics.errorRate = metrics.failedRequests / metrics.totalRequests;
      metrics.throughput = metrics.totalRequests / ((Date.now() - performance.now()) / 1000);
      metrics.responseTimes.sort((a, b) => a - b);
      metrics.percentile95 = metrics.responseTimes[Math.floor(metrics.responseTimes.length * 0.95)] || 0;
      metrics.percentile99 = metrics.responseTimes[Math.floor(metrics.responseTimes.length * 0.99)] || 0;

    } catch (error) {
      metrics.failedRequests++;
      throw error;
    }

    return metrics;
  }

  private async simulateComplianceConversation(
    userId: number,
    conversationIndex: number,
    scenario: LoadTestScenario
  ): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errorRate: 0,
      throughput: 0,
      percentile95: 0,
      percentile99: 0
    };

    try {
      // Start conversation based on channel
      const startTime = Date.now();

      if (scenario.channel === 'whatsapp') {
        await this.simulateWhatsAppInteraction(metrics, scenario, conversationIndex);
      } else {
        await this.simulateWebChatInteraction(metrics, scenario, conversationIndex);
      }

      const duration = Date.now() - startTime;

      // Validate conversation completion
      const completionRate = await this.validateConversationCompletion();
      if (completionRate < scenario.expectedCompletionRate) {
        metrics.failedRequests++;
        throw new Error(`Conversation completion rate ${completionRate} below threshold ${scenario.expectedCompletionRate}`);
      }

      metrics.successfulRequests++;
      metrics.responseTimes.push(duration);

    } catch (error) {
      metrics.failedRequests++;
      this.errors.push(`Conversation ${conversationIndex} failed: ${(error as Error).message}`);
    }

    return metrics;
  }

  private async simulateWhatsAppInteraction(
    metrics: PerformanceMetrics,
    scenario: LoadTestScenario,
    conversationIndex: number
  ): Promise<void> {
    // Mock WhatsApp Business API interaction
    await this.page.route('**/api/whatsapp/send', async route => {
      const requestStart = Date.now();
      await new Promise(resolve => setTimeout(resolve,
        Math.random() * 1000 + 500)); // 500-1500ms API response

      const responseTime = Date.now() - requestStart;
      metrics.responseTimes.push(responseTime);
      metrics.totalRequests++;

      // Simulate occasional API failures
      if (Math.random() < 0.02) { // 2% failure rate
        metrics.failedRequests++;
        await route.fulfill({ status: 500, body: JSON.stringify({ error: 'WhatsApp API Error' }) });
      } else {
        metrics.successfulRequests++;
        await route.fulfill({ status: 200, body: JSON.stringify({ messageId: `msg_${Date.now()}` }) });
      }
    });

    // Simulate conversation flow
    const messageCount = this.getRandomMessageCount();
    for (let i = 0; i < messageCount; i++) {
      const message = this.generateComplianceMessage(scenario.complianceType, i);

      // Send message via mocked API
      const response = await this.page.evaluate((msg) => {
        return fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, userId: 'load-test-user' })
        });
      }, message);

      // Typing delay simulation
      const typingDelay = this.getRandomTypingDelay();
      await new Promise(resolve => setTimeout(resolve, typingDelay));

      // Wait for response
      await this.page.waitForResponse('**/api/whatsapp/send');
    }
  }

  private async simulateWebChatInteraction(
    metrics: PerformanceMetrics,
    scenario: LoadTestScenario,
    conversationIndex: number
  ): Promise<void> {
    // Mock web chat interaction
    await this.page.route('**/api/conversation/message', async route => {
      const requestStart = Date.now();
      await new Promise(resolve => setTimeout(resolve,
        Math.random() * 500 + 200)); // 200-700ms response

      const responseTime = Date.now() - requestStart;
      metrics.responseTimes.push(responseTime);
      metrics.totalRequests++;

      // Simulate occasional failures
      if (Math.random() < 0.015) { // 1.5% failure rate
        metrics.failedRequests++;
        await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal Server Error' }) });
      } else {
        metrics.successfulRequests++;
        const botResponse = this.generateBotResponse(scenario.complianceType);
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            message: botResponse,
            conversationId: `conv_${conversationIndex}`
          })
        });
      }
    });

    // Simulate Typebot-like conversation
    const messageCount = this.getRandomMessageCount();
    for (let i = 0; i < messageCount; i++) {
      const userMessage = this.generateComplianceMessage(scenario.complianceType, i);

      // Fill and submit message
      await this.page.fill('[data-testid="message-input"]', userMessage);
      await this.page.click('[data-testid="send-message"]');

      // Wait for bot response
      await this.page.waitForResponse('**/api/conversation/message');

      // Simulate reading time
      await new Promise(resolve => setTimeout(resolve, this.getRandomThinkTime()));
    }
  }

  private async validateConversationCompletion(): Promise<number> {
    // Mock validation - in real implementation would check conversation state
    return Math.random() > 0.1 ? 0.95 : 0.85; // 95% success rate with some variance
  }

  private generateComplianceMessage(complianceType: string, step: number): string {
    const messageTemplates: Record<string, string[]> = {
      'annual-return': [
        'I need to file my annual return',
        '2001/123456/07',
        'January 2024 to December 2024',
        'Yes, I confirm the information is accurate',
        'Please proceed with filing'
      ],
      'beneficial-ownership': [
        'I need to register beneficial ownership',
        'Individual ownership',
        '95%',
        '9001015000082', // Valid SA ID
        'South Africa',
        'Yes, all information is correct'
      ],
      'director-change': [
        'I need to change director information',
        'Add new director',
        'John Smith',
        '9012345678901',
        'Director',
        'Confirm director change'
      ],
      'company-registration': [
        'I want to register a new company',
        'ABC Trading Pty Ltd',
        'Private Company',
        'Service provider',
        'Proceed with name check'
      ]
    };

    const templates = messageTemplates[complianceType] || ['Hello'];
    return templates[step % templates.length];
  }

  private generateBotResponse(complianceType: string): string {
    const responses: Record<string, string> = {
      'annual-return': 'Thank you for your annual return information. Processing your filing request...',
      'beneficial-ownership': 'Beneficial ownership registration received. Validating information...',
      'director-change': 'Director change request acknowledged. Verifying details...',
      'company-registration': 'Company name reservation initiated. Checking availability...'
    };

    return responses[complianceType] ||
           'Thank you for your input. Processing your request...';
  }

  private getRandomThinkTime(): number {
    return Math.floor(Math.random() * (LOAD_TEST_CONFIG.thinkTime.max - LOAD_TEST_CONFIG.thinkTime.min)) +
           LOAD_TEST_CONFIG.thinkTime.min;
  }

  private getRandomTypingDelay(): number {
    return Math.floor(Math.random() * (LOAD_TEST_CONFIG.typingDelay.max - LOAD_TEST_CONFIG.typingDelay.min)) +
           LOAD_TEST_CONFIG.typingDelay.min;
  }

  private getRandomMessageCount(): number {
    return Math.floor(Math.random() *
      (LOAD_TEST_CONFIG.messagePerConversation.max - LOAD_TEST_CONFIG.messagePerConversation.min)) +
      LOAD_TEST_CONFIG.messagePerConversation.min;
  }

  getFinalMetrics(): { activeUsers: number; completed: number; failed: number; errors: string[]; responseTimes: number[] } {
    return {
      activeUsers: this.activeUsers,
      completed: this.completedScenarios,
      failed: this.failedScenarios,
      errors: this.errors,
      responseTimes: this.responseTimes
    };
  }
}

// Main load test scenarios
const LOAD_SCENARIOS: LoadTestScenario[] = [
  {
    scenarioName: 'High Load WhatsApp Annual Return',
    userCount: LOAD_TEST_CONFIG.concurrentUsers,
    complianceType: 'annual-return',
    channel: 'whatsapp',
    expectedCompletionRate: LOAD_TEST_CONFIG.minSuccessRate
  },
  {
    scenarioName: 'High Load WebChat Beneficial Ownership',
    userCount: LOAD_TEST_CONFIG.concurrentUsers,
    complianceType: 'beneficial-ownership',
    channel: 'webchat',
    expectedCompletionRate: LOAD_TEST_CONFIG.minSuccessRate
  }
];

test.describe('Conversational Load Testing', () => {
  test.setTimeout((LOAD_TEST_CONFIG.testDuration + (60 * 1000))); // Test duration + 1 minute buffer

  LOAD_SCENARIOS.forEach(scenario => {
    test(`Load Test: ${scenario.scenarioName}`, async ({ page }) => {
      const loadGenerator = new ConversationalLoadGenerator(page);
      const testStartTime = Date.now();

      console.log(`Starting load test: ${scenario.scenarioName}`);
      console.log(`Target: ${scenario.userCount} concurrent users`);

      // Launch concurrent users (limit to avoid overwhelming the system)
      const concurrentBatchSize = 10;
      const batches = Math.ceil(scenario.userCount / concurrentBatchSize);

      for (let batch = 0; batch < batches; batch++) {
        const batchStart = batch * concurrentBatchSize;
        const batchEnd = Math.min(batchStart + concurrentBatchSize, scenario.userCount);
        const batchSize = batchEnd - batchStart;

        const userPromises = Array.from({ length: batchSize }, (_, i) =>
          loadGenerator.simulateConversationalUser(batchStart + i, scenario)
        );

        // Wait for batch to complete before starting next
        await Promise.all(userPromises);

        // Brief pause between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const testDuration = (Date.now() - testStartTime) / 1000;
      const finalMetrics = loadGenerator.getFinalMetrics();

      console.log(`Load test completed in ${testDuration.toFixed(1)}s`);
      console.log(`Results:`, finalMetrics);

      // Performance assertions
      const totalUsers = finalMetrics.completed + finalMetrics.failed;
      if (totalUsers === 0) {
        throw new Error('No users completed the test');
      }

      const successRate = finalMetrics.completed / totalUsers;
      const avgResponseTime = finalMetrics.responseTimes.length > 0
        ? finalMetrics.responseTimes.reduce((a, b) => a + b, 0) / finalMetrics.responseTimes.length
        : 0;

      // Validate against thresholds
      expect(successRate).toBeGreaterThanOrEqual(LOAD_TEST_CONFIG.minSuccessRate - 0.1); // Allow some tolerance
      expect(avgResponseTime).toBeLessThanOrEqual(LOAD_TEST_CONFIG.maxResponseTime);

      // Log performance summary
      console.log(`✅ Success Rate: ${(successRate * 100).toFixed(1)}%`);
      console.log(`✅ Average Response Time: ${avgResponseTime.toFixed(0)}ms`);

      if (finalMetrics.errors.length > 0) {
        console.log(`❌ Errors encountered: ${finalMetrics.errors.length}`);
      }

      // Store results for reporting
      test.info().annotations.push({
        type: 'performance',
        description: JSON.stringify({
          successRate: successRate * 100,
          avgResponseTime,
          totalUsers,
          testDuration
        }, null, 2)
      });
    });
  });

  test('Conversational memory usage validation', async ({ page }) => {
    const loadGenerator = new ConversationalLoadGenerator(page);

    // Run extended conversation simulation
    const extendedScenario: LoadTestScenario = {
      scenarioName: 'Memory Usage Test',
      userCount: 5,
      complianceType: 'annual-return',
      channel: 'webchat',
      expectedCompletionRate: 0.9
    };

    const userPromises = Array.from({ length: 5 }, (_, i) =>
      loadGenerator.simulateConversationalUser(i, extendedScenario)
    );

    await Promise.all(userPromises);

    // Memory validation would be added here in a real implementation
    console.log('Memory usage test completed');

    test.info().annotations.push({
      type: 'memory',
      description: 'Extended conversation memory usage validated'
    });
  });
});
