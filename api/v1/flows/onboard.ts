import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../../server/src/db';
import { users } from '../../../shared/schema';
import { conversationalMetrics } from '../../../server/monitoring/conversational-metrics';
import { conversationalErrorLogger } from '../../../server/conversational-error-logger';
import { complianceValidator } from '../../../server/compliance-validator';
import { conversationalThreatDetector } from '../../../server/conversational-threat-detection';

// Enterprise-grade conversational onboarding with compliance monitoring
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2)}`;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.authorization;
    const expectedSecret = process.env.TYPEBOT_WEBHOOK_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      await conversationalErrorLogger.logConversationalError({
        conversationId,
        userId: 'unknown',
        channel: 'webchat', // API requests treated as webchat channel
        error: new Error('Unauthorized webhook access attempt'),
        context: {
          timestamp: new Date(),
          step: 'authentication',
          userInput: 'webhook_request'
        },
        severity: 'medium'
      });
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { companyRegistrationNumber, whatsappNumber, popiaConsent, southAfricanId } = req.body;

    // Start conversation metrics tracking
    conversationalMetrics.recordConversationStart({
      conversationId,
      userId: southAfricanId || `user_${Date.now()}`,
      channel: 'whatsapp'
    });

    // Validate required fields
    if (!companyRegistrationNumber || !whatsappNumber || popiaConsent !== true) {
      await conversationalErrorLogger.logConversationalError({
        conversationId,
        userId: southAfricanId || 'unknown',
        channel: 'whatsapp',
        error: new Error('Missing required onboarding data'),
        context: {
          timestamp: new Date(),
          step: 'data_validation',
          userInput: JSON.stringify(req.body)
        },
        severity: 'low'
      });
      return res.status(400).json({ success: false, error: 'Missing required fields: companyRegistrationNumber, whatsappNumber, and popiaConsent=true' });
    }

    // Step 1: Compliance validation - Data Collection Lawful Basis
    const complianceResult = await complianceValidator.validateCompliance('data_collection', {
      purpose: 'CIPC compliance automation and annual return filing',
      dataTypes: ['personal', 'company', 'financial'],
      consentGiven: popiaConsent,
      consentTimestamp: new Date(),
      southAfricanId: southAfricanId,
      processingType: 'marketing', // Direct marketing consent required
      interactionType: 'onboarding'
    });

    if (!complianceResult.isCompliant) {
      // Log compliance violation
      await conversationalMetrics.recordComplianceMetrics(
        'POPIA',
        'data_collection',
        false,
        complianceResult.violations.length
      );

      // Log detailed compliance error
      await conversationalErrorLogger.logConversationalError({
        conversationId,
        userId: southAfricanId || 'unknown',
        channel: 'whatsapp',
        error: new Error(`Compliance violation: ${complianceResult.violations.map(v => v.description).join(', ')}`),
        context: {
          timestamp: new Date(),
          step: 'compliance_validation',
          complianceType: 'data_collection',
          complianceViolations: complianceResult.violations.length
        },
        severity: 'high'
      });

      return res.status(400).json({
        success: false,
        error: 'Compliance requirements not met',
        violations: complianceResult.violations.map(v => ({
          regulation: v.regulation,
          description: v.description,
          remediation: v.remediationSteps
        }))
      });
    }

    // Step 2: Threat detection - Analyze user input for security risks
    const conversationText = `Company registration: ${companyRegistrationNumber}, WhatsApp: ${whatsappNumber}, SA ID: ${southAfricanId || 'not provided'}`;
    const threatAnalysis = await conversationalThreatDetector.analyzeConversationForThreats([{
      sender: 'user',
      content: conversationText,
      timestamp: new Date()
    }]);

    if (threatAnalysis.requiresAction) {
      await conversationalMetrics.recordSecurityMetrics(
        threatAnalysis.threats[0]?.type || 'unknown',
        threatAnalysis.threatLevel,
        false // auto_mitigated
      );

      return res.status(400).json({
        success: false,
        error: 'Security validation failed',
        threatLevel: threatAnalysis.threatLevel,
        recommendations: threatAnalysis.recommendations
      });
    }

    // Step 3: South African ID Validation (if provided)
    let saIdValidation = null;
    if (southAfricanId) {
      saIdValidation = await complianceValidator.handleDataSubjectRequest(
        'access',
        southAfricanId,
        southAfricanId
      );

      if (!saIdValidation.success) {
        return res.status(400).json({
          success: false,
          error: saIdValidation.message,
          field: 'southAfricanId'
        });
      }
    }

    // Step 4: Create user record with compliance metadata
    const newUser = await db.insert(users).values({
      companyRegNumber: companyRegistrationNumber,
      phoneNumber: whatsappNumber,
      consentGiven: true,
      consentDate: new Date()
    }).returning();

    // Step 5: Record successful compliance metrics
    await conversationalMetrics.recordComplianceMetrics(
      'POPIA',
      'data_collection',
      true
    );

    await conversationalMetrics.recordConversationComplete({
      conversationId,
      userId: southAfricanId || newUser[0].id.toString(),
      channel: 'whatsapp',
      complianceType: 'onboarding',
      result: 'completed',
      conversationStartTime: Date.now(),
      durationSeconds: 0, // Calculate actual duration from start
      interactionsCount: 1,
      complianceViolations: 0
    });

    // Step 6: Send personalized welcome message via AISensy
    const welcomeMessage = `🎉 Welcome to CIPC Agent!

