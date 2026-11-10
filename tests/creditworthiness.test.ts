import { describe, expect, it } from "vitest"
import { assessCreditworthiness } from "@/lib/creditworthiness"

function month(index: number, day: number) {
  return new Date(Date.UTC(2026, index, day, 12)).toISOString()
}

describe("assessCreditworthiness", () => {
  it("waits while the bank refresh is still pending and history is thin", () => {
    const result = assessCreditworthiness({
      accounts: [{ category: "cash", currency: "usd", availableBalance: 10_000, currentBalance: 10_000 }],
      transactions: [
        { amount: 5_000, currency: "usd", status: "posted", transactedAt: month(0, 2) },
      ],
      refreshPending: true,
      now: new Date("2026-06-01T00:00:00.000Z"),
    })

    expect(result.verdict).toBe("pending")
    expect(result.score).toBeNull()
  })

  it("refuses a score when posted history is shorter than a month", () => {
    const transactions = Array.from({ length: 10 }, (_, index) => ({
      amount: index % 2 === 0 ? 20_000 : -8_000,
      currency: "usd",
      status: "posted",
      transactedAt: month(3, index + 1),
    }))

    const result = assessCreditworthiness({
      accounts: [{ category: "cash", currency: "usd", availableBalance: 50_000, currentBalance: 50_000 }],
      transactions,
      refreshPending: false,
      now: new Date("2026-06-01T00:00:00.000Z"),
    })

    expect(result.verdict).toBe("insufficient")
    expect(result.score).toBeNull()
  })

  it("scores steady surplus cash flow with a balance cushion as strong", () => {
    const transactions = [0, 1, 2, 3, 4, 5].flatMap((index) => [
      { amount: 400_000, currency: "usd", status: "posted" as const, transactedAt: month(index, 3) },
      { amount: 100_000, currency: "usd", status: "posted" as const, transactedAt: month(index, 17) },
      { amount: -180_000, currency: "usd", status: "posted" as const, transactedAt: month(index, 20) },
    ])

    const result = assessCreditworthiness({
      accounts: [{ category: "cash", currency: "usd", availableBalance: 800_000, currentBalance: 820_000 }],
      transactions,
      refreshPending: false,
      now: new Date("2026-06-15T00:00:00.000Z"),
    })

    expect(result.verdict).toBe("strong")
    expect(result.score).toBeGreaterThanOrEqual(75)
    expect(result.currency).toBe("usd")
    expect(result.monthlyInflow).toBeGreaterThan(result.monthlyOutflow ?? 0)
    expect(result.monthsCovered).toBe(6)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it("ignores void transactions and other currencies when choosing the read", () => {
    const transactions = [0, 1, 2, 3, 4, 5].flatMap((index) => [
      { amount: 200_000, currency: "usd", status: "posted" as const, transactedAt: month(index, 5) },
      { amount: -40_000, currency: "usd", status: "posted" as const, transactedAt: month(index, 18) },
      { amount: 9_999_999, currency: "eur", status: "posted" as const, transactedAt: month(index, 6) },
      { amount: -9_999_999, currency: "usd", status: "void" as const, transactedAt: month(index, 7) },
    ])

    const result = assessCreditworthiness({
      accounts: [{ category: "cash", currency: "usd", availableBalance: 300_000, currentBalance: 300_000 }],
      transactions,
      refreshPending: false,
      now: new Date("2026-06-15T00:00:00.000Z"),
    })

    expect(result.currency).toBe("usd")
    expect(result.monthlyInflow).toBeLessThan(500_000)
    expect(result.verdict === "strong" || result.verdict === "moderate").toBe(true)
  })
})
