"use client"

import { useSyncExternalStore } from "react"
import type { NestState, Pledge } from "./types"

const KEY = "nest-bills-v1"
const EVENT = "nest-store"

export const defaultState: NestState = {
  phone: "",
  alertsEnabled: false,
  watchedAuctionIds: [],
  pledges: [],
}

let snapshot: NestState = defaultState
let snapshotRaw: string | null = null
let snapshotReady = false

function isBrowser() {
  return typeof window !== "undefined"
}

function parse(raw: string | null): NestState {
  if (!raw) return defaultState
  try {
    const parsed = JSON.parse(raw) as Partial<NestState>
    return {
      ...defaultState,
      ...parsed,
      pledges: Array.isArray(parsed.pledges) ? parsed.pledges : [],
      watchedAuctionIds: Array.isArray(parsed.watchedAuctionIds)
        ? parsed.watchedAuctionIds
        : [],
    }
  } catch {
    return defaultState
  }
}

export function loadState(): NestState {
  if (!isBrowser()) return defaultState
  const raw = window.localStorage.getItem(KEY)
  if (snapshotReady && raw === snapshotRaw) return snapshot
  snapshotRaw = raw
  snapshot = parse(raw)
  snapshotReady = true
  return snapshot
}

function persist(next: NestState) {
  snapshot = next
  snapshotRaw = JSON.stringify(next)
  snapshotReady = true
  window.localStorage.setItem(KEY, snapshotRaw)
  window.dispatchEvent(new Event(EVENT))
}

export function saveState(patch: Partial<NestState> | ((prev: NestState) => NestState)) {
  const prev = loadState()
  const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch }
  persist(next)
  return next
}

export function addPledge(pledge: Pledge) {
  return saveState((prev) => ({
    ...prev,
    phone: pledge.phone || prev.phone,
    pledges: [pledge, ...prev.pledges],
  }))
}

export function resetDemo() {
  persist(defaultState)
}

export function makeReceiptCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "NEST"
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
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

export function useNestStore() {
  return useSyncExternalStore(subscribe, loadState, getServerSnapshot)
}
