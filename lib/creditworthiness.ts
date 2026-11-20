/**
 * Stripe Financial Connections amounts are in the smallest currency unit.
 * Positive transaction amounts are inflows. Negative amounts are outflows.
 */

export type BankAccountInput = {
  category: string
  currency: string | null
  availableBalance: number | null
  currentBalance: number | null
}

export type BankTransactionInput = {
  amount: number
  currency: string
  status: string
  transactedAt: string
}

export type CreditVerdict = "pending" | "insufficient" | "weak" | "thin" | "moderate" | "strong"

export type CreditAssessment = {
  score: number | null
  verdict: CreditVerdict
  currency: string | null
  averageBalance: number | null
  monthlyInflow: number | null
  monthlyOutflow: number | null
  monthsCovered: number
  reasons: string[]
}

const MIN_POSTED = 8
const MIN_SPAN_DAYS = 30

const ZERO_DECIMAL = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
])

export function majorUnits(amount: number, currency: string) {
  return ZERO_DECIMAL.has(currency.toLowerCase()) ? amount : amount / 100
}

export function formatMinor(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(majorUnits(amount, currency))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function monthKey(iso: string) {
  return iso.slice(0, 7)
}

function dominantCurrency(
  accounts: BankAccountInput[],
  transactions: BankTransactionInput[]
) {
  const counts = new Map<string, number>()
  for (const transaction of transactions) {
    if (transaction.status !== "posted") continue
    counts.set(transaction.currency, (counts.get(transaction.currency) ?? 0) + 1)
  }
  let best: string | null = null
  let bestCount = 0
  for (const [currency, count] of counts) {
    if (count > bestCount) {
      best = currency
      bestCount = count
    }
  }
  if (best) return best
  return accounts.find((account) => account.category === "cash" && account.currency)?.currency ?? null
}

function empty(verdict: CreditVerdict, reasons: string[], currency: string | null = null): CreditAssessment {
  return {
    score: null,
    verdict,
    currency,
    averageBalance: null,
    monthlyInflow: null,
    monthlyOutflow: null,
    monthsCovered: 0,
    reasons,
  }
}

export function assessCreditworthiness(input: {
  accounts: BankAccountInput[]
  transactions: BankTransactionInput[]
  refreshPending: boolean
  now?: Date
}): CreditAssessment {
  const now = input.now ?? new Date()
  const currency = dominantCurrency(input.accounts, input.transactions)
  if (!currency) {
    return empty(
      input.refreshPending ? "pending" : "insufficient",
      [
        input.refreshPending
          ? "The bank is still sending balances and transactions."
          : "Link a checking or savings account before a credit read is possible.",
      ]
    )
  }

  const posted = input.transactions
    .filter(
      (transaction) =>
        transaction.currency === currency &&
        transaction.status === "posted" &&
        transaction.transactedAt <= now.toISOString()
    )
    .sort((a, b) => a.transactedAt.localeCompare(b.transactedAt))

  const cashBalances = input.accounts
    .filter((account) => account.category === "cash" && account.currency === currency)
    .map((account) => account.availableBalance ?? account.currentBalance)
    .filter((amount): amount is number => amount !== null)

  if (posted.length < MIN_POSTED) {
    return empty(
      input.refreshPending ? "pending" : "insufficient",
      [
        input.refreshPending
          ? "The bank is still sending transactions. A score appears once enough posted history is in."
          : `A score needs at least ${MIN_POSTED} posted transactions in one currency. This account has ${posted.length}.`,
      ],
      currency
    )
  }

  const first = new Date(posted[0].transactedAt).getTime()
  const last = new Date(posted[posted.length - 1].transactedAt).getTime()
  const spanDays = Math.max(0, (last - first) / 86_400_000)
  const months = new Set(posted.map((transaction) => monthKey(transaction.transactedAt)))

  if (spanDays < MIN_SPAN_DAYS) {
    return empty(
      input.refreshPending ? "pending" : "insufficient",
      [
        `Posted history covers ${Math.floor(spanDays)} days. A score needs at least ${MIN_SPAN_DAYS} days so one payday does not decide it.`,
      ],
      currency
    )
  }

  let inflow = 0
  let outflow = 0
  for (const transaction of posted) {
    if (transaction.amount >= 0) inflow += transaction.amount
    else outflow += Math.abs(transaction.amount)
  }

  const divisor = Math.max(1, spanDays / 30)
  const monthlyInflow = Math.round(inflow / divisor)
  const monthlyOutflow = Math.round(outflow / divisor)
  const averageBalance = cashBalances.length
    ? Math.round(cashBalances.reduce((sum, amount) => sum + amount, 0) / cashBalances.length)
    : null

  const historyPoints = Math.round(clamp(spanDays / 180, 0, 1) * 20)
  const volume = inflow + outflow
  const inflowShare = volume === 0 ? 0 : inflow / volume
  const cashflowPoints = Math.round(clamp((inflowShare - 0.35) / 0.3, 0, 1) * 25)

  const byMonth = new Map<string, number>()
  const cursor = new Date(Date.UTC(new Date(posted[0].transactedAt).getUTCFullYear(), new Date(posted[0].transactedAt).getUTCMonth(), 1))
  const end = new Date(posted[posted.length - 1].transactedAt)
  while (cursor <= end) {
    byMonth.set(cursor.toISOString().slice(0, 7), 0)
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  for (const transaction of posted) {
    if (transaction.amount <= 0) continue
    const key = monthKey(transaction.transactedAt)
    byMonth.set(key, (byMonth.get(key) ?? 0) + transaction.amount)
  }
  const monthInflows = [...byMonth.values()]
  const mean = monthInflows.reduce((sum, value) => sum + value, 0) / monthInflows.length
  const deviation = Math.sqrt(
    monthInflows.reduce((sum, value) => sum + (value - mean) ** 2, 0) / monthInflows.length
  )
  const variation = mean === 0 ? 1 : deviation / mean
  const consistencyPoints = Math.round((1 - clamp(variation, 0, 1)) * 25)

  let cushionPoints = 0
  if (averageBalance === null) cushionPoints = 0
  else if (monthlyOutflow <= 0) cushionPoints = averageBalance > 0 ? 15 : 0
  else cushionPoints = Math.round(clamp(averageBalance / monthlyOutflow / 2, 0, 1) * 30)

  const score = historyPoints + cashflowPoints + consistencyPoints + cushionPoints
  const verdict: CreditVerdict =
    score >= 75 ? "strong" : score >= 55 ? "moderate" : score >= 35 ? "thin" : "weak"

  const money = (amount: number) => formatMinor(amount, currency)
  const reasons = [
    `About ${money(monthlyInflow)} comes in and ${money(monthlyOutflow)} goes out in a typical month, across ${months.size} months.`,
    variation <= 0.35
      ? "Inflows stay fairly steady from month to month."
      : "Inflows swing a lot between months, which weakens the read.",
    averageBalance === null
      ? "No cash balance was available, so the cushion could not be scored."
      : monthlyOutflow <= 0
        ? `Cash on hand is ${money(averageBalance)}.`
        : `Cash on hand covers about ${(averageBalance / monthlyOutflow).toFixed(1)} months of outflows.`,
    spanDays >= 150
      ? "The bank history is close to a full six months."
      : `The bank history covers about ${Math.round(spanDays)} days.`,
  ]

  return {
    score,
    verdict,
    currency,
    averageBalance,
    monthlyInflow,
    monthlyOutflow,
    monthsCovered: months.size,
    reasons,
  }
}
