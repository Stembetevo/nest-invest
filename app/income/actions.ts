"use server"

import { revalidatePath } from "next/cache"
import { unstable_rethrow } from "next/navigation"
import { insertIncomeEntry, requireUser } from "@/lib/creator-data"
import { nairobiTodayIso } from "@/lib/dates"
import { parseIncomeEntry } from "@/lib/validation"

export type AddIncomeState = {
  ok?: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export async function addIncomeEntry(
  _prev: AddIncomeState,
  formData: FormData
): Promise<AddIncomeState> {
  const parsed = parseIncomeEntry(
    {
      amount: text(formData, "amount"),
      source: text(formData, "source"),
      receivedOn: text(formData, "receivedOn"),
      note: text(formData, "note"),
    },
    nairobiTodayIso()
  )
  if (!parsed.ok) return { fieldErrors: parsed.errors }

  try {
    const { supabase, user } = await requireUser("/income")
    const { error } = await insertIncomeEntry(supabase, user.id, parsed.value)
    if (error) return { error: "We couldn’t save that income. Check your connection and try again." }
  } catch (error) {
    unstable_rethrow(error)
    return { error: "We couldn’t save that income. Check your connection and try again." }
  }

  revalidatePath("/income")
  revalidatePath("/dashboard")
  return { ok: true }
}
