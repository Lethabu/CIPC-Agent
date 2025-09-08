import { pgTable, text, timestamp, integer, boolean, decimal, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: text('phone_number').notNull().unique(),
  fullName: text('full_name'),
  idNumber: text('id_number'),
  companyRegNumber: text('company_reg_number'),
  subscriptionTier: text('subscription_tier', { enum: ['freemium', 'starter', 'growth', 'enterprise'] }).default('freemium'),
  subscriptionStatus: text('subscription_status', { enum: ['active', 'cancelled', 'expired'] }).default('active'),
  subscriptionStartDate: timestamp('subscription_start_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  consentGiven: boolean('consent_given').default(false),
  consentDate: timestamp('consent_date'),
}, (table) => ({
  phoneIdx: index('phone_idx').on(table.phoneNumber),
  companyIdx: index('company_idx').on(table.companyRegNumber),
}));

// Companies table
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  registrationNumber: text('registration_number').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  documentType: text('document_type', { enum: ['id_copy', 'proof_of_address', 'cipc_certificate', 'other'] }).notNull(),
  s3Key: text('s3_key').notNull().unique(),
  fileName: text('file_name').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// Agent Activities table
export const agentActivities = pgTable('agent_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  activityType: text('activity_type', { enum: ['filing', 'amendment', 'query', 'other'] }).notNull(),
  description: text('description').notNull(),
  performedBy: text('performed_by').notNull(),
  performedAt: timestamp('performed_at').defaultNow(),
});

// CIPC Filings table
export const cipcFilings = pgTable('cipc_filings', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  filingType: text('filing_type', { enum: ['annual_return', 'director_amendment', 'beneficial_ownership'] }).notNull(),
  status: text('status', { enum: ['pending', 'submitted', 'approved', 'rejected'] }).default('pending'),
  submissionDate: timestamp('submission_date').defaultNow(),
  cipcReference: text('cipc_reference'),
});

// Compliance Alerts table
export const complianceAlerts = pgTable('compliance_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  alertType: text('alert_type', { enum: ['deadline_reminder', 'document_missing', 'compliance_risk'] }).notNull(),
  message: text('message').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high'] }).default('medium'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

// Beneficial Ownership Filings table
export const beneficialOwnershipFilings = pgTable('beneficial_ownership_filings', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  status: text('status', { enum: ['pending', 'submitted', 'approved', 'rejected'] }).default('pending'),
  submissionDate: timestamp('submission_date').defaultNow(),
  lastUpdated: timestamp('last_updated').defaultNow(),
  beneficiariesData: jsonb('beneficiaries_data') as any,
});

// PAYG Transactions
export const paygTransactions = pgTable('payg_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  serviceType: text('service_type', { 
    enum: ['beneficial_ownership', 'director_amendment', 'annual_return', 'bbee_certificate', 'afs_submission', 'company_update'] 
  }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).default('pending'),
  paymentReference: text('payment_reference'),
  urgencyFee: boolean('urgency_fee').default(false),
  filingData: jsonb('filing_data'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Compliance Deadlines
export const complianceDeadlines = pgTable('compliance_deadlines', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  companyRegNumber: text('company_reg_number').notNull(),
  deadlineType: text('deadline_type', { 
    enum: ['annual_return', 'beneficial_ownership', 'afs_submission', 'tax_clearance'] 
  }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  status: text('status', { enum: ['pending', 'completed', 'overdue'] }).default('pending'),
  remindersSent: integer('reminders_sent').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  dueDateIdx: index('due_date_idx').on(table.dueDate),
  statusIdx: index('status_idx').on(table.status),
}));

// Lead Scout Results
export const leadScoutResults = pgTable('lead_scout_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform', { enum: ['twitter', 'linkedin', 'news'] }).notNull(),
  content: text('content').notNull(),
  authorHandle: text('author_handle'),
  leadScore: integer('lead_score').notNull(), // 0-100
  extractedCompanyInfo: jsonb('extracted_company_info'),
  contactAttempted: boolean('contact_attempted').default(false),
  contactedAt: timestamp('contacted_at'),
  conversionStatus: text('conversion_status', { enum: ['pending', 'contacted', 'converted', 'rejected'] }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  scoreIdx: index('score_idx').on(table.leadScore),
  statusIdx: index('conversion_status_idx').on(table.conversionStatus),
}));

