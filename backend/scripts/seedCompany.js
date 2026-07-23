import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load the environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Fail fast if the variables are undefined
if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing Supabase credentials. Check your .env file and variable names.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedUser() {
  console.log("Seeding company...");
  
  const { data, error } = await supabase.auth.signUp({
    email: 'testcompany@logistics.com',
    password: 'securepassword123',
    options: {
      data: {
        role: 'company',
        name: 'TrackBridge Express'
      }
    }
  });

  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Success! Check your public.companies table. ID:", data.user.id);
  }
}

seedUser();