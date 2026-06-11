import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

import { config } from 'dotenv';
config({ path: '.env.local' });

export default defineConfig({
  out: './drizzle',
  schema: './src/lib/db/schema.ts',
  dialect: 'mssql' as any,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});