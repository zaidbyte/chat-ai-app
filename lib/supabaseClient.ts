// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseUrl = 'https://ioqnwoqqnvgnytpaskkd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvcW53b3FxbnZnbnl0cGFza2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODc3NzcsImV4cCI6MjA4ODA2Mzc3N30.rOMqMDWa8vnba2X7Prt-dEbf_1JjrveaVsSmCDtF6JY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
