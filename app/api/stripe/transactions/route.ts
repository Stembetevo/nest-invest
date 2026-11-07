import { NextResponse } from "next/server"
import { requireUser } from "@/lib/creator-data"
import { fetchStripeTransactionHistory } from "@/lib/stripe-data"

export async function GET(request: Request) {
  try {
    const { user } = await requireUser("/dashboard")
    const params = new URL(request.url).searchParams
    const value = Number(params.get("limit") ?? 50)
    const limit = Number.isFinite(value) ? Math.min(100, Math.max(1, Math.floor(value))) : 50
    const from = params.get("from") || undefined
    const to = params.get("to") || undefined
    const isoDate = /^\d{4}-\d{2}-\d{2}$/
    if ((from && !isoDate.test(from)) || (to && !isoDate.test(to))) {
      return NextResponse.json({ error: "Dates must use YYYY-MM-DD format." }, { status: 400 })
    }
    if (from && to && from > to) {
      return NextResponse.json({ error: "The start date must be before the end date." }, { status: 400 })
    }

    const result = await fetchStripeTransactionHistory(user.id, { limit, from, to })
    return NextResponse.json({ data: result.transactions, summary: result.summary })
  } catch (error) {
    console.error("Stripe transaction history lookup failed", error)
    return NextResponse.json(
      { error: "We couldn’t load Stripe transaction history." },
      { status: 500 }
    )
  }
}
