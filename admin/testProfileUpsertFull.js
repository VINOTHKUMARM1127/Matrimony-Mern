import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: user } = await supabase.from('profiles').select('*').limit(1).single();
  if (!user) return console.log("No user found");
  
  const profileDbFields = {
    ...user,
    is_profile_complete: true,
    profile_completion_percent: 100,
  };
  
  console.log("Upserting with all fields");
  
  const { data, error } = await supabase.from('profiles').upsert(profileDbFields, { onConflict: 'id' }).select();
  
  if (error) {
    console.error("Error upserting:", error);
  } else {
    console.log("Success:", data[0].is_profile_complete);
  }
}
test();
