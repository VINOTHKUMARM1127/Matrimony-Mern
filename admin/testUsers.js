import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log('Testing listUsers...');
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log(`Successfully fetched ${data.users.length} users from auth.users`);
    console.log('First user:', data.users[0]?.email);
  }
}

test();
