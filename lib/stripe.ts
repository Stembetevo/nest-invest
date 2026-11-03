import "server-only"

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import Stripe from "stripe"

export function getStripeConfig() {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID
  const clientSecret = process.env.STRIPE_CONNECT_CLIENT_SECRET
  const encryptionKey = process.env.STRIPE_TOKEN_ENCRYPTION_KEY

  if (!clientId || !clientSecret || !encryptionKey) return null
  const key = Buffer.from(encryptionKey, "base64")
  if (key.length !== 32) {
    throw new Error("STRIPE_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.")
  }

  return { clientId, clientSecret, encryptionKey: key }
}

export function stripeClient(accessToken: string) {
  return new Stripe(accessToken)
}

export function stripeRedirectUri(origin: string) {
  return process.env.STRIPE_CONNECT_REDIRECT_URI ?? `${origin}/api/stripe/callback`
}

export function encryptStripeToken(token: string, key: Buffer) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".")
}

export function decryptStripeToken(value: string, key: Buffer) {
  const [ivValue, tagValue, ciphertextValue] = value.split(".")
  if (!ivValue || !tagValue || !ciphertextValue) throw new Error("Invalid encrypted Stripe token.")

  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url"))
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"))
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8")
}
