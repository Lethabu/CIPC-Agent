import { 
  users, companies, documents, agentActivities, cipcFilings, complianceAlerts, beneficialOwnershipFilings,
  type User, type InsertUser, type Company, type InsertCompany, 
  type Document, type InsertDocument, type AgentActivity, type InsertAgentActivity,
  type CipcFiling, type InsertCipcFiling, type ComplianceAlert, type InsertComplianceAlert,
  type BeneficialOwnershipFiling, type InsertBeneficialOwnershipFiling
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(insertCompany: InsertCompany): Promise<Company>;
  
  // Document operations
  createDocument(insertDocument: InsertDocument): Promise<Document>;
  
  // Agent activity operations
  getAgentActivities(companyId: string): Promise<AgentActivity[]>;
  createAgentActivity(insertActivity: InsertAgentActivity): Promise<AgentActivity>;
  
  // CIPC filing operations
  getCipcFiling(id: string): Promise<CipcFiling | undefined>;
  createCipcFiling(insertFiling: InsertCipcFiling): Promise<CipcFiling>;
  
  // Compliance alert operations
  getComplianceAlerts(companyId: string): Promise<ComplianceAlert[]>;
  createComplianceAlert(insertAlert: InsertComplianceAlert): Promise<ComplianceAlert>;
  
  // Beneficial ownership operations
  getBeneficialOwnershipFiling(companyId: string): Promise<BeneficialOwnershipFiling | undefined>;
  createBeneficialOwnershipFiling(insertFiling: InsertBeneficialOwnershipFiling): Promise<BeneficialOwnershipFiling>;
  updateBeneficialOwnershipFiling(id: string, updates: Partial<InsertBeneficialOwnershipFiling>): Promise<BeneficialOwnershipFiling>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async getAgentActivities(companyId: string): Promise<AgentActivity[]> {
    return await db
      .select()
      .from(agentActivities)
      .where(eq(agentActivities.companyId, companyId));
  }

  async createAgentActivity(insertActivity: InsertAgentActivity): Promise<AgentActivity> {
    const [activity] = await db
      .insert(agentActivities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async getCipcFiling(id: string): Promise<CipcFiling | undefined> {
    const [filing] = await db.select().from(cipcFilings).where(eq(cipcFilings.id, id));
    return filing || undefined;
  }

  async createCipcFiling(insertFiling: InsertCipcFiling): Promise<CipcFiling> {
    const [filing] = await db
      .insert(cipcFilings)
      .values(insertFiling)
      .returning();
    return filing;
  }

  async getComplianceAlerts(companyId: string): Promise<ComplianceAlert[]> {
    return await db
      .select()
      .from(complianceAlerts)
      .where(eq(complianceAlerts.companyId, companyId));
  }

  async createComplianceAlert(insertAlert: InsertComplianceAlert): Promise<ComplianceAlert> {
    const [alert] = await db
      .insert(complianceAlerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async getBeneficialOwnershipFiling(companyId: string): Promise<BeneficialOwnershipFiling | undefined> {
    const [filing] = await db
      .select()
      .from(beneficialOwnershipFilings)
      .where(eq(beneficialOwnershipFilings.companyId, companyId));
    return filing || undefined;
  }

  async createBeneficialOwnershipFiling(insertFiling: InsertBeneficialOwnershipFiling): Promise<BeneficialOwnershipFiling> {
    const [filing] = await db
      .insert(beneficialOwnershipFilings)
      .values(insertFiling)
      .returning();
    return filing;
  }

  async updateBeneficialOwnershipFiling(id: string, updates: Partial<InsertBeneficialOwnershipFiling>): Promise<BeneficialOwnershipFiling> {
    const [filing] = await db
      .update(beneficialOwnershipFilings)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(beneficialOwnershipFilings.id, id))
      .returning();
    return filing;
  }
}

export const storage = new DatabaseStorage();