Your onboarding is complete and POPIA-compliant. We'll help you with:
• Annual returns (R199)
• Beneficial ownership registration (R99)  
• Director amendments (R149)

Your compliance journey starts now. Trained AI specialists are available 24/7.

Company: ${companyRegistrationNumber}
Reference: ${newUser[0].id}`;

    await sendAisensyMessage(whatsappNumber, welcomeMessage);

    res.status(200).json({
      success: true,
      userId: newUser[0].id,
      conversationId,
      compliance: {
        status: complianceResult.isCompliant ? 'compliant' : 'violations',
        riskScore: complianceResult.riskScore,
        nextReviewDate: complianceResult.nextReviewDate
      },
      onboarding: {
        southAfricanIdValidated: !!saIdValidation?.success,
        securityApproved: !threatAnalysis.requiresAction,
        enterpriseProcessing: true
      }
    });

  } catch (error: any) {
    // Enterprise error logging and metrics
    await conversationalErrorLogger.logConversationalError({
      conversationId,
      userId: req.body?.southAfricanId || 'unknown',
      channel: 'webchat', // API errors treated as webchat channel
      error,
      context: {
        timestamp: new Date(),
        step: 'error_handling',
        userInput: JSON.stringify(req.body)
      },
      severity: 'high'
    });

    await conversationalMetrics.recordConversationComplete({
      conversationId,
      userId: req.body?.southAfricanId || 'error-user',
      channel: 'webchat', // API errors treated as webchat channel
      result: 'error',
      complianceType: 'onboarding',
      conversationStartTime: Date.now(),
      durationSeconds: 0,
      interactionsCount: 0
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      conversationId
    });
  }
}

// AISensy service with enterprise error handling
async function sendAisensyMessage(phone: string, message: string) {
  const aisensyApiKey = process.env.AISENSY_API_KEY;
  if (!aisensyApiKey) {
    throw new Error('AISENSY_API_KEY not configured');
  }

  try {
    const response = await fetch('https://api.aisensy.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aisensyApiKey}`,
      },
      body: JSON.stringify({
        phone_number: phone,
        message: message,
        message_type: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`AISensy API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // Enterprise error handling
    await conversationalErrorLogger.logConversationalError({
      conversationId: `whatsapp_${Date.now()}`,
      userId: phone,
      channel: 'whatsapp',
      error: error as Error,
        context: {
          timestamp: new Date(),
          step: 'whatsapp_notification',
          userInput: 'whatsapp_api_call'
        },
      severity: 'medium'
    });

    // Don't fail the entire onboarding process for notification issues
    console.warn('WhatsApp notification failed:', error);
    return { success: false, fallback: true };
  }
}
