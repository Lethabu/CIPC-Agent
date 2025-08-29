import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phoneNumber: varchar("phone_number"),
  whatsappNumber: varchar("whatsapp_number").unique(), // Added for WhatsApp integration
  companyName: varchar("company_name"),
  registrationNumber: varchar("registration_number"),
  subscriptionPlan: varchar("subscription_plan").default("free"),
  paygFilingCount: integer("payg_filing_count").default(0).notNull(), // Added for PAYG tracking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  registrationNumber: varchar("registration_number").notNull().unique(),
  complianceStatus: varchar("compliance_status").default("pending"),
  nextFilingDate: timestamp("next_filing_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(),
  filePath: varchar("file_path").notNull(),
  documentType: varchar("document_type").notNull(), // 'id_document', 'financials', 'certificate', etc.
  processedData: jsonb("processed_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agent activities table
export const agentActivities = pgTable("agent_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  agentName: varchar("agent_name").notNull(),
  activityType: varchar("activity_type").notNull(),
  status: varchar("status").notNull(), // 'pending', 'completed', 'failed'
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// CIPC filings table
export const cipcFilings = pgTable("cipc_filings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  filingType: varchar("filing_type").notNull(), // 'annual_return', 'cor_14_1', 'bbee_certificate', 'beneficial_ownership'
  status: varchar("status").notNull(),
  submittedAt: timestamp("submitted_at"),
  cipcReference: varchar("cipc_reference"),
  amount: integer("amount"), // in cents
  submissionData: jsonb("submission_data"), // The form data being submitted
  agentId: varchar("agent_id"), // Which agent handled this
  createdAt: timestamp("created_at").defaultNow(),
});

// Beneficial ownership filings table for COR46 forms
export const beneficialOwnershipFilings = pgTable("beneficial_ownership_filings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  cipcFilingId: varchar("cipc_filing_id").references(() => cipcFilings.id),
  beneficialOwners: jsonb("beneficial_owners").notNull(), // Array of beneficial owner details
  significantControl: jsonb("significant_control"), // Details of significant control
  complianceStatus: varchar("compliance_status").default("pending"), // pending, compliant, non_compliant
  nextDueDate: timestamp("next_due_date"), // When next filing is due
  remindersSent: integer("reminders_sent").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Compliance alerts table
export const complianceAlerts = pgTable("compliance_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  alertType: varchar("alert_type").notNull(),
  message: text("message").notNull(),
  dueDate: timestamp("due_date"),
  isRead: boolean("is_read").default(false),
  sentViaWhatsApp: boolean("sent_via_whatsapp").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// New tables
export const beneficialOwners = pgTable('beneficial_owners', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  regNo: text('reg_no').notNull(),
  name: text('name').notNull(),
  idNum: text('id_num').notNull(),
  pct: numeric('pct').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// POPIA-compliant consent logging table
export const consentLogs = pgTable("consent_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Link to the user who gave consent
  subjectPhone: varchar("subject_phone").notNull(),
  subjectEntity: varchar("subject_entity"), // e.g., company registration number
  purpose: varchar("purpose").notNull(), // e.g., "onboarding", "bo_filing__whatsapp"
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  grantedVia: varchar("granted_via").notNull(), // e.g., "WhatsApp-AiSensy"
  meta: jsonb("meta"), // Store metadata like IP address, user agent, flow ID
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertAgentActivitySchema = createInsertSchema(agentActivities).omit({
  id: true,
  createdAt: true,
});

export const insertCipcFilingSchema = createInsertSchema(cipcFilings).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceAlertSchema = createInsertSchema(complianceAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertBeneficialOwnershipFilingSchema = createInsertSchema(beneficialOwnershipFilings).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type AgentActivity = typeof agentActivities.$inferSelect;
export type InsertAgentActivity = z.infer<typeof insertAgentActivitySchema>;

export type CipcFiling = typeof cipcFilings.$inferSelect;
export type InsertCipcFiling = z.infer<typeof insertCipcFilingSchema>;

export type ComplianceAlert = typeof complianceAlerts.$inferSelect;
export type InsertComplianceAlert = z.infer<typeof insertComplianceAlertSchema>;

export type BeneficialOwnershipFiling = typeof beneficialOwnershipFilings.$inferSelect;
export type InsertBeneficialOwnershipFiling = z.infer<typeof insertBeneficialOwnershipFilingSchema>;

export const insertConsentLogSchema = createInsertSchema(consentLogs).omit({
  id: true,
  grantedAt: true,
});

export type ConsentLog = typeof consentLogs.$inferSelect;
export type InsertConsentLog = z.infer<typeof insertConsentLogSchema>;