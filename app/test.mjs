import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const sb = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: data3, error: error3 } = await sb.rpc('get_user_quotas', {
    p_user_id: '43342c2f-48d5-4e64-8fb7-226d159e7db3'
  });
  console.log('Quota Error:', error3);
  console.log('Quota:', data3);
}

run();
