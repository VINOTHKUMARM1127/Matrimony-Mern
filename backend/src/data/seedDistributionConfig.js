/**
 * Wedring Backend — Seed Distribution Config
 * Run this once to populate the distribution_config table.
 */
import { supabaseAdmin } from '../config/supabase.js';

const seedData = [
  { tier: 'free', initial_count: 5, daily_count: 2 },
  { tier: 'silver', initial_count: 50, daily_count: 5 },
  { tier: 'gold', initial_count: 100, daily_count: 10 },
  { tier: 'platinum', initial_count: 200, daily_count: 20 },
];

async function seed() {
  console.log('Seeding distribution_config...');
  for (const data of seedData) {
    const { error } = await supabaseAdmin
      .from('distribution_config')
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'tier' });
    if (error) {
      console.error(`Failed to seed ${data.tier}:`, error.message);
    } else {
      console.log(`Seeded ${data.tier} tier.`);
    }
  }
  console.log('Seeding complete.');
  process.exit(0);
}

seed();
