import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema.js';

const createMockDb = (): PostgresJsDatabase<typeof schema> => {
  const mockData: { [key: string]: any[] } = {
    users: [],
    paygTransactions: [],
    partners: [],
    partnerReferrals: [],
  };

  const mockDb: any = {
    _data: mockData,
    _helpers: {
        getTable: (table: any) => {
            const tableName = table.getName();
            if (!mockData[tableName]) mockData[tableName] = [];
            return mockData[tableName];
        },
        insert: (table: any, data: any[]) => {
            const tableData = mockDb._helpers.getTable(table);
            const newRecords = data.map(d => ({ id: `mock-${Math.random().toString(36).substring(2, 9)}`, createdAt: new Date(), ...d }));
            tableData.push(...newRecords);
            return newRecords;
        },
        select: (table: any, conditions?: (item: any) => boolean) => {
            let tableData = mockDb._helpers.getTable(table);
            return conditions ? tableData.filter(conditions) : [...tableData];
        }
    },
    select: function(fields: any) {
      return this.query(fields);
    },
    query: (fields: any) => ({
      from: (table: any) => {
        const chain = {
          _table: table,
          _conditions: (item: any) => true,
          _limit: null as number | null,
          _orderBy: [] as any[],
          where: function(conditions: any) {
            // This is a super simplified mock and does not parse drizzle conditions
            // It will just return all for now
            return this;
          },
          limit: function(count: number) {
            this._limit = count;
            return this;
          },
          orderBy: function(...args: any[]) {
            this._orderBy = args;
            return this;
          },
          leftJoin: function() { return this; }, // Mock join
          then: function(resolve: (value: any) => void) {
             let results = mockDb._helpers.select(this._table, this._conditions);
             if (this._limit !== null) {
                 results = results.slice(0, this._limit);
             }
             resolve(results);
          },
          execute: function() {
              return new Promise(resolve => this.then(resolve));
          }
        };
        return chain;
      }
    }),
    insert: (table: any) => ({
      values: (data: any) => ({
        returning: () => Promise.resolve(mockDb._helpers.insert(table, Array.isArray(data) ? data : [data])),
        execute: () => Promise.resolve(mockDb._helpers.insert(table, Array.isArray(data) ? data : [data])),
      }),
    }),
    update: (table: any) => ({
      set: (data: any) => ({
        where: (conditions: any) => ({
          returning: () => {
            // Mock update - in a real scenario, you'd apply conditions
            const tableData = mockDb._helpers.getTable(table);
            if (tableData.length > 0) {
                const updated = { ...tableData[0], ...data };
                tableData[0] = updated;
                return Promise.resolve([updated]);
            }
            return Promise.resolve([]);
          },
          execute: () => Promise.resolve(),
        }),
      }),
    }),
    delete: (table: any) => ({
      where: (conditions: any) => ({
          execute: () => Promise.resolve(), // Mock delete
      })
    }),
  };

  return new Proxy(mockDb, {
      get(target, prop, receiver) {
          if (prop in target) {
              return Reflect.get(target, prop, receiver);
          }
          // Fallback for db.query.users, etc.
          if (prop === 'query' || schema.hasOwnProperty(prop as string)) {
              return target.query();
          }
          return Reflect.get(target, prop, receiver);
      }
  }) as unknown as PostgresJsDatabase<typeof schema>;
};


const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && process.env.SPRINT_MODE !== 'true') {
  throw new Error('DATABASE_URL is not set. Please provide a database connection string.');
}

const client = process.env.SPRINT_MODE === 'true' ? postgres({}) : postgres(DATABASE_URL!, { prepare: false });

export const db: PostgresJsDatabase<typeof schema> = process.env.SPRINT_MODE === 'true'
  ? createMockDb()
  : drizzle(client, { schema });


export async function checkDatabaseHealth() {
    try {
        if (process.env.SPRINT_MODE === 'true') {
            return { healthy: true, message: 'Mock DB is active' };
        }
        await db.select({id: schema.users.id}).from(schema.users).limit(1);
        return { healthy: true };
    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error('Unknown database error');
        return { healthy: false, error: error.message };
    }
}

export async function closeDatabaseConnection() {
  if (process.env.SPRINT_MODE !== 'true') {
      await client.end();
  }
}
