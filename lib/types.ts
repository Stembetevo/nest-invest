export type ReportStatus = "pending" | "verified"

export type IncomeMonth = {
  label: string
  inflow: number
}

export type IncomeSource = {
  name: string
  share: number
}

export type ManikkaState = {
  name: string
  phone: string
  signedInAt: string | null
  reportStatus: ReportStatus
  verifiedAt: string | null
  monthlyIncome: number
  score: number
  months: IncomeMonth[]
  sources: IncomeSource[]
  sharedWithLender: boolean
}
