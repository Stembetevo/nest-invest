export type TenorDays = 91 | 182 | 364

export type AuctionStatus = "open" | "closed" | "upcoming"

export type PledgeStatus = "pending_auction" | "allotted" | "matured"

export type Auction = {
  id: string
  tenorDays: TenorDays
  annualRate: number
  status: AuctionStatus
  closesAt: string
  settlementDate: string
  maturityDate: string
  offeredKes: number
  acceptedKes?: number
  oversubscription?: number
}

export type Pledge = {
  id: string
  auctionId: string
  tenorDays: TenorDays
  amount: number
  annualRate: number
  interest: number
  nestFee: number
  youEarn: number
  phone: string
  createdAt: string
  status: PledgeStatus
  payoutDate: string
  receiptCode: string
}

export type NestState = {
  phone: string
  alertsEnabled: boolean
  watchedAuctionIds: string[]
  pledges: Pledge[]
}
