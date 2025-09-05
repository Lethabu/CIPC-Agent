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

export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;
export type PaygTransaction = z.infer<typeof insertPaygTransactionSchema>;
export type ComplianceDeadline = z.infer<typeof insertComplianceDeadlineSchema>;
export type LeadScoutResult = z.infer<typeof insertLeadScoutResultSchema>;