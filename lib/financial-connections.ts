import "server-only"

import type Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import type { BankAccountView, BankSnapshot, BankTransactionView } from "@/lib/bank-snapshot"
import {
  assessCreditworthiness,
  type BankAccountInput,
  type BankTransactionInput,
  type CreditAssessment,
  type CreditVerdict,
} from "@/lib/creditworthiness"
import { platformStripe, stripePublishableKey, stripeSecretKey, stripeSetupMessage } from "@/lib/stripe"

export class FinancialConnectionsError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message)
    this.name = "FinancialConnectionsError"
  }
}

type ConnectionRow = {
  user_id: string
  stripe_customer_id: string
  latest_session_id: string | null
}

const emptySnapshot = (configured: boolean, setupMessage: string | null = null): BankSnapshot => ({
  configured,
  linked: false,
  accounts: [],
  transactions: [],
  assessment: null,
  refreshPending: false,
  setupMessage,
})

function requirePlatformStripe() {
  const stripe = platformStripe()
  if (!stripe || !stripePublishableKey()) {
    throw new FinancialConnectionsError(
      "Stripe Financial Connections needs a secret key and a publishable key.",
      503
    )
  }
  return stripe
}

function customerIdOf(
  holder: { customer?: string | Stripe.Customer | null } | null | undefined
) {
  if (!holder?.customer) return null
  return typeof holder.customer === "string" ? holder.customer : holder.customer.id
}

function moneyEntry(map: { [key: string]: number } | null | undefined) {
  const entry = Object.entries(map ?? [])[0]
  if (!entry) return null
  const [currency, amount] = entry
  return { currency, amount }
}

function balanceFields(account: Stripe.FinancialConnections.Account) {
  const current = moneyEntry(account.balance?.current)
  const available = moneyEntry(account.balance?.cash?.available)
  const currency = available?.currency ?? current?.currency ?? null
  return {
    currency,
    currentBalance: current?.currency === currency ? current.amount : null,
    availableBalance: available?.currency === currency ? available.amount : null,
    balanceAsOf: account.balance ? new Date(account.balance.as_of * 1000).toISOString() : null,
  }
}

async function ensureCustomer(
  stripe: Stripe,
  user: { id: string; email?: string | null }
) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("financial_connections")
    .select("user_id, stripe_customer_id, latest_session_id")
    .eq("user_id", user.id)
    .maybeSingle()
  if (error) throw new FinancialConnectionsError(`Could not load the bank link: ${error.message}`, 500)
  if (data) {
    const row = data as ConnectionRow
    if (user.email) {
      await stripe.customers.update(row.stripe_customer_id, { email: user.email })
    }
    return row
  }

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: { supabase_user_id: user.id },
  })
  const { error: insertError } = await admin.from("financial_connections").insert({
    user_id: user.id,
    stripe_customer_id: customer.id,
  })
  if (insertError) {
    throw new FinancialConnectionsError(`Could not save the Stripe customer: ${insertError.message}`, 500)
  }
  return { user_id: user.id, stripe_customer_id: customer.id, latest_session_id: null }
}

