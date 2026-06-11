import { drizzle } from 'drizzle-orm/node-mssql';
import * as schema from './schema';

// Export the Drizzle client initialized with local MSSQL server
export const db = drizzle(process.env.DATABASE_URL!, { schema });