import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the connection
const client = postgres(process.env.DATABASE_URL, {
  max: 1, // Maximum number of connections in the pool
  ssl: 'require', // Required for Supabase
});

// Create the drizzle database instance
export const db = drizzle(client, { schema });