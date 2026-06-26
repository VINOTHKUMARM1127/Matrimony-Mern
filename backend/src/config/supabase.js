/**
 * Wedring Backend — Supabase Client Configuration
 *
 * Two clients:
 *  - supabaseAnon  → for user-context operations (respects RLS)
 *  - supabaseAdmin → service_role key, bypasses RLS (server-side only)
 */
import { createClient } from '@supabase/supabase-js';
import env from './env.js';

export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export default { supabaseAnon, supabaseAdmin };
