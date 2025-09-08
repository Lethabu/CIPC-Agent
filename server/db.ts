import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema.js';

// 1. Centralized Database Configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  max: process.env.DB_MAX_CONNECTIONS ? parseInt(process.env.DB_MAX_CONNECTIONS, 10) : 20,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT ? parseInt(process.env.DB_IDLE_TIMEOUT, 10) : 30000,
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT ? parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) : 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Throw an error if the database URL is not provided
if (!dbConfig.connectionString) {
  throw new Error('DATABASE_URL environment variable is not set. Application cannot start.');
}

// 2. Singleton Pool with Robust Error Handling
const getPool = () => {
  const pool = new Pool(dbConfig);
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // It's critical to handle this to prevent the application from crashing.
    // For example, you might try to reconnect or exit gracefully.
    process.exit(-1);
  });
  return pool;
};

export const pool = getPool();

// 3. Drizzle ORM Instance
// The schema is passed here to make Drizzle aware of the database structure.
export const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' });

// 4. Graceful Shutdown
// This function should be called when the application is shutting down.
export const closeDbConnection = async () => {
  if (pool) {
    console.log('Closing database connection pool...');
    await pool.end();
    console.log('Database connection pool closed.');
  }
};
