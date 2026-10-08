export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export function isSupabaseConfigured() {
  return getSupabaseEnv() !== null
}

export const SUPABASE_NOT_CONFIGURED =
  "Sign-in isn’t set up on this server yet. Add the Supabase keys from .env.example and restart."
