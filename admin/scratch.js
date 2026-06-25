import { createClient } from '@supabase/supabase-js';

// Load env from admin folder
import dotenv from 'dotenv';
dotenv.config({ path: './admin/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('admin_settings').select('*');
  console.log('admin_settings:', JSON.stringify(data, null, 2));
}

check();
