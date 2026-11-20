import { randomBytes } from "node:crypto"
import { describe, expect, it, vi } from "vitest"
import { decryptStripeToken, encryptStripeToken, stripeRedirectUri } from "@/lib/stripe"

vi.mock("server-only", () => ({}))

describe("Stripe token encryption", () => {
  it("round-trips tokens without storing plaintext", () => {
    const key = new Uint8Array(randomBytes(32))
    const token = "sk_live_example_token"

    const encrypted = encryptStripeToken(token, key)

    expect(encrypted).not.toContain(token)
    expect(decryptStripeToken(encrypted, key)).toBe(token)
  })

  it("keeps the Stripe callback on the site that started Connect", () => {
    const previous = process.env.STRIPE_CONNECT_REDIRECT_URI
    process.env.STRIPE_CONNECT_REDIRECT_URI = "https://nestinvest.xyz/api/stripe/callback"

    expect(stripeRedirectUri("https://nestfinance.xyz")).toBe(
      "https://nestfinance.xyz/api/stripe/callback"
    )
    expect(stripeRedirectUri("https://nestinvest.xyz")).toBe(
      "https://nestinvest.xyz/api/stripe/callback"
    )

    if (previous === undefined) delete process.env.STRIPE_CONNECT_REDIRECT_URI
    else process.env.STRIPE_CONNECT_REDIRECT_URI = previous
  })

  it("rejects a token encrypted with a different key", () => {
    const encrypted = encryptStripeToken("sk_live_example_token", new Uint8Array(randomBytes(32)))

    expect(() => decryptStripeToken(encrypted, new Uint8Array(randomBytes(32)))).toThrow()
  })
})
