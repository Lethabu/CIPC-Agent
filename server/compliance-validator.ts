// server/compliance-validator.ts
import { EventEmitter } from 'events';
import { z } from 'zod';
import * as promClient from 'prom-client';

interface ComplianceValidationResult {
  isCompliant: boolean;
  violations: ComplianceViolation[];
  recommendations: string[];
  riskScore: number; // 0-100, higher = more risk
  nextReviewDate: Date;
}

interface ComplianceViolation {
  regulation: 'POPIA' | 'Companies Act' | 'CIPC Regulations' | 'ECTA' | 'CPA';
  section: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[];
  remediationSteps: string[];
  deadline?: Date;
}

// South African ID Validation Schema
const SouthAfricanIdSchema = z
  .string()
  .length(13, 'South African ID must be exactly 13 digits')
  .regex(/^\d{13}$/, 'South African ID must contain only digits')
  .refine((id) => {
    // Luhn algorithm validation for South African ID
    const digits = id.split('').map(Number);
    const checkDigit = digits.pop();
    const sum = digits.reduce((acc, digit, index) => {
      const multiplier = (digits.length - index) % 2 + 1;
      const product = digit * multiplier;
      return acc + (product > 9 ? product - 9 : product);
    }, 0);

    return (sum * 9) % 10 === checkDigit;
  }, 'Invalid South African ID number');

export class ComplianceValidator extends EventEmitter {
  private metrics = {
    complianceViolations: new promClient.Counter({
      name: 'cipc_compliance_violations_total',
      help: 'Total number of compliance violations detected',
      labelNames: ['regulation', 'severity']
    }),
    popiaComplianceScore: new promClient.Gauge({
      name: 'cipc_popi_compliance_score',
      help: 'Current POPIA compliance score (0-100)',
      labelNames: ['category']
    }),
    dataRetentionCompliance: new promClient.Gauge({
      name: 'cipc_data_retention_compliance',
      help: 'Data retention compliance score (0-100)'
    })
  };

  // POPIA validation rules
  private popiaValidators = {
    dataCollection: this.validateDataCollection,
    dataProcessing: this.validateDataProcessing,
    dataRetention: this.validateDataRetention,
    dataSubjectRights: this.validateDataSubjectRights,
    dataSecurity: this.validateDataSecurity,
    dataBreachNotification: this.validateDataBreachNotification
  };

  async validateCompliance(
    action: 'data_collection' | 'data_processing' | 'data_deletion' | 'data_sharing',
    context: ComplianceContext
  ): Promise<ComplianceValidationResult> {
    try {
      const violations: ComplianceViolation[] = [];

      // Apply relevant validators based on action
      switch (action) {
        case 'data_collection':
          violations.push(...await this.popiaValidators.dataCollection(context));
          break;
        case 'data_processing':
          violations.push(...await this.popiaValidators.dataProcessing(context));
          break;
        case 'data_deletion':
          violations.push(...await this.validateDataDeletion(context));
          break;
        case 'data_sharing':
          violations.push(...await this.validateDataSharing(context));
          break;
      }

      // South African specific validations
      violations.push(...await this.validateSouthAfricanCompliance(context));

      // Calculate risk score and compliance status
      const riskScore = this.calculateRiskScore(violations);
      const isCompliant = violations.filter(v => v.severity === 'critical').length === 0;

      // Update metrics
      violations.forEach(violation => {
        this.metrics.complianceViolations
          .labels(violation.regulation, violation.severity)
          .inc();
      });

      // Emit events for monitoring
      if (!isCompliant) {
        this.emit('compliance-violation', { violations, context, riskScore });
      }

      return {
        isCompliant,
        violations,
        recommendations: this.generateRecommendations(violations),
        riskScore,
        nextReviewDate: this.calculateNextReviewDate(violations)
      };
    } catch (error) {
      console.error('Compliance validation error:', error);
      // In case of validation failure, assume non-compliant to be safe
      return {
        isCompliant: false,
        violations: [{
          regulation: 'POPIA',
          section: 'General',
          description: 'Compliance validation system error - manual review required',
          severity: 'high',
          evidence: [`Validation error: ${error.message}`],
          remediationSteps: ['Manual compliance review', 'System error investigation'],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }],
        recommendations: ['Immediate manual compliance review', 'System error investigation'],
        riskScore: 80,
        nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      };
    }
  }

