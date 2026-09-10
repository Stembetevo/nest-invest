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

function isBrowser() {
  return typeof window !== "undefined"
}

export function loadState(): NestState {
  if (!isBrowser()) return defaultState
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return defaultState
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

function persist(next: NestState) {
  window.localStorage.setItem(KEY, JSON.stringify(next))
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
  window.addEventListener(EVENT, onStoreChange)
  window.addEventListener("storage", onStoreChange)
  return () => {
    window.removeEventListener(EVENT, onStoreChange)
    window.removeEventListener("storage", onStoreChange)
  }
}

function clientHydrated() {
  return true
}

function serverHydrated() {
  return false
}

export function useNestStore() {
  const state = useSyncExternalStore(subscribe, loadState, () => defaultState)
  const hydrated = useSyncExternalStore(subscribe, clientHydrated, serverHydrated)
  return { ...state, hydrated }
}
