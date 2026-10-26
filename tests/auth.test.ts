import { describe, expect, it } from "vitest"
import { AUTH_MESSAGES, authErrorMessage } from "@/lib/auth-errors"
import { resolveAuthRedirect, safeNextPath } from "@/lib/auth-redirect"

const guest = { isAuthenticated: false, onboardingComplete: false }
const newUser = { isAuthenticated: true, onboardingComplete: false }
const onboarded = { isAuthenticated: true, onboardingComplete: true }

describe("resolveAuthRedirect", () => {
  it("sends guests on signed-in routes to login, keeping where they were going", () => {
    expect(resolveAuthRedirect({ pathname: "/dashboard", ...guest })).toBe("/login?next=%2Fdashboard")
    expect(resolveAuthRedirect({ pathname: "/income", search: "?page=2", ...guest })).toBe(
      "/login?next=%2Fincome%3Fpage%3D2"
    )
    expect(resolveAuthRedirect({ pathname: "/chat", ...guest })).toBe("/login?next=%2Fchat")
    expect(resolveAuthRedirect({ pathname: "/onboarding", ...guest })).toBe("/login?next=%2Fonboarding")
  })

  it("lets guests use auth pages and the public Nest demo", () => {
    for (const pathname of ["/login", "/signup", "/forgot-password", "/reset-password", "/", "/pledge"]) {
      expect(resolveAuthRedirect({ pathname, ...guest })).toBeNull()
    }
  })

  it("does not treat lookalike paths as protected", () => {
    expect(resolveAuthRedirect({ pathname: "/dashboards", ...guest })).toBeNull()
  })

  it("moves signed-in users away from login and sign-up", () => {
    expect(resolveAuthRedirect({ pathname: "/login", ...onboarded })).toBe("/dashboard")
    expect(resolveAuthRedirect({ pathname: "/signup", ...onboarded })).toBe("/dashboard")
    expect(resolveAuthRedirect({ pathname: "/login", ...newUser })).toBe("/onboarding")
  })

  it("keeps users in onboarding until it is complete", () => {
    expect(resolveAuthRedirect({ pathname: "/dashboard", ...newUser })).toBe("/onboarding")
    expect(resolveAuthRedirect({ pathname: "/chat", ...newUser })).toBe("/onboarding")
    expect(resolveAuthRedirect({ pathname: "/onboarding", ...newUser })).toBeNull()
  })

  it("never shows onboarding again once complete", () => {
    expect(resolveAuthRedirect({ pathname: "/onboarding", ...onboarded })).toBe("/dashboard")
    expect(resolveAuthRedirect({ pathname: "/dashboard", ...onboarded })).toBeNull()
  })

  it("lets a signed-in user reach the reset-password page", () => {
    expect(resolveAuthRedirect({ pathname: "/reset-password", ...onboarded })).toBeNull()
  })
})

describe("safeNextPath", () => {
  it("allows same-site paths", () => {
    expect(safeNextPath("/income?x=1")).toBe("/income?x=1")
  })

  it("rejects open redirects", () => {
    expect(safeNextPath("https://evil.example")).toBe("/dashboard")
    expect(safeNextPath("//evil.example")).toBe("/dashboard")
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard")
    expect(safeNextPath(null)).toBe("/dashboard")
  })
})

describe("authErrorMessage", () => {
  it("maps Supabase error codes to plain language", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe(AUTH_MESSAGES.invalidCredentials)
    expect(authErrorMessage({ code: "user_already_exists" })).toBe(AUTH_MESSAGES.emailInUse)
    expect(authErrorMessage({ code: "email_exists" })).toBe(AUTH_MESSAGES.emailInUse)
    expect(authErrorMessage({ code: "weak_password" })).toBe(AUTH_MESSAGES.weakPassword)
  })

  it("detects network failures", () => {
    expect(authErrorMessage({ name: "AuthRetryableFetchError", status: 0 })).toBe(AUTH_MESSAGES.network)
    expect(authErrorMessage(new TypeError("fetch failed"))).toBe(AUTH_MESSAGES.network)
  })

  it("falls back to a generic message", () => {
    expect(authErrorMessage({ code: "something_new" })).toBe(AUTH_MESSAGES.generic)
    expect(authErrorMessage(undefined)).toBe(AUTH_MESSAGES.generic)
  })
})
