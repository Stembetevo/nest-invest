type AuthErrorLike = {
  code?: string
  name?: string
  message?: string
  status?: number
}

export const AUTH_MESSAGES = {
  network: "We couldn’t reach the server. Check your connection and try again.",
  invalidCredentials: "That email and password don’t match. Check them and try again.",
  emailInUse: "An account with this email already exists. Log in instead, or reset your password.",
  weakPassword:
    "That password is too easy to guess. Use at least 8 characters with a mix of letters and numbers.",
  emailNotConfirmed: "Confirm your email first. We sent you a link when you signed up.",
  samePassword: "Your new password must be different from your old one.",
  rateLimited: "Too many attempts. Wait a minute and try again.",
  invalidEmail: "Enter a valid email address, like wanjiru@example.com.",
  generic: "Something went wrong. Please try again.",
} as const

export function authErrorMessage(error: unknown): string {
  const e = (error ?? {}) as AuthErrorLike
  const code = e.code ?? ""
  const message = (e.message ?? "").toLowerCase()

  if (
    e.name === "AuthRetryableFetchError" ||
    e.status === 0 ||
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("network")
  ) {
    return AUTH_MESSAGES.network
  }

  switch (code) {
    case "invalid_credentials":
      return AUTH_MESSAGES.invalidCredentials
    case "user_already_exists":
    case "email_exists":
      return AUTH_MESSAGES.emailInUse
    case "weak_password":
      return AUTH_MESSAGES.weakPassword
    case "email_not_confirmed":
      return AUTH_MESSAGES.emailNotConfirmed
    case "same_password":
      return AUTH_MESSAGES.samePassword
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return AUTH_MESSAGES.rateLimited
    case "email_address_invalid":
    case "validation_failed":
      return AUTH_MESSAGES.invalidEmail
  }

  if (message.includes("invalid login credentials")) return AUTH_MESSAGES.invalidCredentials
  if (message.includes("already registered")) return AUTH_MESSAGES.emailInUse
  if (message.includes("password should")) return AUTH_MESSAGES.weakPassword
  if (message.includes("rate limit")) return AUTH_MESSAGES.rateLimited
  return AUTH_MESSAGES.generic
}
