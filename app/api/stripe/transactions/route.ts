import { NextResponse } from "next/server"
import { requireUser } from "@/lib/creator-data"
import { fetchStripeTransactions } from "@/lib/stripe-data"

export async function GET(request: Request) {
  try {
    const { user } = await requireUser("/dashboard")
    const value = Number(new URL(request.url).searchParams.get("limit") ?? 50)
    const limit = Number.isFinite(value) ? Math.min(100, Math.max(1, Math.floor(value))) : 50
    return NextResponse.json({ data: await fetchStripeTransactions(user.id, limit) })
  } catch (error) {
    console.error("Stripe transaction history lookup failed", error)
    return NextResponse.json(
      { error: "We couldn’t load Stripe transaction history." },
      { status: 500 }
    )
  }
}
