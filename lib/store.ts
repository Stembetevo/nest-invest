"use client"

import { useSyncExternalStore } from "react"
import { buildReport } from "./income"
import { normalizeKenyanPhone } from "./money"
import type { IncomeMonth, IncomeSource, ReportStatus, VeritasState } from "./types"

const KEY = "veritas-v1"
const EVENT = "veritas-store"

export const defaultState: VeritasState = {
  name: "",
  phone: "",
  signedInAt: null,
  reportStatus: "pending",
  verifiedAt: null,
  monthlyIncome: 0,
  score: 0,
  months: [],
  sources: [],
  sharedWithLender: false,
}

let snapshot: VeritasState = defaultState
let snapshotRaw: string | null = null
let snapshotReady = false

function isBrowser() {
  return typeof window !== "undefined"
}

function asMonths(value: unknown): IncomeMonth[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is IncomeMonth =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as IncomeMonth).label === "string" &&
      typeof (item as IncomeMonth).inflow === "number"
  )
}

function asSources(value: unknown): IncomeSource[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is IncomeSource =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as IncomeSource).name === "string" &&
      typeof (item as IncomeSource).share === "number"
  )
}

function parse(raw: string | null): VeritasState {
  if (!raw) return defaultState
  try {
    const parsed = JSON.parse(raw) as Partial<VeritasState>
    const reportStatus: ReportStatus = parsed.reportStatus === "verified" ? "verified" : "pending"
    return {
      ...defaultState,
      ...parsed,
      name: typeof parsed.name === "string" ? parsed.name : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      signedInAt: typeof parsed.signedInAt === "string" ? parsed.signedInAt : null,
      reportStatus,
      verifiedAt: typeof parsed.verifiedAt === "string" ? parsed.verifiedAt : null,
      monthlyIncome: typeof parsed.monthlyIncome === "number" ? parsed.monthlyIncome : 0,
      score: typeof parsed.score === "number" ? parsed.score : 0,
      months: asMonths(parsed.months),
      sources: asSources(parsed.sources),
      sharedWithLender: Boolean(parsed.sharedWithLender),
    }
  } catch {
    return defaultState
  }
}

export function loadState(): VeritasState {
  if (!isBrowser()) return defaultState
  const raw = window.localStorage.getItem(KEY)
  if (snapshotReady && raw === snapshotRaw) return snapshot
  snapshotRaw = raw
  snapshot = parse(raw)
  snapshotReady = true
  return snapshot
}

function persist(next: VeritasState) {
  snapshot = next
  snapshotRaw = JSON.stringify(next)
  snapshotReady = true
  window.localStorage.setItem(KEY, snapshotRaw)
  window.dispatchEvent(new Event(EVENT))
}

export function saveState(
  patch: Partial<VeritasState> | ((prev: VeritasState) => VeritasState)
) {
  const prev = loadState()
  const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch }
  persist(next)
  return next
}

export function signIn(input: { name: string; phone: string }) {
  const prev = loadState()
  const phone = normalizeKenyanPhone(input.phone)
  const name = input.name.trim()
  if (prev.phone === phone && prev.signedInAt) {
    return saveState({ ...prev, name })
  }
  return saveState({
    ...defaultState,
    name,
    phone,
    signedInAt: new Date().toISOString(),
  })
}

export function verifyIncome() {
  return saveState((prev) => {
    if (!prev.phone) return prev
    return {
      ...prev,
      ...buildReport(prev.phone),
      reportStatus: "verified",
      verifiedAt: new Date().toISOString(),
      sharedWithLender: false,
    }
  })
}

export function shareReport() {
  return saveState((prev) => ({ ...prev, sharedWithLender: true }))
}

export function signOut() {
  persist(defaultState)
  return defaultState
}

function subscribe(onStoreChange: () => void) {
  if (!isBrowser()) return () => {}
  window.addEventListener(EVENT, onStoreChange)
  window.addEventListener("storage", onStoreChange)
  return () => {
    window.removeEventListener(EVENT, onStoreChange)
    window.removeEventListener("storage", onStoreChange)
  }
}

const getServerSnapshot = () => defaultState

export function useVeritasStore() {
  return useSyncExternalStore(subscribe, loadState, getServerSnapshot)
}

export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}
