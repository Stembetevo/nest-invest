import { NextResponse, type NextRequest } from "next/server"
import { resolveAuthRedirect, safeNextPath } from "@/lib/auth-redirect"
import { fetchProfile } from "@/lib/creator-data"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("error")) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url))
  }

  const code = request.nextUrl.searchParams.get("code")
  const next = safeNextPath(request.nextUrl.searchParams.get("next"))

  if (code && isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        let destination = next
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          try {
            const profile = await fetchProfile(supabase, data.user.id)
            const url = new URL(destination, "http://local")
            destination =
              resolveAuthRedirect({
                pathname: url.pathname,
                search: url.search,
                isAuthenticated: true,
                onboardingComplete: Boolean(profile?.onboardingCompletedAt),
              }) ?? destination
          } catch {
            // A profile read failure should not undo a successful sign-in.
          }
        }
        return NextResponse.redirect(new URL(destination, request.url))
      }
    } catch {
      // Fall through to the expired-link message.
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", request.url))
}
