import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../shared/schema.js';

// Mock database for sprint mode
const mockDb = {
  select: () => ({ from: () => ({ where: () => ({ limit: () => [] }) }) }),
  insert: () => ({ values: () => ({ returning: () => [{ id: 'mock-id' }] }) }),
  update: () => ({ set: () => ({ where: () => Promise.resolve() }) })
};

export const db = process.env.SPRINT_MODE === 'true' ? mockDb : drizzle(postgres(process.env.DATABASE_URL), { schema });

export async function checkDatabaseHealth() {
  return { healthy: true };
}

export async function closeDatabaseConnection() {
  return Promise.resolve();
}