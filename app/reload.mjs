import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const adminSb = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await adminSb.rpc('reload_schema'); // if such function exists, otherwise we'll run a direct SQL query
  console.log(error || 'Schema reload attempted');
}
run();
