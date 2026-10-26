const SIGNED_IN_ROUTES = ["/dashboard", "/income", "/chat", "/onboarding"]
const ONBOARDED_ROUTES = ["/dashboard", "/income", "/chat"]
const GUEST_ROUTES = ["/login", "/signup", "/forgot-password"]

export const DEFAULT_SIGNED_IN_PATH = "/dashboard"

function matches(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function isSignedInRoute(pathname: string) {
  return matches(pathname, SIGNED_IN_ROUTES)
}

export type AuthRedirectInput = {
  pathname: string
  search?: string
  isAuthenticated: boolean
  onboardingComplete: boolean
}

/** Returns the path to redirect to, or null to let the request through. */
export function resolveAuthRedirect({
  pathname,
  search = "",
  isAuthenticated,
  onboardingComplete,
}: AuthRedirectInput): string | null {
  if (!isAuthenticated) {
    if (matches(pathname, SIGNED_IN_ROUTES)) {
      return `/login?next=${encodeURIComponent(pathname + search)}`
    }
    return null
  }

  const home = onboardingComplete ? DEFAULT_SIGNED_IN_PATH : "/onboarding"
  if (matches(pathname, GUEST_ROUTES)) return home
  if (!onboardingComplete && matches(pathname, ONBOARDED_ROUTES)) return "/onboarding"
  if (onboardingComplete && matches(pathname, ["/onboarding"])) return DEFAULT_SIGNED_IN_PATH
  return null
}

/** Only allow same-origin relative paths so `?next=` cannot become an open redirect. */
export function safeNextPath(next: unknown, fallback = DEFAULT_SIGNED_IN_PATH) {
  if (typeof next !== "string") return fallback
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback
  return next
}
