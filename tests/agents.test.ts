import { OnboardingAgent } from '../server/services/ai-agents/onboarding-agent';
import { FilingAgent } from '../server/services/ai-agents/filing-agent';
import { SupportAgent } from '../server/services/ai-agents/support-agent';

describe('AI Agents', () => {
  describe('OnboardingAgent', () => {
    const agent = new OnboardingAgent();

    test('should validate company name', async () => {
      const result = await agent.processUserInput('Tech PTY', { currentStep: 'company_name' });
      expect(result.nextStep).toBe('business_type');
    });

    test('should reject short company name', async () => {
      const result = await agent.processUserInput('AB', { currentStep: 'company_name' });
      expect(result.message).toContain('too short');
    });
  });

  describe('FilingAgent', () => {
    const agent = new FilingAgent();

    test('should process annual return', async () => {
      const result = await agent.processFiling('comp_123', 'annual_return', {
        financial_year_end: '2024-02-28',
        turnover: 1000000,
        assets: 500000
      });
      expect(result.status).toBe('submitted');
    });

    test('should reject incomplete filing', async () => {
      const result = await agent.processFiling('comp_123', 'annual_return', {});
      expect(result.status).toBe('incomplete');
    });
  });

  describe('SupportAgent', () => {
    const agent = new SupportAgent();

    test('should detect deadline intent', async () => {
      const result = await agent.processQuery('When is my deadline?', 'user_123');
      expect(result.response).toContain('deadline');
    });

    test('should provide filing assistance', async () => {
      const result = await agent.processQuery('How do I file?', 'user_123');
      expect(result.actions).toContain('start_filing');
    });
  });
});