import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { ingestFinancialAccount } from "@/lib/financial-connections"
import { platformStripe } from "@/lib/stripe"

export async function POST(request: Request) {
  const stripe = platformStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe webhooks are not configured." }, { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret)
  } catch (error) {
    console.error("Stripe webhook signature failed", error)
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 })
  }

  if (
    event.type === "financial_connections.account.refreshed_balance" ||
    event.type === "financial_connections.account.refreshed_transactions"
  ) {
    const account = event.data.object as Stripe.FinancialConnections.Account
    try {
      await ingestFinancialAccount(account.id, false)
    } catch (error) {
      console.error("Financial Connections webhook ingest failed", error)
      return NextResponse.json({ error: "Could not store the bank refresh." }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