// Pricing Configuration
export const pricingConfig = pgTable('pricing_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceType: text('service_type').notNull().unique(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  urgencyMultiplier: decimal('urgency_multiplier', { precision: 3, scale: 2 }).default('1.5'),
  subscriptionTiers: jsonb('subscription_tiers'), // Which tiers include this service
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertPaygTransactionSchema = createInsertSchema(paygTransactions);
export const insertComplianceDeadlineSchema = createInsertSchema(complianceDeadlines);
export const insertLeadScoutResultSchema = createInsertSchema(leadScoutResults);

// New schemas for the added tables
export const insertCompanySchema = createInsertSchema(companies);
export const selectCompanySchema = createSelectSchema(companies);
export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);
export const insertAgentActivitySchema = createInsertSchema(agentActivities);
export const selectAgentActivitySchema = createSelectSchema(agentActivities);
export const insertCipcFilingSchema = createInsertSchema(cipcFilings);
export const selectCipcFilingSchema = createSelectSchema(cipcFilings);
export const insertComplianceAlertSchema = createInsertSchema(complianceAlerts);
export const selectComplianceAlertSchema = createSelectSchema(complianceAlerts);
export const insertBeneficialOwnershipFilingSchema = createInsertSchema(beneficialOwnershipFilings);
export const selectBeneficialOwnershipFilingSchema = createSelectSchema(beneficialOwnershipFilings);

// Partners table
export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  type: text('type', { enum: ['referral', 'reseller', 'enterprise'] }).notNull(),
  companyName: text('company_name'),
  referralCode: text('referral_code').notNull().unique(),
  apiKey: text('api_key').notNull().unique(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('20.00'),
  status: text('status', { enum: ['pending', 'active', 'suspended'] }).default('pending'),
  totalReferrals: integer('total_referrals').default(0),
  totalCommission: decimal('total_commission', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Partner referrals
export const partnerReferrals = pgTable('partner_referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => partners.id).notNull(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  transactionId: uuid('transaction_id').references(() => paygTransactions.id),
  commissionAmount: decimal('commission_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'paid', 'cancelled'] }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  paidAt: timestamp('paid_at'),
});

// Subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tierId: text('tier_id', { enum: ['growth', 'enterprise'] }).notNull(),
  status: text('status', { enum: ['pending', 'active', 'cancelled', 'expired'] }).default('pending'),
  paymentReference: text('payment_reference'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  autoRenew: boolean('auto_renew').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type PaygTransaction = z.infer<typeof insertPaygTransactionSchema>;
export type ComplianceDeadline = z.infer<typeof insertComplianceDeadlineSchema>;
export type LeadScoutResult = z.infer<typeof insertLeadScoutResultSchema>;
export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
export type PartnerReferral = typeof partnerReferrals.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

// New types for the added tables
export type Company = z.infer<typeof selectCompanySchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Document = z.infer<typeof selectDocumentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type AgentActivity = z.infer<typeof selectAgentActivitySchema>;
export type InsertAgentActivity = z.infer<typeof insertAgentActivitySchema>;
export type CipcFiling = z.infer<typeof selectCipcFilingSchema>;
export type InsertCipcFiling = z.infer<typeof insertCipcFilingSchema>;
export type ComplianceAlert = z.infer<typeof selectComplianceAlertSchema>;
export type InsertComplianceAlert = z.infer<typeof insertComplianceAlertSchema>;
export type BeneficialOwnershipFiling = z.infer<typeof selectBeneficialOwnershipFilingSchema>;
export type InsertBeneficialOwnershipFiling = z.infer<typeof insertBeneficialOwnershipFilingSchema>;
