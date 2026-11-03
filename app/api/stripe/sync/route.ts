import { NextResponse } from "next/server"
import { requireUser } from "@/lib/creator-data"
import { syncStripeTransactions } from "@/lib/stripe-data"

export async function POST(request: Request) {
  try {
    const { user } = await requireUser("/dashboard")
    const body = (await request.json().catch(() => ({}))) as { months?: unknown }
    const months =
      typeof body.months === "number" && Number.isFinite(body.months)
        ? Math.min(24, Math.max(1, Math.floor(body.months)))
        : 6
    const result = await syncStripeTransactions(user.id, months)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Stripe transaction sync failed", error)
    return NextResponse.json({ error: "We couldn’t sync Stripe transactions." }, { status: 500 })
  }
}