  private async validateDataCollection(context: ComplianceContext): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // POPIA Section 18: Lawful processing conditions
    const lawfulPurposes = [
      'legitimate business purposes', 'legal obligation', 'public interest',
      'contractual necessity', 'consent', 'vital interests'
    ];

    if (!context.purpose || !lawfulPurposes.some(purpose =>
      context.purpose.toLowerCase().includes(purpose.replace('_', ' '))
    )) {
      violations.push({
        regulation: 'POPIA',
        section: '18(1)',
        description: 'Data collection purpose does not meet lawful processing conditions',
        severity: 'high',
        evidence: [`Purpose provided: ${context.purpose || 'None'}`],
        remediationSteps: [
          'Document lawful basis for data collection',
          'Obtain explicit consent where required',
          'Update privacy notice with collection purpose'
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    // Validate consent quality
    if (context.dataTypes.includes('personal') && (!context.consentGiven || !context.consentTimestamp)) {
      violations.push({
        regulation: 'POPIA',
        section: '11',
        description: 'Personal data collected without valid consent',
        severity: 'critical',
        evidence: [
          'Personal data types: ' + context.dataTypes.join(', '),
          `Consent given: ${context.consentGiven}`,
          `Consent timestamp: ${context.consentTimestamp || 'None'}`
        ],
        remediationSteps: [
          'Implement explicit consent mechanism',
          'Document consent with timestamps',
          'Stop processing until valid consent obtained'
        ],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    // South African ID validation
    if (context.southAfricanId) {
      try {
        SouthAfricanIdSchema.parse(context.southAfricanId);
      } catch (error) {
        violations.push({
          regulation: 'Identification Act',
          section: 'General',
          description: 'Invalid South African ID number provided',
          severity: 'medium',
          evidence: [`ID provided: ${context.southAfricanId}`, `Validation error: ${error.message}`],
          remediationSteps: [
            'Validate ID format and checksum',
            'Request corrected ID from data subject',
            'Document validation attempts'
          ]
        });
      }
    }

    return violations;
  }

  private async validateDataProcessing(context: ComplianceContext): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // POPIA Section 4: General conditions for processing
    if (context.processingType === 'marketing' && !context.consentGiven) {
      violations.push({
        regulation: 'POPIA',
        section: '11',
        description: 'Direct marketing processing without explicit consent',
        severity: 'critical',
        evidence: ['Processing type: marketing', `Consent given: ${context.consentGiven}`],
        remediationSteps: [
          'Obtain explicit marketing consent',
          'Implement opt-out mechanisms',
          'Stop marketing communications immediately'
        ],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    // Sensitive personal information processing
    const sensitiveDataTypes = ['health', 'criminal_record', 'religious_beliefs', 'political_opinions'];
    if (context.dataTypes.some(type => sensitiveDataTypes.includes(type))) {
      if (!context.highConsentLevel) {
        violations.push({
          regulation: 'POPIA',
          section: '26',
          description: 'Special personal information processed without explicit consent',
          severity: 'critical',
          evidence: ['Sensitive data types: ' + context.dataTypes.join(', ')],
          remediationSteps: [
            'Obtain explicit consent for sensitive data',
            'Document consent with specific purposes',
            'Stop processing sensitive data'
          ],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
      }
    }

    return violations;
  }

  private async validateDataRetention(context: ComplianceContext): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    const maxRetentionPeriods = {
      'tax_records': 7 * 365, // 7 years
      'company_registration': 10 * 365, // 10 years (legal requirement)
      'financial_records': 7 * 365, // 7 years
      'marketing_data': 3 * 365, // 3 years typical
      'consent_records': 6 * 365 // 6 years minimum
    };

    if (context.retentionDays) {
      for (const dataType of context.dataTypes) {
        const maxDays = maxRetentionPeriods[dataType] || 365; // Default 1 year
        if (context.retentionDays > maxDays) {
          violations.push({
            regulation: 'POPIA',
            section: '14',
            description: `Data retention period exceeds recommended maximum for ${dataType}`,
            severity: 'medium',
            evidence: [
              `Data type: ${dataType}`,
              `Retention days: ${context.retentionDays}`,
              `Maximum recommended: ${maxDays} days`
            ],
            remediationSteps: [
              'Review data retention policy',
              'Implement automated data deletion',
              'Document retention justification'
            ]
          });
        }
      }
    }

    return violations;
  }

  private async validateDataSubjectRights(_context?: ComplianceContext): Promise<ComplianceViolation[]> {
    // This would validate that data subject rights mechanisms are in place
    // Implementation depends on your specific interface design
    return [];
  }

  private async validateDataSecurity(context: ComplianceContext): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // POPIA Section 19: Security measures
    const requiredSecurityMeasures = ['encryption', 'access_controls', 'audit_logs'];
    const missingMeasures = requiredSecurityMeasures.filter(
      measure => !context.securityMeasures?.includes(measure)
    );

    if (missingMeasures.length > 0) {
      violations.push({
        regulation: 'POPIA',
        section: '19',
        description: 'Required security measures not implemented',
        severity: 'high',
        evidence: ['Missing measures: ' + missingMeasures.join(', ')],
        remediationSteps: [
          'Implement encryption for data at rest and in transit',
          'Set up proper access controls and authentication',
          'Enable comprehensive audit logging'
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    return violations;
  }

  private async validateDataBreachNotification(context?: ComplianceContext): Promise<ComplianceViolation[]> {
    // Validate that breach notification procedures are in place
    // This is more of a procedural validation
    return [];
  }

  private async validateDataDeletion(context: ComplianceContext): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // POPIA Section 5(d): Right to erasure (right to be forgotten)
    if (context.deletionRequested && !context.deletionCompleted) {
      violations.push({
        regulation: 'POPIA',
        section: '5(d)',
        description: 'Data deletion request not fulfilled within required timeframe',
        severity: 'high',
        evidence: [
          'Deletion requested: ' + context.deletionRequestDate?.toISOString(),
          'Deletion completed: ' + (context.deletionCompleted ? 'Yes' : 'No')
        ],
        remediationSteps: [
          'Complete data deletion immediately',
          'Document deletion confirmation',
          'Notify data subject of completion'
        ],
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day
      });
    }

    return violations;
  }

  private async validateDataSharing(context: ComplianceContext): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // POPIA Section 20: Transborder information flows
    if (context.crossBorderTransfer) {
      if (!context.adequateProtection) {
        violations.push({
          regulation: 'POPIA',
          section: '20',
          description: 'Transborder data transfer without adequate protection',
          severity: 'critical',
          evidence: [
            'Destination country: ' + context.destinationCountry,
            'Adequate protection: ' + (context.adequateProtection ? 'Yes' : 'No')
          ],
          remediationSteps: [
            'Implement adequate protection measures',
            'Obtain explicit consent for transfer',
            'Stop data transfers until compliant'
          ],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
      }
    }

    return violations;
  }

  private async validateSouthAfricanCompliance(context: ComplianceContext): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    // Companies Act compliance for CIPC interactions
    if (context.interactionType === 'cipc_filing') {
      const currentDate = new Date();
      const fiscalYear = currentDate.getFullYear() - (currentDate.getMonth() >= 3 ? 0 : 1);
      const annualReturnDeadline = new Date(fiscalYear + 1, 2, 31); // March 31

      if (currentDate > annualReturnDeadline) {
        violations.push({
          regulation: 'Companies Act',
          section: '33(1)',
          description: 'Annual return filing overdue',
          severity: 'high',
          evidence: [`Deadline: ${annualReturnDeadline.toISOString()}`, `Current date: ${currentDate.toISOString()}`],
          remediationSteps: [
            'File outstanding annual returns immediately',
            'Pay applicable penalties',
            'Implement deadline reminders'
          ],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
      }
    }

    return violations;
  }

  private calculateRiskScore(violations: ComplianceViolation[]): number {
    if (violations.length === 0) return 0;

    const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    const maxPossibleScore = violations.length * 4;

    const weightedScore = violations.reduce((sum, violation) =>
      sum + severityWeights[violation.severity], 0
    );

    // Normalize to 0-100 scale
    return Math.min((weightedScore / maxPossibleScore) * 100, 100);
  }

  private generateRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations = new Set<string>();

    // Base recommendations
    recommendations.add('Conduct regular compliance audits');
    recommendations.add('Implement automated compliance monitoring');
    recommendations.add('Provide staff compliance training');

    // Violation-specific recommendations
    for (const violation of violations) {
      violation.remediationSteps.forEach(step => recommendations.add(step));
    }

    // Add South African specific recommendations
    recommendations.add('Review POPIA compliance annually');
    recommendations.add('Maintain detailed compliance audit trails');
    recommendations.add('Prepare for Information Regulator inspections');

    return Array.from(recommendations);
  }

  private calculateNextReviewDate(violations: ComplianceViolation[]): Date {
    const baseReviewDate = new Date();
    baseReviewDate.setDate(baseReviewDate.getDate() + 90); // 90 days default

    // Adjust based on violation severity
    const criticalViolations = violations.filter(v => v.severity === 'critical');

    if (criticalViolations.length > 0) {
      baseReviewDate.setDate(baseReviewDate.getDate() - 60); // Review in 30 days
    } else if (violations.some(v => v.severity === 'high')) {
      baseReviewDate.setDate(baseReviewDate.getDate() - 30); // Review in 60 days
    }

    return baseReviewDate;
  }

  async handleDataSubjectRequest(
    requestType: 'access' | 'rectify' | 'delete' | 'restrict' | 'portability' | 'object',
    userId: string,
    southAfricanId?: string
  ): Promise<DataSubjectResponse> {
    // Validate South African ID if provided
    if (southAfricanId) {
      try {
        SouthAfricanIdSchema.parse(southAfricanId);
      } catch (error) {
        return {
          success: false,
          message: 'Invalid South African ID provided',
          requestId: null,
          estimatedCompletionDate: null,
          requiresVerification: true
        };
      }
    }

    // Log the request for compliance audit trail
    const requestId = `DSR-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    this.emit('data-subject-request', {
      requestId,
      type: requestType,
      userId,
      southAfricanId,
      timestamp: new Date(),
      status: 'received'
    });

    // Estimate completion based on request type (POPIA requires 1-12 months max)
    const estimatedCompletionDate = new Date();
    switch (requestType) {
      case 'access':
      case 'rectify':
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + 30); // 30 days
        break;
      case 'delete':
      case 'restrict':
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + 30); // 30 days
        break;
      case 'portability':
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + 45); // 45 days
        break;
      case 'object':
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + 30); // 30 days
        break;
    }

    return {
      success: true,
      requestId,
      message: `Your data subject request has been received and is being processed.`,
      estimatedCompletionDate,
      requiresVerification: false
    };
  }
}

interface ComplianceContext {
  purpose?: string;
  dataTypes: string[];
  consentGiven?: boolean;
  consentTimestamp?: Date;
  southAfricanId?: string;
  processingType?: string;
  retentionDays?: number;
  highConsentLevel?: boolean;
  interactionType?: string;
  securityMeasures?: string[];
  crossBorderTransfer?: boolean;
  destinationCountry?: string;
  adequateProtection?: boolean;
  deletionRequested?: boolean;
  deletionRequestDate?: Date;
  deletionCompleted?: boolean;
}

interface DataSubjectResponse {
  success: boolean;
  requestId: string | null;
  message: string;
  estimatedCompletionDate: Date | null;
  requiresVerification: boolean;
}

// Export singleton
export const complianceValidator = new ComplianceValidator();
