import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

loadEnv({ path: resolve(__dirname, '.env') });
loadEnv({ path: resolve(__dirname, '.env.local'), override: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
