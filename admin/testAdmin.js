import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const email = 'vinomaddy2711@gmail.com';
  
  // Check admin_users
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email);
    
  console.log('Admin Users:', data, error);
  
  // Check auth users via login attempt
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: 'Nasuvi151127'
  });
  
  console.log('Auth login:', authData.user ? 'Success' : 'Failed', authError);
}

check();
