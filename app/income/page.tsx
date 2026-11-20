<<<<<<< HEAD
import type { Metadata } from "next"
import { IncomeView } from "@/components/income/income-view"
import { fetchEntries, requireUser } from "@/lib/creator-data"
import { nairobiTodayIso } from "@/lib/dates"

export const metadata: Metadata = { title: "All income — Manikka" }

export default async function IncomePage() {
  const { supabase } = await requireUser("/income")
  const entries = await fetchEntries(supabase)
  return <IncomeView entries={entries} today={nairobiTodayIso()} />
=======
import { redirect } from "next/navigation"

export default function IncomePage() {
  redirect("/dashboard")
>>>>>>> 60312ee4137d9795bcbd5d6d2105e910b070e91f
}
