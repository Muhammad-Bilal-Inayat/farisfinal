import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';

// We use a local file for the database. 
// In a real Hostinger deployment you can provide a DB URL (e.g. turso or remote sqlite)
// But for this environment and easy deployment, a local sqlite file is great.
const client = createClient({
  url: 'file:local.db',
});

export const db = drizzle(client, { schema });
