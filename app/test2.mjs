import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const sb = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await sb.rpc('get_recommended_profiles', {
    p_user_id: '43342c2f-48d5-4e64-8fb7-226d159e7db3',
    p_limit: 10
  });
  console.log('Error:', error);
  console.log('Data:', data?.length);
}

run();
