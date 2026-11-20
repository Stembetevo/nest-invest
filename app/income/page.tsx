import type { Metadata } from "next"
import { IncomeView } from "@/components/income/income-view"
import { fetchEntries, requireUser } from "@/lib/creator-data"
import { nairobiTodayIso } from "@/lib/dates"

export const metadata: Metadata = { title: "All income — Manikka" }

export default async function IncomePage() {
  const { supabase } = await requireUser("/income")
  const entries = await fetchEntries(supabase)
  return <IncomeView entries={entries} today={nairobiTodayIso()} />
}
