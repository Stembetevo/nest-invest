import { timingSafeEqual } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { requireUser } from "@/lib/creator-data"
import { getStripeConfig, stripeRedirectUri } from "@/lib/stripe"
import { saveStripeConnection } from "@/lib/stripe-data"

export async function GET(request: NextRequest) {
  const destination = new URL("/dashboard", request.url)
  const errorRedirect = (message: string) => {
    destination.searchParams.set("stripe_error", message)
    return NextResponse.redirect(destination)
  }

  const config = getStripeConfig()
  if (!config) return errorRedirect("Stripe is not configured.")

  const state = request.nextUrl.searchParams.get("state")
  const savedState = request.cookies.get("stripe_oauth_state")?.value
  if (
    !state ||
    !savedState ||
    state.length !== savedState.length ||
    !timingSafeEqual(
      new TextEncoder().encode(state),
      new TextEncoder().encode(savedState)
    )
  ) {
    return errorRedirect("The Stripe connection request expired. Please try again.")
  }

  const code = request.nextUrl.searchParams.get("code")
  if (!code) return errorRedirect("Stripe did not return an authorization code.")

  try {
    const { user } = await requireUser("/dashboard")
    const response = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_secret: config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: stripeRedirectUri(request.nextUrl.origin),
      }),
    })
    const payload = (await response.json()) as {
      stripe_user_id?: string
      access_token?: string
      livemode?: boolean
      stripe_publishable_key?: string
      error_description?: string
    }
    if (!response.ok || !payload.stripe_user_id || !payload.access_token) {
      return errorRedirect(payload.error_description ?? "Stripe could not authorize that account.")
    }

    await saveStripeConnection({
      userId: user.id,
      accountId: payload.stripe_user_id,
      accessToken: payload.access_token,
      livemode: Boolean(payload.livemode),
      publishableKey: payload.stripe_publishable_key ?? null,
    })
    destination.searchParams.set("stripe", "connected")
  } catch (error) {
    console.error("Stripe OAuth callback failed", error)
    return errorRedirect("Stripe could not be connected. Check the server configuration.")
  }

  const response = NextResponse.redirect(destination)
  response.cookies.delete("stripe_oauth_state")
  return response
}
