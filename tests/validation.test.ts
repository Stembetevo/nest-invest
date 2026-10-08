import { describe, expect, it } from "vitest"
import { parseIncomeEntry, parseSourcesStep, validateSignupForm } from "@/lib/validation"

const TODAY = "2026-10-08"
const base = { amount: "15,000", source: "mpesa", receivedOn: TODAY, note: "" }

describe("parseIncomeEntry", () => {
  it("accepts KSh amounts with commas", () => {
    const result = parseIncomeEntry(base, TODAY)
    expect(result).toEqual({
      ok: true,
      value: { amountKes: 15000, source: "mpesa", receivedOn: TODAY, note: null },
    })
  })

  it("rejects zero, negative, and over-precise amounts", () => {
    for (const amount of ["0", "-5", "10.555", "abc", ""]) {
      expect(parseIncomeEntry({ ...base, amount }, TODAY).ok).toBe(false)
    }
  })

  it("rejects future dates and unknown sources", () => {
    const result = parseIncomeEntry({ ...base, receivedOn: "2026-10-09", source: "crypto" }, TODAY)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.receivedOn).toBe("The date can’t be in the future.")
      expect(result.errors.source).toBeDefined()
    }
  })
})

describe("form validation", () => {
  it("requires at least one income source", () => {
    expect(parseSourcesStep([]).ok).toBe(false)
    expect(parseSourcesStep(["mpesa", "mpesa"])).toEqual({ ok: true, value: ["mpesa"] })
  })

  it("flags weak passwords and bad emails on sign-up", () => {
    expect(validateSignupForm({ email: "nope", password: "short" })).toEqual({
      email: "Enter a valid email address, like wanjiru@example.com.",
      password: "Use at least 8 characters.",
    })
  })
})
