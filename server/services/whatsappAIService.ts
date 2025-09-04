import OpenAI from "openai";
import { aiOrchestrator } from "./aiOrchestrator.js";

interface ConversationContext {
  userId: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    intent?: string;
  }>;
  currentFlow?: string;
  userData?: any;
  lastActivity: Date;
}

interface AIResponse {
  message: string;
  requiresAction?: boolean;
  actionType?: string;
  actionData?: any;
  suggestedReplies?: string[];
}

export class WhatsAppAIService {
  private openai: OpenAI;
  private conversations: Map<string, ConversationContext> = new Map();
  private readonly CONTEXT_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || "" 
    });
    
    // Clean up old conversations every hour
    setInterval(() => this.cleanupOldConversations(), 60 * 60 * 1000);
  }

  async processMessage(userId: string, message: string, userProfile?: any): Promise<AIResponse> {
    try {
      // Get or create conversation context
      const context = this.getOrCreateContext(userId);
      
      // Add user message to history
      context.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Analyze intent and generate response
      const intent = await this.analyzeIntent(message, context);
      const response = await this.generateContextualResponse(message, context, intent);

      // Add assistant response to history
      context.conversationHistory.push({
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        intent
      });

      context.lastActivity = new Date();
      
      return response;
    } catch (error) {
      console.error('WhatsApp AI processing error:', error);
      return {
        message: "I'm experiencing some technical difficulties. Please try again in a moment.",
        suggestedReplies: ["Try again", "Contact support", "Main menu"]
      };
    }
  }

  private getOrCreateContext(userId: string): ConversationContext {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, {
        userId,
        conversationHistory: [],
        lastActivity: new Date()
      });
    }
    return this.conversations.get(userId)!;
  }

  private async analyzeIntent(message: string, context: ConversationContext): Promise<string> {
    const systemPrompt = `
    You are an intent classifier for a CIPC compliance assistant. Analyze the user's message and classify it into one of these intents:
    
    - beneficial_ownership: Questions about beneficial ownership declarations
    - company_registration: Company registration queries
    - compliance_check: Checking compliance status
    - form_assistance: Help with forms
    - payment_inquiry: Payment-related questions
    - general_inquiry: General questions
    - greeting: Greetings and pleasantries
    - complaint: Complaints or issues
    
    Consider the conversation history for context.
    
    Conversation History:
    ${context.conversationHistory.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')}
    
    Current Message: "${message}"
    
    Respond with just the intent name.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }],
      max_tokens: 50,
      temperature: 0.1
    });

    return response.choices[0]?.message?.content?.trim() || 'general_inquiry';
  }

  private async generateContextualResponse(
    message: string, 
    context: ConversationContext, 
    intent: string
  ): Promise<AIResponse> {
    // Handle specific intents with agent orchestration
    switch (intent) {
      case 'beneficial_ownership':
        return await this.handleBeneficialOwnershipIntent(message, context);
      case 'company_registration':
        return await this.handleCompanyRegistrationIntent(message, context);
      case 'compliance_check':
        return await this.handleComplianceCheckIntent(message, context);
      case 'form_assistance':
        return await this.handleFormAssistanceIntent(message, context);
      case 'payment_inquiry':
        return await this.handlePaymentInquiryIntent(message, context);
      default:
        return await this.generateGeneralResponse(message, context);
    }
  }

  private async handleBeneficialOwnershipIntent(
    message: string, 
    context: ConversationContext
  ): Promise<AIResponse> {
    // Check if user is asking for form generation
    if (message.toLowerCase().includes('form') || message.toLowerCase().includes('generate')) {
      return {
        message: "I can help you generate a beneficial ownership form! I'll need some information about your company. Let me start by asking:\n\n1. What is your company registration number?\n2. Company name?\n3. How many beneficial owners are there?",
        requiresAction: true,
        actionType: 'collect_bo_info',
        suggestedReplies: ["Start form", "What info needed?", "Cost estimate"]
      };
    }

    // Check if user is asking about costs
    if (message.toLowerCase().includes('cost') || message.toLowerCase().includes('fee')) {
      const costInfo = await aiOrchestrator.routeTask('get_beneficial_ownership_cost', {});
      return {
        message: `The beneficial ownership declaration filing fee is R50. This includes:\n\n✅ Form generation\n✅ Validation checks\n✅ CIPC submission\n✅ Confirmation receipt\n\nWould you like to proceed?`,
        suggestedReplies: ["Yes, proceed", "More info", "Payment options"]
      };
    }

    return {
      message: "I can assist you with beneficial ownership declarations. I can:\n\n🔹 Generate your BO form\n🔹 Check compliance status\n🔹 Provide cost estimates\n🔹 Submit to CIPC\n\nWhat would you like to do?",
      suggestedReplies: ["Generate form", "Check compliance", "Get cost info"]
    };
  }

  private async handleCompanyRegistrationIntent(
    message: string, 
    context: ConversationContext
  ): Promise<AIResponse> {
    return {
      message: "I can help with company registration queries! Are you looking to:\n\n🏢 Register a new company\n📋 Check registration status\n📄 Get registration documents\n🔍 Search company information",
      suggestedReplies: ["New registration", "Check status", "Get documents"]
    };
  }

  private async handleComplianceCheckIntent(
    message: string, 
    context: ConversationContext
  ): Promise<AIResponse> {
    return {
      message: "I'll help you check your compliance status. Please provide your company registration number, and I'll run a comprehensive compliance check including:\n\n✅ Annual returns\n✅ Beneficial ownership\n✅ Tax compliance\n✅ Outstanding fees",
      requiresAction: true,
      actionType: 'compliance_check',
      suggestedReplies: ["Enter reg number", "What's checked?", "Sample report"]
    };
  }

  private async handleFormAssistanceIntent(
    message: string, 
    context: ConversationContext
  ): Promise<AIResponse> {
    return {
      message: "I can help you with various CIPC forms:\n\n📝 Beneficial Ownership (BO)\n📋 Annual Returns (AR)\n🏢 Change of Directors (CoD)\n📍 Change of Address (CoA)\n\nWhich form do you need assistance with?",
      suggestedReplies: ["BO Form", "Annual Returns", "Director Changes"]
    };
  }

  private async handlePaymentInquiryIntent(
    message: string, 
    context: ConversationContext
  ): Promise<AIResponse> {
    return {
      message: "Payment information:\n\n💳 We accept:\n• Credit/Debit cards\n• EFT\n• PayFast secure payments\n\n💰 Current fees:\n• Beneficial Ownership: R50\n• Annual Returns: R60\n• Director Changes: R40\n\nAll payments are secure and you'll receive instant confirmation.",
      suggestedReplies: ["Make payment", "Payment methods", "Get receipt"]
    };
  }

  private async generateGeneralResponse(
    message: string, 
    context: ConversationContext
  ): Promise<AIResponse> {
    const systemPrompt = `
    You are a helpful CIPC compliance assistant for South African businesses. 
    Be friendly, professional, and concise. Always offer specific help.
    
    Conversation context:
    ${context.conversationHistory.slice(-3).map(h => `${h.role}: ${h.content}`).join('\n')}
    
    Current message: "${message}"
    
    Provide a helpful response and suggest 2-3 relevant actions.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: systemPrompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    return {
      message: response.choices[0]?.message?.content || "How can I help you with CIPC compliance today?",
      suggestedReplies: ["Beneficial ownership", "Company registration", "Compliance check"]
    };
  }

  private cleanupOldConversations(): void {
    const now = new Date();
    for (const [userId, context] of this.conversations.entries()) {
      if (now.getTime() - context.lastActivity.getTime() > this.CONTEXT_TIMEOUT) {
        this.conversations.delete(userId);
      }
    }
  }

  // Get conversation analytics
  getConversationAnalytics() {
    const totalConversations = this.conversations.size;
    const activeConversations = Array.from(this.conversations.values())
      .filter(c => new Date().getTime() - c.lastActivity.getTime() < 5 * 60 * 1000).length;
    
    return {
      totalConversations,
      activeConversations,
      averageHistoryLength: totalConversations > 0 
        ? Array.from(this.conversations.values())
            .reduce((sum, c) => sum + c.conversationHistory.length, 0) / totalConversations 
        : 0
    };
  }
}

export const whatsappAIService = new WhatsAppAIService();