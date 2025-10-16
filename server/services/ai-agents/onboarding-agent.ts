export class OnboardingAgent {
  async processUserInput(input: string, context: any) {
    const steps = [
      'company_name',
      'business_type',
      'directors',
      'address',
      'documents'
    ];

    const currentStep = this.getCurrentStep(context);
    const validation = this.validateInput(input, currentStep);

    if (!validation.valid) {
      return {
        message: validation.error,
        nextStep: currentStep
      };
    }

    const nextStep = this.getNextStep(currentStep, steps);
    
    return {
      message: this.getStepMessage(nextStep),
      nextStep: nextStep,
      data: { [currentStep]: input }
    };
  }

  private getCurrentStep(context: any): string {
    return context.currentStep || 'company_name';
  }

  private validateInput(input: string, step: string): { valid: boolean; error?: string } {
    switch (step) {
      case 'company_name':
        return input.length > 2 ? { valid: true } : { valid: false, error: 'Company name too short' };
      case 'business_type':
        const validTypes = ['pty', 'cc', 'npc'];
        return validTypes.some(type => input.toLowerCase().includes(type)) 
          ? { valid: true } 
          : { valid: false, error: 'Please specify: PTY, CC, or NPC' };
      default:
        return { valid: true };
    }
  }

  private getNextStep(current: string, steps: string[]): string {
    const index = steps.indexOf(current);
    return index < steps.length - 1 ? steps[index + 1] : 'complete';
  }

  private getStepMessage(step: string): string {
    const messages = {
      company_name: 'What is your company name?',
      business_type: 'What type of business? (PTY/CC/NPC)',
      directors: 'Who are the directors? (Names and ID numbers)',
      address: 'What is the business address?',
      documents: 'Please upload required documents',
      complete: 'Registration complete! Processing your application...'
    };
    return messages[step] || 'Thank you for the information.';
  }
}