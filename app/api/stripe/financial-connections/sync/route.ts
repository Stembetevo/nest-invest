import { NextResponse } from "next/server"
import { requireUser } from "@/lib/creator-data"
import { FinancialConnectionsError, syncBankAccounts } from "@/lib/financial-connections"

export async function POST(request: Request) {
  try {
    const { user } = await requireUser("/dashboard")
    const body = (await request.json().catch(() => ({}))) as { sessionId?: unknown }
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined
    const snapshot = await syncBankAccounts({ id: user.id, email: user.email }, sessionId)
    return NextResponse.json(snapshot)
  } catch (error) {
    console.error("Financial Connections sync failed", error)
    const message =
      error instanceof FinancialConnectionsError
        ? error.message
        : "We couldn’t sync the linked bank accounts."
    const status = error instanceof FinancialConnectionsError ? error.status : 500
    return NextResponse.json({ error: message }, { status })
  }
}
