import type { CreditAssessment } from "@/lib/creditworthiness"

export type BankAccountView = {
  id: string
  institutionName: string | null
  displayName: string | null
  last4: string | null
  category: string
  subcategory: string
  status: string
  currency: string | null
  currentBalance: number | null
  availableBalance: number | null
  balanceAsOf: string | null
  balanceRefreshStatus: string | null
  transactionRefreshStatus: string | null
}

export type BankTransactionView = {
  id: string
  accountId: string
  amount: number
  currency: string
  description: string | null
  status: string
  transactedAt: string
}

export type BankSnapshot = {
  configured: boolean
  linked: boolean
  accounts: BankAccountView[]
  transactions: BankTransactionView[]
  assessment: CreditAssessment | null
  refreshPending: boolean
  setupMessage: string | null
}
