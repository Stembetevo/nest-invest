import { NextResponse, type NextRequest } from "next/server"
import { safeNextPath } from "@/lib/auth-redirect"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const next = safeNextPath(request.nextUrl.searchParams.get("next"))

  if (code && isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) return NextResponse.redirect(new URL(next, request.url))
    } catch {
      // Fall through to the expired-link message.
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", request.url))
}
