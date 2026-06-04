import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(val: unknown, decimals = 1): string {
  const n = Number(val)
  if (Number.isNaN(n)) return '—'
  return n.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

export function formatPercent(val: unknown): string {
  const n = Number(val)
  if (Number.isNaN(n)) return '—'
  return `${n.toFixed(1)}%`
}

export function pick<T extends Record<string, unknown>>(obj: T, ...keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k]
  }
  return undefined
}
