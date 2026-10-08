import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { resolveAuthRedirect } from "@/lib/auth-redirect"
import { getSupabaseEnv } from "./env"

function redirectTo(request: NextRequest, target: string, carry?: NextResponse) {
  const response = NextResponse.redirect(new URL(target, request.url))
  carry?.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  return response
}

/** Refreshes the Supabase session cookie and applies the signed-in route rules. */
export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  let response = NextResponse.next({ request })
  const env = getSupabaseEnv()

  if (!env) {
    const target = resolveAuthRedirect({
      pathname,
      search,
      isAuthenticated: false,
      onboardingComplete: false,
    })
    return target ? redirectTo(request, target) : response
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  let userId: string | null = null
  try {
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {
    userId = null
  }

  let onboardingComplete = false
  if (userId) {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", userId)
      .maybeSingle()
    onboardingComplete = Boolean(data?.onboarding_completed_at)
  }

  const target = resolveAuthRedirect({
    pathname,
    search,
    isAuthenticated: Boolean(userId),
    onboardingComplete,
  })
  return target ? redirectTo(request, target, response) : response
}
