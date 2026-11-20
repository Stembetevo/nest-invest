import { randomBytes } from "node:crypto"
import { describe, expect, it, vi } from "vitest"
import { decryptStripeToken, encryptStripeToken } from "@/lib/stripe"

vi.mock("server-only", () => ({}))

describe("Stripe token encryption", () => {
  it("round-trips tokens without storing plaintext", () => {
    const key = new Uint8Array(randomBytes(32))
    const token = "sk_live_example_token"

    const encrypted = encryptStripeToken(token, key)

    expect(encrypted).not.toContain(token)
    expect(decryptStripeToken(encrypted, key)).toBe(token)
  })

  it("rejects a token encrypted with a different key", () => {
    const encrypted = encryptStripeToken("sk_live_example_token", new Uint8Array(randomBytes(32)))

    expect(() => decryptStripeToken(encrypted, new Uint8Array(randomBytes(32)))).toThrow()
  })
})
