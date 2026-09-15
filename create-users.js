/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createUsers() {
  const users = [
    { email: 'jade@localfinance.app', password: '25122025' },
    { email: 'victor@localfinance.app', password: '25122025' }
  ];

  for (const u of users) {
    const { error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
    });
    
    if (error) {
      console.error(`Error creating ${u.email}:`, error.message);
    } else {
      console.log(`Successfully created ${u.email}`);
    }
  }
}

createUsers();
