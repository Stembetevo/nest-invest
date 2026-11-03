import { NextResponse } from "next/server"
import { requireUser } from "@/lib/creator-data"
import { stripeConnectionStatus } from "@/lib/stripe-data"

export async function GET() {
  try {
    const { user } = await requireUser("/dashboard")
    return NextResponse.json(await stripeConnectionStatus(user.id))
  } catch (error) {
    console.error("Stripe status lookup failed", error)
    return NextResponse.json({ error: "We couldn’t check the Stripe connection." }, { status: 500 })
  }
}
