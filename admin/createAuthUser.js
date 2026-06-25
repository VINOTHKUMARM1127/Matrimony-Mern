import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error("Missing Supabase keys in .env");
  process.exit(1);
}

// 1. Regular client for Sign Up
const supabaseAnon = createClient(supabaseUrl, anonKey);
// 2. Admin client for database override
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
  const email = 'vinomaddy2711@gmail.com';
  const password = 'Nasuvi151127';

  console.log(`Attempting to sign up user: ${email}...`);

  // Try normal sign up
  const { data, error } = await supabaseAnon.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    if (error.message.includes('already registered')) {
       console.log('User already registered in auth.users!');
    } else {
       console.error('Error signing up user:', error.message);
    }
  } else {
    console.log('Successfully signed up auth user!', data?.user?.id);
  }

  // Ensure they are in the admin_users table with superadmin role
  console.log('Upserting admin_users table...');
  const { error: dbError } = await supabaseAdmin
    .from('admin_users')
    .upsert({ email: email, role: 'superadmin' }, { onConflict: 'email' });

  if (dbError) {
    console.error('Error adding to admin_users table:', dbError.message);
  } else {
    console.log('Successfully confirmed user in admin_users table!');
  }
}

createAdmin();
