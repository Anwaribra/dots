import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  supabaseUrl: string
  supabaseKey: string
}

let globalSupabaseClient: SupabaseClient | null = null

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient {
  if (globalSupabaseClient) {
    return globalSupabaseClient
  }

  const url = config?.supabaseUrl || process.env.SUPABASE_URL || ''
  const key = config?.supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''

  if (!url || !key) {
    throw new Error('Supabase client requires valid SUPABASE_URL and SUPABASE_KEY.')
  }

  globalSupabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })

  return globalSupabaseClient
}

export function setSupabaseClient(client: SupabaseClient): void {
  globalSupabaseClient = client
}

export function createDotsServerClient(supabaseUrl: string, supabaseKey: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

