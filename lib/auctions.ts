import { addDaysIso, wednesdayCloseIso } from "./dates"
import type { Auction, PledgeStatus, TenorDays } from "./types"

const TENORS: TenorDays[] = [91, 182, 364]

const CURRENT_RATES: Record<TenorDays, number> = {
  91: 0.1512,
  182: 0.1548,
  364: 0.1591,
}

const LAST_RATES: Record<TenorDays, number> = {
  91: 0.1498,
  182: 0.1531,
  364: 0.1577,
}

const OFFERED: Record<TenorDays, number> = {
  91: 8_000_000_000,
  182: 6_000_000_000,
  364: 4_000_000_000,
}

const LAST_OVERSUB: Record<TenorDays, number> = {
  91: 2.04,
  182: 1.62,
  364: 1.38,
}

function auctionId(tenor: TenorDays, closeIso: string) {
  return `tbill-${tenor}-${closeIso.slice(0, 10)}`
}

function buildAuction(
  tenor: TenorDays,
  closeIso: string,
  status: Auction["status"],
  rate: number,
  extras: Partial<Auction> = {}
): Auction {
  return {
    id: auctionId(tenor, closeIso),
    tenorDays: tenor,
    annualRate: rate,
    status,
    closesAt: closeIso,
    settlementDate: addDaysIso(closeIso, 2),
    maturityDate: addDaysIso(closeIso, 2 + tenor),
    offeredKes: OFFERED[tenor],
    ...extras,
  }
}

export function getAuctions(now = new Date()): Auction[] {
  const thisClose = wednesdayCloseIso(now, 0)
  const lastClose = wednesdayCloseIso(now, -1)
  const nextClose = wednesdayCloseIso(now, 1)

  const open = TENORS.map((tenor) =>
    buildAuction(tenor, thisClose, "open", CURRENT_RATES[tenor])
  )

  const closed = TENORS.map((tenor) =>
    buildAuction(tenor, lastClose, "closed", LAST_RATES[tenor], {
      oversubscription: LAST_OVERSUB[tenor],
      acceptedKes: Math.round(OFFERED[tenor] * LAST_OVERSUB[tenor]),
    })
  )

  const upcoming = TENORS.map((tenor) =>
    buildAuction(tenor, nextClose, "upcoming", CURRENT_RATES[tenor])
  )

  return [...open, ...closed, ...upcoming]
}

export function getAuction(id: string, now = new Date()) {
  return getAuctions(now).find((auction) => auction.id === id)
}

export function getOpenAuctions(now = new Date()) {
  return getAuctions(now).filter((auction) => auction.status === "open")
}

export function getFeaturedAuction(now = new Date()) {
  return (
    getOpenAuctions(now).find((auction) => auction.tenorDays === 91) ??
    getOpenAuctions(now)[0]
  )
}

export function getClosedHighlight(now = new Date()) {
  return getAuctions(now).find(
    (auction) => auction.status === "closed" && auction.tenorDays === 91
  )
}

export function resolvePledgeStatus(
  auction: Auction,
  now = new Date()
): PledgeStatus {
  if (now.getTime() >= new Date(auction.maturityDate).getTime()) return "matured"
  if (now.getTime() >= new Date(auction.closesAt).getTime()) return "allotted"
  return "pending_auction"
}

export const TYPICAL_MMF_RATE = 0.11
