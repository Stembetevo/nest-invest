import { NextResponse } from "next/server"
import { requireUser } from "@/lib/creator-data"
import { FinancialConnectionsError, loadBankSnapshot } from "@/lib/financial-connections"

export async function GET() {
  try {
    const { user } = await requireUser("/dashboard")
    return NextResponse.json(await loadBankSnapshot(user.id))
  } catch (error) {
    console.error("Financial Connections lookup failed", error)
    const message =
      error instanceof FinancialConnectionsError
        ? error.message
        : "We couldn’t load the linked bank accounts."
    const status = error instanceof FinancialConnectionsError ? error.status : 500
    return NextResponse.json({ error: message }, { status })
  }
}
