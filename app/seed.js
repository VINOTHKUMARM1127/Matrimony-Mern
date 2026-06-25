const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  'https://pcdtgwelrwyvtqixqufc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZHRnd2Vscnd5dnRxaXhxdWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ5OTUzMSwiZXhwIjoyMDk1MDc1NTMxfQ.W4JVrp4n3reXtLvd3rqQ3fTwjbYONFnlIvhL96gVsOA',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const firstNamesMale = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Siddharth', 'Rahul', 'Vikram', 'Surya', 'Karthik', 'Praveen', 'Sanjay'];
const firstNamesFemale = ['Diya', 'Ananya', 'Aadhya', 'Priya', 'Kavya', 'Sneha', 'Neha', 'Divya', 'Swati', 'Pooja', 'Shruti', 'Anjali'];
const lastNames = ['Kumar', 'Sharma', 'Singh', 'Rao', 'Iyer', 'Nair', 'Reddy', 'Patel', 'Krishnan', 'Pillai', 'Rajan', 'Menon'];
const religions = ['Hindu', 'Christian', 'Muslim', 'Jain', 'Sikh'];
const castes = ['Brahmin', 'Chettiar', 'Gounder', 'Nadar', 'Thevar', 'Vanniyar', 'Mudaliar', 'Naidu'];
const educations = ['B.E', 'B.Tech', 'B.Sc', 'M.Sc', 'MBA', 'B.Com', 'M.Com', 'MBBS', 'Ph.D', 'Diploma'];
const occupations = ['Software Engineer', 'Doctor', 'Teacher', 'Business', 'Banker', 'Engineer', 'Government Service'];
const cities = ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Bangalore', 'Hyderabad'];
const maritalStatuses = ['never_married', 'divorced', 'widowed', 'awaiting_divorce'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedProfiles(count) {
  console.log(`Generating ${count} users and profiles...`);
  
  const batchSize = 20; // 20 concurrent creations to avoid overwhelming the DB
  for (let i = 0; i < count; i += batchSize) {
    const promises = [];
    const currentBatchSize = Math.min(batchSize, count - i);
    
    for (let j = 0; j < currentBatchSize; j++) {
      promises.push((async () => {
        const isMale = Math.random() > 0.5;
        const gender = isMale ? 'male' : 'female';
        const firstName = isMale ? randomItem(firstNamesMale) : randomItem(firstNamesFemale);
        const lastName = randomItem(lastNames);
        const email = `seed_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
        
        // 1. Create Auth User
        const { data: userData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: 'Password123!',
          email_confirm: true,
          user_metadata: { display_name: `${firstName} ${lastName}` }
        });
        
        if (authError) {
          console.error('Failed to create user:', authError.message);
          return;
        }

        const userId = userData.user.id;
        
        // 2. Wait for trigger to create the profile row
        await new Promise(r => setTimeout(r, 500));
        
        // 3. Update the automatically created profile
        const dob = randomDate(new Date(1980, 0, 1), new Date(2002, 11, 31)).toISOString().split('T')[0];
        const height = Math.floor(Math.random() * (190 - 150 + 1)) + 150;
        const profileId = 'TM' + Math.floor(100000 + Math.random() * 900000);

        const profileUpdates = {
          profile_id: profileId,
          display_name: `${firstName} ${lastName}`,
          gender: gender,
          date_of_birth: dob,
          height_cm: height,
          marital_status: randomItem(maritalStatuses),
          religion: randomItem(religions),
          caste: randomItem(castes),
          mother_tongue: 'Tamil',
          education: randomItem(educations),
          occupation: randomItem(occupations),
          city: randomItem(cities),
          state: 'Tamil Nadu',
          country: 'India',
          is_active: true,
          is_verified: Math.random() > 0.5,
          is_premium: Math.random() > 0.8,
          last_active_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (updateError) {
          console.error(`Failed to update profile for ${userId}:`, updateError.message);
        }
      })());
    }
    
    await Promise.all(promises);
    console.log(`Progress: ${i + currentBatchSize}/${count} created...`);
  }
  
  console.log('Seed completed successfully!');
}

// Set this to 1000 to seed 1000 profiles.
seedProfiles(1000);
