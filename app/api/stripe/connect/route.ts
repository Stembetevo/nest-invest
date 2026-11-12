import { randomBytes } from "node:crypto"
import { unstable_rethrow } from "next/navigation"
import { NextResponse, type NextRequest } from "next/server"
import { requireUser } from "@/lib/creator-data"
import { getStripeConfig, stripeRedirectUri, stripeSetupMessage } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  const destination = new URL("/dashboard", request.url)
  try {
    await requireUser("/dashboard")
    const config = getStripeConfig()
    if (!config) {
      destination.searchParams.set("stripe_error", "Stripe Connect is not configured.")
      return NextResponse.redirect(destination)
    }

    const state = randomBytes(32).toString("base64url")
    const authorizeUrl = new URL("https://connect.stripe.com/oauth/authorize")
    authorizeUrl.searchParams.set("response_type", "code")
    authorizeUrl.searchParams.set("client_id", config.clientId)
    authorizeUrl.searchParams.set("scope", "read_only")
    authorizeUrl.searchParams.set("state", state)
    authorizeUrl.searchParams.set("redirect_uri", stripeRedirectUri(request.nextUrl.origin))

    const response = NextResponse.redirect(authorizeUrl)
    response.cookies.set("stripe_oauth_state", state, {
      httpOnly: true,
      maxAge: 600,
      path: "/api/stripe/callback",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    return response
  } catch (error) {
    unstable_rethrow(error)
    console.error("Stripe Connect start failed", error)
    destination.searchParams.set("stripe_error", stripeSetupMessage(error))
    return NextResponse.redirect(destination)
  }
}
