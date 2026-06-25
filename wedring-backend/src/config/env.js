/**
 * Wedring Backend — Centralised Environment Validation
 * Validates all required env vars at startup using Zod.
 * Fail-fast if anything is missing.
 */
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().default('matimony'),
  R2_PUBLIC_DOMAIN: z.string().default(''),

  // Firebase (optional — push notifications degrade gracefully)
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional().default(''),

  // App
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // Cron
  DAILY_DISTRIBUTION_CRON: z.string().default('0 0 * * *'),
  MEMBERSHIP_CHECK_CRON: z.string().default('0 * * * *'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;
export default env;
