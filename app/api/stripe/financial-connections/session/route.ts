import { NextResponse } from "next/server"
import { requireUser } from "@/lib/creator-data"
import {
  createBankLinkSession,
  FinancialConnectionsError,
} from "@/lib/financial-connections"

export async function POST() {
  try {
    const { user } = await requireUser("/dashboard")
    const session = await createBankLinkSession({ id: user.id, email: user.email })
    return NextResponse.json(session)
  } catch (error) {
    console.error("Financial Connections session failed", error)
    const message =
      error instanceof FinancialConnectionsError
        ? error.message
        : "We couldn’t start the bank link."
    const status = error instanceof FinancialConnectionsError ? error.status : 500
    return NextResponse.json({ error: message }, { status })
  }
}
