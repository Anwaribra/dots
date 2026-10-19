import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xpqkiourfuvasxkogtyb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcWtpb3VyZnV2YXN4a29ndHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MjQ5MjUsImV4cCI6MjEwODAwMDkyNX0.1daNXZOA65vhXZXP8f8a6eE8I5GBrkBUiygfRjgCWo8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
