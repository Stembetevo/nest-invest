import "server-only"

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import Stripe from "stripe"

type CryptoBytes = Uint8Array<ArrayBuffer>

function toCryptoBytes(value: ArrayLike<number>): CryptoBytes {
  const result = new Uint8Array(new ArrayBuffer(value.length))
  for (let index = 0; index < value.length; index += 1) result[index] = value[index] ?? 0
  return result
}

function concatCryptoBytes(...values: ArrayLike<number>[]) {
  const result = new Uint8Array(
    new ArrayBuffer(values.reduce((length, value) => length + value.length, 0))
  )
  let offset = 0
  for (const value of values) {
    result.set(value, offset)
    offset += value.length
  }
  return result
}

export function getStripeConfig() {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID
  const clientSecret = process.env.STRIPE_CONNECT_CLIENT_SECRET
  const encryptionKey = process.env.STRIPE_TOKEN_ENCRYPTION_KEY

  if (!clientId || !clientSecret || !encryptionKey) return null
  const key = toCryptoBytes(Buffer.from(encryptionKey, "base64"))
  if (key.length !== 32) {
    throw new Error("STRIPE_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key.")
  }

  return { clientId, clientSecret, encryptionKey: key }
}

export function stripeClient(accessToken: string) {
  return new Stripe(accessToken)
}

/** Platform secret used for Financial Connections. Connect OAuth stores this same key as the client secret. */
export function stripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || process.env.STRIPE_CONNECT_CLIENT_SECRET || null
}

export function stripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || null
}

export function platformStripe() {
  const secret = stripeSecretKey()
  if (!secret) return null
  return new Stripe(secret)
}

export function stripeRedirectUri(origin: string) {
  return process.env.STRIPE_CONNECT_REDIRECT_URI ?? `${origin}/api/stripe/callback`
}

export function encryptStripeToken(token: string, key: Uint8Array<ArrayBufferLike>) {
  const iv = toCryptoBytes(randomBytes(12))
  const cipher = createCipheriv("aes-256-gcm", toCryptoBytes(key), iv)
  const ciphertext = concatCryptoBytes(cipher.update(token, "utf8"), cipher.final())
  const tag = toCryptoBytes(cipher.getAuthTag())
  return [iv, tag, ciphertext].map((part) => Buffer.from(part).toString("base64url")).join(".")
}

export function decryptStripeToken(value: string, key: Uint8Array<ArrayBufferLike>) {
  const [ivValue, tagValue, ciphertextValue] = value.split(".")
  if (!ivValue || !tagValue || !ciphertextValue) throw new Error("Invalid encrypted Stripe token.")

  const decipher = createDecipheriv(
    "aes-256-gcm",
    toCryptoBytes(key),
    toCryptoBytes(Buffer.from(ivValue, "base64url"))
  )
  decipher.setAuthTag(toCryptoBytes(Buffer.from(tagValue, "base64url")))
  return Buffer.from(
    concatCryptoBytes(
      decipher.update(toCryptoBytes(Buffer.from(ciphertextValue, "base64url"))),
      decipher.final()
    )
  ).toString("utf8")
}
