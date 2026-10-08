import { describe, expect, it } from "vitest"
import type { IncomeEntry, IncomeSource } from "@/lib/income"
import {
  MANIKKA_EMPTY_INSIGHT,
  currentMonthKey,
  describeMonthChange,
  incomeByMonth,
  incomeBySource,
  manikkaInsight,
  monthOverMonth,
  shiftMonthKey,
  totalForMonth,
  verifiedProfileSteps,
} from "@/lib/income-stats"

let nextId = 0
function entry(receivedOn: string, amountKes: number, source: IncomeSource = "mpesa"): IncomeEntry {
  nextId += 1
  return { id: String(nextId), amountKes, source, receivedOn, note: null, createdAt: `${receivedOn}T09:00:00Z` }
}

// 8 Oct 2026, 10:00 in Nairobi.
const NOW = new Date("2026-10-08T07:00:00Z")

describe("month keys", () => {
  it("uses the Nairobi calendar, not UTC", () => {
    // 31 Oct 2026 22:30 UTC is already 1 Nov in Nairobi (UTC+3).
    expect(currentMonthKey(new Date("2026-10-31T22:30:00Z"))).toBe("2026-11")
    expect(currentMonthKey(NOW)).toBe("2026-10")
  })

  it("shifts across year boundaries", () => {
    expect(shiftMonthKey("2026-01", -1)).toBe("2025-12")
    expect(shiftMonthKey("2025-12", 1)).toBe("2026-01")
    expect(shiftMonthKey("2026-10", -6)).toBe("2026-04")
  })
})

describe("monthOverMonth", () => {
  it("computes an increase with amount and percent", () => {
    const change = monthOverMonth(15000, 10000)
    expect(change).toMatchObject({ delta: 5000, percent: 50, direction: "up" })
    expect(describeMonthChange(change)).toBe("Up KSh 5,000 (50%) vs last month.")
  })

  it("computes a decrease", () => {
    const change = monthOverMonth(7500, 10000)
    expect(change).toMatchObject({ delta: -2500, percent: -25, direction: "down" })
    expect(describeMonthChange(change)).toBe("Down KSh 2,500 (25%) vs last month.")
  })

  it("has no percent when last month was zero", () => {
    const change = monthOverMonth(4000, 0)
    expect(change.percent).toBeNull()
    expect(change.direction).toBe("up")
    expect(describeMonthChange(change)).toBe("Up KSh 4,000. Nothing was logged last month.")
  })

  it("handles both months being zero", () => {
    const change = monthOverMonth(0, 0)
    expect(change).toMatchObject({ delta: 0, percent: null, direction: "flat" })
    expect(describeMonthChange(change)).toBe("Nothing logged this month or last month yet.")
  })

  it("shows a full drop when nothing is logged this month", () => {
    expect(describeMonthChange(monthOverMonth(0, 8000))).toBe("Down KSh 8,000 (100%) vs last month.")
  })

  it("treats equal months as flat", () => {
    expect(describeMonthChange(monthOverMonth(5000, 5000))).toBe("Same as last month.")
  })

  it("shows tiny changes as <1%", () => {
    expect(describeMonthChange(monthOverMonth(100050, 100000))).toBe("Up KSh 50 (<1%) vs last month.")
  })

  it("sums entries per month from real entries", () => {
    const entries = [entry("2026-10-01", 1000), entry("2026-10-31", 250.5), entry("2026-09-30", 999)]
    expect(totalForMonth(entries, "2026-10")).toBe(1250.5)
    expect(totalForMonth(entries, "2026-09")).toBe(999)
  })
})

describe("chart series", () => {
  const entries = [
    entry("2026-10-02", 3000, "youtube"),
    entry("2026-10-05", 7000, "brand_deals"),
    entry("2026-08-10", 2000, "youtube"),
    entry("2026-01-10", 99999, "clients"),
  ]

  it("returns the last 6 months oldest first, including empty months", () => {
    expect(incomeByMonth(entries, NOW)).toEqual([
      { key: "2026-05", total: 0 },
      { key: "2026-06", total: 0 },
      { key: "2026-07", total: 0 },
      { key: "2026-08", total: 2000 },
      { key: "2026-09", total: 0 },
      { key: "2026-10", total: 10000 },
    ])
  })

  it("totals by source within a window, largest first", () => {
    const keys = incomeByMonth(entries, NOW).map((month) => month.key)
    expect(incomeBySource(entries, keys)).toEqual([
      { source: "brand_deals", total: 7000 },
      { source: "youtube", total: 5000 },
    ])
  })
})

describe("verifiedProfileSteps", () => {
  it("counts steps from real data", () => {
    const steps = verifiedProfileSteps({
      profile: { displayName: "Wanjiru", creatorType: "youtuber" },
      sourceCount: 2,
      entries: [entry("2026-10-01", 100)],
    })
    expect(steps.filter((step) => step.done).length).toBe(4)
    expect(steps.find((step) => step.id === "two-months")?.done).toBe(false)
  })

  it("is 0 of 5 for an empty profile", () => {
    const steps = verifiedProfileSteps({
      profile: { displayName: null, creatorType: null },
      sourceCount: 0,
      entries: [],
    })
    expect(steps).toHaveLength(5)
    expect(steps.every((step) => !step.done)).toBe(true)
  })
})

describe("manikkaInsight", () => {
  it("greets users with no data", () => {
    expect(manikkaInsight([], NOW)).toBe(MANIKKA_EMPTY_INSIGHT)
  })

  it("prefers month-over-month when both months have income", () => {
    const insight = manikkaInsight([entry("2026-10-01", 12000), entry("2026-09-01", 10000)], NOW)
    expect(insight).toContain("up 20% on last month")
  })

  it("names the top source when only this month has income", () => {
    const insight = manikkaInsight(
      [entry("2026-10-01", 6000, "brand_deals"), entry("2026-10-03", 2000, "youtube")],
      NOW
    )
    expect(insight).toBe("Brand deals is your top source this month: KSh 6,000, 75% of what you’ve earned.")
  })

  it("nudges when nothing is logged this month yet", () => {
    expect(manikkaInsight([entry("2026-09-12", 5000)], NOW)).toContain("Last month you earned KSh 5,000")
  })
})
