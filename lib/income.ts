import type { IncomeMonth, IncomeSource } from "./types"

export const SAMPLE_REPORT = {
  name: "Amina K.",
  place: "Nairobi",
  monthlyIncome: 42600,
  score: 81,
  months: [
    { label: "May", inflow: 38200 },
    { label: "Jun", inflow: 41400 },
    { label: "Jul", inflow: 39800 },
    { label: "Aug", inflow: 45100 },
    { label: "Sep", inflow: 43900 },
    { label: "Oct", inflow: 47200 },
  ] satisfies IncomeMonth[],
  sources: [
    { name: "Till and paybill", share: 48 },
    { name: "Person to person", share: 31 },
    { name: "Regular payer", share: 21 },
  ] satisfies IncomeSource[],
}

function hashPhone(phone: string) {
  let hash = 2166136261
  for (const char of phone) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function recentMonthLabels(count = 6) {
  const labels: string[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(date.toLocaleString("en-KE", { month: "short" }))
  }
  return labels
}

export function buildReport(phone: string) {
  const hash = hashPhone(phone)
  const base = 22000 + (hash % 48000)
  const months: IncomeMonth[] = recentMonthLabels().map((label, index) => {
    const wobble = 0.84 + ((hash >> (index * 3)) % 28) / 100
    const inflow = Math.round((base * wobble) / 100) * 100
    return { label, inflow }
  })
  const monthlyIncome =
    Math.round(months.reduce((sum, month) => sum + month.inflow, 0) / months.length / 100) * 100
  const mean = months.reduce((sum, month) => sum + month.inflow, 0) / months.length
  const deviation = Math.sqrt(
    months.reduce((sum, month) => sum + (month.inflow - mean) ** 2, 0) / months.length
  )
  const score = Math.round(Math.min(94, Math.max(64, 96 - (deviation / mean) * 180)))
  const till = 36 + (hash % 18)
  const person = 18 + ((hash >> 5) % 16)
  const sources: IncomeSource[] = [
    { name: "Till and paybill", share: till },
    { name: "Person to person", share: person },
    { name: "Regular payer", share: 100 - till - person },
  ]
  return { monthlyIncome, score, months, sources }
}

export function reportCode(phone: string) {
  return `VRT-${hashPhone(phone).toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`
}
