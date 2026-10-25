import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * The Supabase client.
 *
 * If the environment variables are missing or malformed, createClient throws
 * at module load and React never mounts, so the whole site becomes a blank
 * white page. That has bitten this project once already. Instead we point at
 * a harmless placeholder, shout in the console, and let every page render.
 * Product lists come back empty and orders fail with a clear message, which
 * is a bad day rather than a dead site.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anonKey && /^https?:\/\//.test(url))

if (!supabaseConfigured) {
  console.error(
    '[Safehouse] Supabase is not configured. Set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY in your .env file and in the Vercel project ' +
      'settings, then redeploy. The site will run, but nothing will load.'
  )
}

export const supabase: SupabaseClient = createClient(
  supabaseConfigured ? (url as string) : 'https://placeholder.supabase.co',
  supabaseConfigured ? (anonKey as string) : 'placeholder-anon-key'
)