export async function createBankLinkSession(user: { id: string; email?: string | null }) {
  const stripe = requirePlatformStripe()
  const connection = await ensureCustomer(stripe, user)
  const session = await stripe.financialConnections.sessions.create({
    account_holder: { type: "customer", customer: connection.stripe_customer_id },
    permissions: ["balances", "transactions", "ownership", "payment_method"],
    prefetch: ["balances", "transactions"],
    filters: { account_subcategories: ["checking", "savings"] },
  })
  if (!session.client_secret) {
    throw new FinancialConnectionsError("Stripe did not return a bank-link client secret.", 502)
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("financial_connections")
    .update({ latest_session_id: session.id, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
  if (error) throw new FinancialConnectionsError(`Could not save the bank-link session: ${error.message}`, 500)

  return {
    clientSecret: session.client_secret,
    publishableKey: stripePublishableKey(),
    sessionId: session.id,
  }
}

function refreshAllowed(
  refresh: { status: string; next_refresh_available_at: number | null } | null
) {
  if (!refresh) return true
  if (refresh.status === "pending") return false
  if (refresh.next_refresh_available_at == null) return false
  return refresh.next_refresh_available_at * 1000 <= Date.now()
}

async function listTransactions(stripe: Stripe, accountId: string) {
  const transactions: Stripe.FinancialConnections.Transaction[] = []
  let startingAfter: string | undefined
  while (transactions.length < 1000) {
    const page = await stripe.financialConnections.transactions.list({
      account: accountId,
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    transactions.push(...page.data)
    if (!page.has_more || page.data.length === 0) break
    startingAfter = page.data[page.data.length - 1]?.id
  }
  return transactions
}

async function userIdForAccount(stripe: Stripe, account: Stripe.FinancialConnections.Account) {
  const admin = createAdminClient()
  const { data } = await admin
    .from("financial_accounts")
    .select("user_id")
    .eq("stripe_account_id", account.id)
    .maybeSingle()
  if (data?.user_id) return data.user_id as string

  const customerId = customerIdOf(account.account_holder)
  if (!customerId) return null
  const { data: connection } = await admin
    .from("financial_connections")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()
  return (connection?.user_id as string | undefined) ?? null
}

async function saveAccount(userId: string, account: Stripe.FinancialConnections.Account) {
  const balances = balanceFields(account)
  const admin = createAdminClient()
  const { error } = await admin.from("financial_accounts").upsert(
    {
      user_id: userId,
      stripe_account_id: account.id,
      institution_name: account.institution_name,
      display_name: account.display_name,
      last4: account.last4,
      category: account.category,
      subcategory: account.subcategory,
      status: account.status,
      currency: balances.currency,
      current_balance: balances.currentBalance,
      available_balance: balances.availableBalance,
      balance_as_of: balances.balanceAsOf,
      balance_refresh_status: account.balance_refresh?.status ?? null,
      transaction_refresh_status: account.transaction_refresh?.status ?? null,
      transaction_refresh_id: account.transaction_refresh?.id ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,stripe_account_id" }
  )
  if (error) throw new FinancialConnectionsError(`Could not save the bank account: ${error.message}`, 500)
}

async function saveTransactions(userId: string, transactions: Stripe.FinancialConnections.Transaction[]) {
  if (!transactions.length) return
  const admin = createAdminClient()
  const syncedAt = new Date().toISOString()
  const rows = transactions.map((transaction) => ({
    user_id: userId,
    stripe_account_id: transaction.account,
    stripe_transaction_id: transaction.id,
    amount: transaction.amount,
    currency: transaction.currency,
    description: transaction.description,
    status: transaction.status,
    transacted_at: new Date(transaction.transacted_at * 1000).toISOString(),
    synced_at: syncedAt,
  }))

  for (let index = 0; index < rows.length; index += 200) {
    const { error } = await admin
      .from("financial_transactions")
      .upsert(rows.slice(index, index + 200), { onConflict: "user_id,stripe_transaction_id" })
    if (error) throw new FinancialConnectionsError(`Could not save bank transactions: ${error.message}`, 500)
  }
}

async function reassess(userId: string) {
  const snapshot = await readStoredSnapshot(userId)
  const assessment = assessCreditworthiness({
    accounts: snapshot.accounts.map(
      (account): BankAccountInput => ({
        category: account.category,
        currency: account.currency,
        availableBalance: account.availableBalance,
        currentBalance: account.currentBalance,
      })
    ),
    transactions: snapshot.transactions.map(
      (transaction): BankTransactionInput => ({
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        transactedAt: transaction.transactedAt,
      })
    ),
    refreshPending: snapshot.refreshPending,
  })

  const admin = createAdminClient()
  const { error } = await admin.from("credit_assessments").upsert(
    {
      user_id: userId,
      score: assessment.score,
      verdict: assessment.verdict,
      currency: assessment.currency,
      average_balance: assessment.averageBalance,
      monthly_inflow: assessment.monthlyInflow,
      monthly_outflow: assessment.monthlyOutflow,
      months_covered: assessment.monthsCovered,
      reasons: assessment.reasons,
      assessed_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )
  if (error) throw new FinancialConnectionsError(`Could not save the credit read: ${error.message}`, 500)
  return assessment
}

export async function ingestFinancialAccount(accountId: string, refresh: boolean) {
  const stripe = requirePlatformStripe()
  let account = await stripe.financialConnections.accounts.retrieve(accountId)
  const userId = await userIdForAccount(stripe, account)
  if (!userId) return null

  if (refresh && account.status === "active") {
    if (!account.subscriptions?.includes("transactions")) {
      try {
        account = await stripe.financialConnections.accounts.subscribe(account.id, {
          features: ["transactions"],
        })
      } catch (error) {
        console.error("Could not subscribe to bank transactions", error)
      }
    }

    const features: Array<"balance" | "transactions"> = []
    if (refreshAllowed(account.balance_refresh)) features.push("balance")
    if (refreshAllowed(account.transaction_refresh)) features.push("transactions")
    if (features.length) {
      try {
        account = await stripe.financialConnections.accounts.refresh(account.id, { features })
      } catch (error) {
        console.error("Could not refresh bank data", error)
      }
    }
  }

  await saveAccount(userId, account)
  if (account.transaction_refresh?.status === "succeeded") {
    await saveTransactions(userId, await listTransactions(stripe, account.id))
  }
  await reassess(userId)
  return userId
}

async function accountIdsForSync(stripe: Stripe, customerId: string, sessionId?: string) {
  if (sessionId) {
    if (!sessionId.startsWith("fcsess_")) {
      throw new FinancialConnectionsError("That bank-link session is not valid.")
    }
    const session = await stripe.financialConnections.sessions.retrieve(sessionId, {
      expand: ["accounts"],
    })
    if (customerIdOf(session.account_holder) !== customerId) {
      throw new FinancialConnectionsError("That bank link belongs to a different customer.")
    }
    return session.accounts.data.map((account) => account.id)
  }

  const listed = await stripe.financialConnections.accounts.list({
    account_holder: { customer: customerId },
    limit: 100,
  })
  return listed.data.map((account) => account.id)
}

export async function syncBankAccounts(user: { id: string; email?: string | null }, sessionId?: string) {
  const stripe = requirePlatformStripe()
  const connection = await ensureCustomer(stripe, user)
  const accountIds = await accountIdsForSync(stripe, connection.stripe_customer_id, sessionId)
  for (const accountId of accountIds) {
    await ingestFinancialAccount(accountId, true)
  }
  return loadBankSnapshot(user.id)
}

async function readStoredSnapshot(userId: string): Promise<BankSnapshot> {
  const admin = createAdminClient()
  const [accountsResult, transactionsResult, assessmentResult] = await Promise.all([
    admin
      .from("financial_accounts")
      .select(
        "stripe_account_id, institution_name, display_name, last4, category, subcategory, status, currency, current_balance, available_balance, balance_as_of, balance_refresh_status, transaction_refresh_status"
      )
      .eq("user_id", userId)
      .order("linked_at", { ascending: true }),
    admin
      .from("financial_transactions")
      .select("stripe_transaction_id, stripe_account_id, amount, currency, description, status, transacted_at")
      .eq("user_id", userId)
      .order("transacted_at", { ascending: false })
      .limit(1000),
    admin
      .from("credit_assessments")
      .select(
        "score, verdict, currency, average_balance, monthly_inflow, monthly_outflow, months_covered, reasons"
      )
      .eq("user_id", userId)
      .maybeSingle(),
  ])

  if (accountsResult.error) {
    throw new FinancialConnectionsError(`Could not load bank accounts: ${accountsResult.error.message}`, 500)
  }
  if (transactionsResult.error) {
    throw new FinancialConnectionsError(
      `Could not load bank transactions: ${transactionsResult.error.message}`,
      500
    )
  }

  const accounts: BankAccountView[] = (accountsResult.data ?? []).map((row) => ({
    id: row.stripe_account_id,
    institutionName: row.institution_name,
    displayName: row.display_name,
    last4: row.last4,
    category: row.category,
    subcategory: row.subcategory,
    status: row.status,
    currency: row.currency,
    currentBalance: row.current_balance,
    availableBalance: row.available_balance,
    balanceAsOf: row.balance_as_of,
    balanceRefreshStatus: row.balance_refresh_status,
    transactionRefreshStatus: row.transaction_refresh_status,
  }))
  const transactions: BankTransactionView[] = (transactionsResult.data ?? []).map((row) => ({
    id: row.stripe_transaction_id,
    accountId: row.stripe_account_id,
    amount: row.amount,
    currency: row.currency,
    description: row.description,
    status: row.status,
    transactedAt: row.transacted_at,
  }))
  const refreshPending = accounts.some(
    (account) =>
      account.status === "active" &&
      (account.balanceRefreshStatus === "pending" || account.transactionRefreshStatus === "pending")
  )
  const assessmentRow = assessmentResult.data
  const verdict = assessmentRow?.verdict
  const knownVerdict =
    verdict === "pending" ||
    verdict === "insufficient" ||
    verdict === "weak" ||
    verdict === "thin" ||
    verdict === "moderate" ||
    verdict === "strong"
      ? verdict
      : null
  const assessment: CreditAssessment | null =
    assessmentRow && knownVerdict
      ? {
          score: assessmentRow.score,
          verdict: knownVerdict satisfies CreditVerdict,
          currency: assessmentRow.currency,
          averageBalance: assessmentRow.average_balance,
          monthlyInflow: assessmentRow.monthly_inflow,
          monthlyOutflow: assessmentRow.monthly_outflow,
          monthsCovered: assessmentRow.months_covered,
          reasons: Array.isArray(assessmentRow.reasons)
            ? assessmentRow.reasons.filter((item) => typeof item === "string")
            : [],
        }
      : null

  return {
    configured: true,
    linked: accounts.length > 0,
    accounts,
    transactions,
    assessment,
    refreshPending,
    setupMessage: null,
  }
}

function present(snapshot: BankSnapshot): BankSnapshot {
  return { ...snapshot, transactions: snapshot.transactions.slice(0, 40) }
}

export async function loadBankSnapshot(userId: string) {
  if (!stripeSecretKey() || !stripePublishableKey()) return emptySnapshot(false)
  try {
    const snapshot = await readStoredSnapshot(userId)
    if (!snapshot.refreshPending) return present(snapshot)

    const pendingIds = snapshot.accounts
      .filter(
        (account) =>
          account.balanceRefreshStatus === "pending" || account.transactionRefreshStatus === "pending"
      )
      .map((account) => account.id)
    try {
      for (const accountId of pendingIds) {
        await ingestFinancialAccount(accountId, false)
      }
      return present(await readStoredSnapshot(userId))
    } catch (error) {
      console.error("Bank refresh follow-up failed", error)
      return present(snapshot)
    }
  } catch (error) {
    console.error("Bank snapshot lookup failed", error)
    return emptySnapshot(true, stripeSetupMessage(error))
  }
}
