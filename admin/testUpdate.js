import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      apikey: supabaseServiceKey
    }
  }
});

async function test() {
  const { data, error } = await supabase.rpc('get_all_user_emails');
  // Or just query the DB directly if we can't use RPC for schema
  // We can't query information_schema from REST API usually, but let's select a single profile to see its keys
  const { data: p } = await supabase.from('profiles').select('*').limit(1);
  if (p && p.length > 0) {
    console.log('Profile columns:', Object.keys(p[0]));
  }
}
test();
