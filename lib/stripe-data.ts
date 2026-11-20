import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import {
  decryptStripeToken,
  encryptStripeToken,
  getStripeConfig,
  stripeClient,
} from "@/lib/stripe"
import type { Stripe as StripeTypes } from "stripe"

type StripeConnectionRow = {
  user_id: string
  stripe_account_id: string
  access_token_encrypted: string
  livemode: boolean
}

export async function saveStripeConnection(input: {
  userId: string
  accountId: string
  accessToken: string
  livemode: boolean
  publishableKey: string | null
}) {
  const config = getStripeConfig()
  if (!config) throw new Error("Stripe Connect configuration is missing.")

  const admin = createAdminClient()
  const { error } = await admin.from("stripe_connections").upsert(
    {
      user_id: input.userId,
      stripe_account_id: input.accountId,
      access_token_encrypted: encryptStripeToken(input.accessToken, config.encryptionKey),
      livemode: input.livemode,
      stripe_publishable_key: input.publishableKey,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )
  if (error) throw new Error(`Could not save Stripe connection: ${error.message}`)
}

async function getStripeConnection(userId: string) {
  const config = getStripeConfig()
  if (!config) return null

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("stripe_connections")
    .select("user_id, stripe_account_id, access_token_encrypted, livemode")
    .eq("user_id", userId)
    .maybeSingle()
  if (error) throw new Error(`Could not load Stripe connection: ${error.message}`)
  if (!data) return null

  const row = data as StripeConnectionRow
  return {
    accountId: row.stripe_account_id,
    livemode: row.livemode,
    accessToken: decryptStripeToken(row.access_token_encrypted, config.encryptionKey),
  }
}

export async function stripeConnectionStatus(userId: string) {
  const connection = await getStripeConnection(userId)
  return connection
    ? { connected: true as const, accountId: connection.accountId, livemode: connection.livemode }
    : { connected: false as const }
}

export async function syncStripeTransactions(userId: string, months: number) {
  const connection = await getStripeConnection(userId)
  if (!connection) throw new Error("Connect a Stripe account before syncing transactions.")

  const stripe = stripeClient(connection.accessToken)
  const created = Math.floor(Date.now() / 1000) - months * 31 * 24 * 60 * 60
  const transactions: StripeTypes.BalanceTransaction[] = []
  let startingAfter: string | undefined

  while (transactions.length < 1000) {
    const page = await stripe.balanceTransactions.list({
      limit: 100,
      created: { gte: created },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    transactions.push(...page.data)
    if (!page.has_more || page.data.length === 0) break
    startingAfter = page.data[page.data.length - 1]?.id
  }

  const admin = createAdminClient()
  const rows = transactions.map((transaction) => ({
    user_id: userId,
    stripe_account_id: connection.accountId,
    stripe_transaction_id: transaction.id,
    transaction_type: transaction.type,
    amount: transaction.amount,
    fee: transaction.fee,
    net: transaction.net,
    currency: transaction.currency,
    status: transaction.status,
    available_on: new Date(transaction.available_on * 1000).toISOString(),
    stripe_created_at: new Date(transaction.created * 1000).toISOString(),
    description: transaction.description,
    source_id: typeof transaction.source === "string" ? transaction.source : transaction.source?.id ?? null,
    raw: transaction,
    synced_at: new Date().toISOString(),
  }))

  if (rows.length) {
    const { error } = await admin
      .from("stripe_transactions")
      .upsert(rows, { onConflict: "user_id,stripe_transaction_id" })
    if (error) throw new Error(`Could not save Stripe transactions: ${error.message}`)
  }

  return {
    imported: rows.length,
    income: rows
      .filter((row) => row.net > 0 && ["charge", "payment"].includes(row.transaction_type))
      .reduce((sum, row) => sum + row.net, 0),
    currency: rows[0]?.currency ?? null,
  }
}

export async function fetchStripeTransactions(userId: string, limit: number) {
  return fetchStripeTransactionHistory(userId, { limit })
}

export async function fetchStripeTransactionHistory(
  userId: string,
  input: { limit: number; from?: string; to?: string }
) {
  const admin = createAdminClient()
  let query = admin
    .from("stripe_transactions")
    .select(
      "stripe_transaction_id, transaction_type, amount, fee, net, currency, status, available_on, stripe_created_at, description, source_id"
    )
    .eq("user_id", userId)
    .order("stripe_created_at", { ascending: false })
    .limit(input.limit)

  if (input.from) query = query.gte("stripe_created_at", `${input.from}T00:00:00.000Z`)
  if (input.to) query = query.lt("stripe_created_at", `${input.to}T23:59:59.999Z`)

  const { data, error } = await query
  if (error) throw new Error(`Could not load Stripe transactions: ${error.message}`)

  const transactions = data ?? []
  const summary = transactions.reduce(
    (totals, transaction) => {
      if (transaction.net >= 0) totals.in += transaction.net
      else totals.out += Math.abs(transaction.net)
      return totals
    },
    { in: 0, out: 0 }
  )

  return { transactions, summary }
}
