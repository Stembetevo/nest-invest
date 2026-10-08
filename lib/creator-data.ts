import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  ENTRY_COLUMNS,
  PROFILE_COLUMNS,
  isIncomeSource,
  toIncomeEntry,
  toProfile,
  type IncomeEntry,
  type IncomeSource,
  type Profile,
} from "./income"
import type { IncomeEntryValue } from "./validation"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export class DataLoadError extends Error {
  constructor(what: string, cause?: unknown) {
    super(`We couldn’t load your ${what}. Check your connection and try again.`)
    this.name = "DataLoadError"
    this.cause = cause
  }
}

export async function requireUser(nextPath: string) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  return { supabase, user: data.user }
}

export async function fetchProfile(supabase: SupabaseServerClient, userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle()
  if (error) throw new DataLoadError("profile", error)
  return data ? toProfile(data) : null
}

export async function fetchSources(supabase: SupabaseServerClient): Promise<IncomeSource[]> {
  const { data, error } = await supabase.from("income_sources").select("source").order("created_at")
  if (error) throw new DataLoadError("income sources", error)
  return (data ?? []).map((row) => row.source).filter(isIncomeSource)
}

export async function insertIncomeEntry(
  supabase: SupabaseServerClient,
  userId: string,
  entry: IncomeEntryValue
) {
  return supabase.from("income_entries").insert({
    user_id: userId,
    amount_kes: entry.amountKes,
    source: entry.source,
    received_on: entry.receivedOn,
    note: entry.note,
  })
}

export async function fetchEntries(supabase: SupabaseServerClient, limit?: number): Promise<IncomeEntry[]> {
  let query = supabase
    .from("income_entries")
    .select(ENTRY_COLUMNS)
    .order("received_on", { ascending: false })
    .order("created_at", { ascending: false })
  if (limit) query = query.limit(limit)
  const { data, error } = await query
  if (error) throw new DataLoadError("income", error)
  return (data ?? []).map(toIncomeEntry)
}
