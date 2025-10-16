"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptions = exports.partnerReferrals = exports.partners = exports.selectBeneficialOwnershipFilingSchema = exports.insertBeneficialOwnershipFilingSchema = exports.selectComplianceAlertSchema = exports.insertComplianceAlertSchema = exports.selectCipcFilingSchema = exports.insertCipcFilingSchema = exports.selectAgentActivitySchema = exports.insertAgentActivitySchema = exports.selectDocumentSchema = exports.insertDocumentSchema = exports.selectCompanySchema = exports.insertCompanySchema = exports.insertLeadScoutResultSchema = exports.insertComplianceDeadlineSchema = exports.insertPaygTransactionSchema = exports.selectUserSchema = exports.insertUserSchema = exports.pricingConfig = exports.leadScoutResults = exports.complianceDeadlines = exports.paygTransactions = exports.beneficialOwnershipFilings = exports.complianceAlerts = exports.cipcFilings = exports.agentActivities = exports.documents = exports.companies = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Users table
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    phoneNumber: (0, pg_core_1.text)('phone_number').notNull().unique(),
    fullName: (0, pg_core_1.text)('full_name'),
    idNumber: (0, pg_core_1.text)('id_number'),
    companyRegNumber: (0, pg_core_1.text)('company_reg_number'),
    subscriptionTier: (0, pg_core_1.text)('subscription_tier', { enum: ['freemium', 'starter', 'growth', 'enterprise'] }).default('freemium'),
    subscriptionStatus: (0, pg_core_1.text)('subscription_status', { enum: ['active', 'cancelled', 'expired'] }).default('active'),
    subscriptionStartDate: (0, pg_core_1.timestamp)('subscription_start_date'),
    subscriptionEndDate: (0, pg_core_1.timestamp)('subscription_end_date'),
    totalSpent: (0, pg_core_1.decimal)('total_spent', { precision: 10, scale: 2 }).default('0'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    consentGiven: (0, pg_core_1.boolean)('consent_given').default(false),
    consentDate: (0, pg_core_1.timestamp)('consent_date'),
}, (table) => ({
    phoneIdx: (0, pg_core_1.index)('phone_idx').on(table.phoneNumber),
    companyIdx: (0, pg_core_1.index)('company_idx').on(table.companyRegNumber),
}));
// Companies table
exports.companies = (0, pg_core_1.pgTable)('companies', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    registrationNumber: (0, pg_core_1.text)('registration_number').notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
// Documents table
exports.documents = (0, pg_core_1.pgTable)('documents', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    companyId: (0, pg_core_1.uuid)('company_id').references(() => exports.companies.id).notNull(),
    documentType: (0, pg_core_1.text)('document_type', { enum: ['id_copy', 'proof_of_address', 'cipc_certificate', 'other'] }).notNull(),
    s3Key: (0, pg_core_1.text)('s3_key').notNull().unique(),
    fileName: (0, pg_core_1.text)('file_name').notNull(),
    uploadedAt: (0, pg_core_1.timestamp)('uploaded_at').defaultNow(),
});
// Agent Activities table
exports.agentActivities = (0, pg_core_1.pgTable)('agent_activities', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.uuid)('company_id').references(() => exports.companies.id).notNull(),
    activityType: (0, pg_core_1.text)('activity_type', { enum: ['filing', 'amendment', 'query', 'other'] }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    performedBy: (0, pg_core_1.text)('performed_by').notNull(),
    performedAt: (0, pg_core_1.timestamp)('performed_at').defaultNow(),
});
// CIPC Filings table
exports.cipcFilings = (0, pg_core_1.pgTable)('cipc_filings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.uuid)('company_id').references(() => exports.companies.id).notNull(),
    filingType: (0, pg_core_1.text)('filing_type', { enum: ['annual_return', 'director_amendment', 'beneficial_ownership'] }).notNull(),
    status: (0, pg_core_1.text)('status', { enum: ['pending', 'submitted', 'approved', 'rejected'] }).default('pending'),
    submissionDate: (0, pg_core_1.timestamp)('submission_date').defaultNow(),
    cipcReference: (0, pg_core_1.text)('cipc_reference'),
});
// Compliance Alerts table
exports.complianceAlerts = (0, pg_core_1.pgTable)('compliance_alerts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.uuid)('company_id').references(() => exports.companies.id).notNull(),
    alertType: (0, pg_core_1.text)('alert_type', { enum: ['deadline_reminder', 'document_missing', 'compliance_risk'] }).notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    severity: (0, pg_core_1.text)('severity', { enum: ['low', 'medium', 'high'] }).default('medium'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    resolvedAt: (0, pg_core_1.timestamp)('resolved_at'),
});
// Beneficial Ownership Filings table
exports.beneficialOwnershipFilings = (0, pg_core_1.pgTable)('beneficial_ownership_filings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    companyId: (0, pg_core_1.uuid)('company_id').references(() => exports.companies.id).notNull(),
    status: (0, pg_core_1.text)('status', { enum: ['pending', 'submitted', 'approved', 'rejected'] }).default('pending'),
    submissionDate: (0, pg_core_1.timestamp)('submission_date').defaultNow(),
    lastUpdated: (0, pg_core_1.timestamp)('last_updated').defaultNow(),
    beneficiariesData: (0, pg_core_1.jsonb)('beneficiaries_data'),
});
// PAYG Transactions
exports.paygTransactions = (0, pg_core_1.pgTable)('payg_transactions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    serviceType: (0, pg_core_1.text)('service_type', {
        enum: ['beneficial_ownership', 'director_amendment', 'annual_return', 'bbee_certificate', 'afs_submission', 'company_update']
    }).notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 10, scale: 2 }).notNull(),
    status: (0, pg_core_1.text)('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).default('pending'),
    paymentReference: (0, pg_core_1.text)('payment_reference'),
    urgencyFee: (0, pg_core_1.boolean)('urgency_fee').default(false),
    filingData: (0, pg_core_1.jsonb)('filing_data'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
});
// Compliance Deadlines
exports.complianceDeadlines = (0, pg_core_1.pgTable)('compliance_deadlines', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    companyRegNumber: (0, pg_core_1.text)('company_reg_number').notNull(),
    deadlineType: (0, pg_core_1.text)('deadline_type', {
        enum: ['annual_return', 'beneficial_ownership', 'afs_submission', 'tax_clearance']
    }).notNull(),
    dueDate: (0, pg_core_1.timestamp)('due_date').notNull(),
    status: (0, pg_core_1.text)('status', { enum: ['pending', 'completed', 'overdue'] }).default('pending'),
    remindersSent: (0, pg_core_1.integer)('reminders_sent').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
}, (table) => ({
    dueDateIdx: (0, pg_core_1.index)('due_date_idx').on(table.dueDate),
    statusIdx: (0, pg_core_1.index)('status_idx').on(table.status),
}));
// Lead Scout Results
exports.leadScoutResults = (0, pg_core_1.pgTable)('lead_scout_results', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    platform: (0, pg_core_1.text)('platform', { enum: ['twitter', 'linkedin', 'news'] }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    authorHandle: (0, pg_core_1.text)('author_handle'),
    leadScore: (0, pg_core_1.integer)('lead_score').notNull(), // 0-100
    extractedCompanyInfo: (0, pg_core_1.jsonb)('extracted_company_info'),
    contactAttempted: (0, pg_core_1.boolean)('contact_attempted').default(false),
    contactedAt: (0, pg_core_1.timestamp)('contacted_at'),
    conversionStatus: (0, pg_core_1.text)('conversion_status', { enum: ['pending', 'contacted', 'converted', 'rejected'] }).default('pending'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
}, (table) => ({
    scoreIdx: (0, pg_core_1.index)('score_idx').on(table.leadScore),
    statusIdx: (0, pg_core_1.index)('conversion_status_idx').on(table.conversionStatus),
}));
// Pricing Configuration
exports.pricingConfig = (0, pg_core_1.pgTable)('pricing_config', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    serviceType: (0, pg_core_1.text)('service_type').notNull().unique(),
    basePrice: (0, pg_core_1.decimal)('base_price', { precision: 10, scale: 2 }).notNull(),
    urgencyMultiplier: (0, pg_core_1.decimal)('urgency_multiplier', { precision: 3, scale: 2 }).default('1.5'),
    subscriptionTiers: (0, pg_core_1.jsonb)('subscription_tiers'), // Which tiers include this service
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
// Zod schemas for validation
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.selectUserSchema = (0, drizzle_zod_1.createSelectSchema)(exports.users);
exports.insertPaygTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.paygTransactions);
exports.insertComplianceDeadlineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.complianceDeadlines);
exports.insertLeadScoutResultSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leadScoutResults);
// New schemas for the added tables
exports.insertCompanySchema = (0, drizzle_zod_1.createInsertSchema)(exports.companies);
exports.selectCompanySchema = (0, drizzle_zod_1.createSelectSchema)(exports.companies);
exports.insertDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.documents);
exports.selectDocumentSchema = (0, drizzle_zod_1.createSelectSchema)(exports.documents);
exports.insertAgentActivitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentActivities);
exports.selectAgentActivitySchema = (0, drizzle_zod_1.createSelectSchema)(exports.agentActivities);
exports.insertCipcFilingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cipcFilings);
exports.selectCipcFilingSchema = (0, drizzle_zod_1.createSelectSchema)(exports.cipcFilings);
exports.insertComplianceAlertSchema = (0, drizzle_zod_1.createInsertSchema)(exports.complianceAlerts);
exports.selectComplianceAlertSchema = (0, drizzle_zod_1.createSelectSchema)(exports.complianceAlerts);
exports.insertBeneficialOwnershipFilingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.beneficialOwnershipFilings);
exports.selectBeneficialOwnershipFilingSchema = (0, drizzle_zod_1.createSelectSchema)(exports.beneficialOwnershipFilings);
// Partners table
exports.partners = (0, pg_core_1.pgTable)('partners', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)('name').notNull(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    phone: (0, pg_core_1.text)('phone'),
    type: (0, pg_core_1.text)('type', { enum: ['referral', 'reseller', 'enterprise'] }).notNull(),
    companyName: (0, pg_core_1.text)('company_name'),
    referralCode: (0, pg_core_1.text)('referral_code').notNull().unique(),
    apiKey: (0, pg_core_1.text)('api_key').notNull().unique(),
    commissionRate: (0, pg_core_1.decimal)('commission_rate', { precision: 5, scale: 2 }).default('20.00'),
    status: (0, pg_core_1.text)('status', { enum: ['pending', 'active', 'suspended'] }).default('pending'),
    totalReferrals: (0, pg_core_1.integer)('total_referrals').default(0),
    totalCommission: (0, pg_core_1.decimal)('total_commission', { precision: 10, scale: 2 }).default('0'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
// Partner referrals
exports.partnerReferrals = (0, pg_core_1.pgTable)('partner_referrals', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    partnerId: (0, pg_core_1.uuid)('partner_id').references(() => exports.partners.id).notNull(),
    customerId: (0, pg_core_1.uuid)('customer_id').references(() => exports.users.id).notNull(),
    transactionId: (0, pg_core_1.uuid)('transaction_id').references(() => exports.paygTransactions.id),
    commissionAmount: (0, pg_core_1.decimal)('commission_amount', { precision: 10, scale: 2 }).notNull(),
    status: (0, pg_core_1.text)('status', { enum: ['pending', 'paid', 'cancelled'] }).default('pending'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    paidAt: (0, pg_core_1.timestamp)('paid_at'),
});
// Subscriptions
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id).notNull(),
    tierId: (0, pg_core_1.text)('tier_id', { enum: ['growth', 'enterprise'] }).notNull(),
    status: (0, pg_core_1.text)('status', { enum: ['pending', 'active', 'cancelled', 'expired'] }).default('pending'),
    paymentReference: (0, pg_core_1.text)('payment_reference'),
    startDate: (0, pg_core_1.timestamp)('start_date'),
    endDate: (0, pg_core_1.timestamp)('end_date'),
    autoRenew: (0, pg_core_1.boolean)('auto_renew').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
//# sourceMappingURL=schema.js.map