import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  phone: text('phone').unique().notNull(),
  consentGiven: boolean('consent_given').default(false),
  consentDate: timestamp('consent_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});