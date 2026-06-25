import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing connection to', supabaseUrl);
  
  // Test profiles
  const { data: pData, error: pError } = await supabase.from('profiles').select('id').limit(1);
  console.log('Profiles table:', pError ? pError.message : 'OK (found ' + pData.length + ' rows)');
  
  // Test admin_users
  const { data: aData, error: aError } = await supabase.from('admin_users').select('role').limit(1);
  console.log('Admin_users table:', aError ? aError.message : 'OK (found ' + aData.length + ' rows)');
}

test();
