import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useBookings } from './BookingContext'
import { useWCAuth } from './WCAuthContext'
import { DEFAULT_RARITY_CONFIG } from '../data/passportData'
import type { Collectible, FanPassport, RarityConfig, WCNotification } from '../types/passport'
import {
  applyCollectibleToPassport,
  buildNotifications,
  computeLeaderboard,
  createEmptyPassport,
  isMintableBooking,
  markValidated,
  mintCollectible,
  validateQR,
} from '../utils/passportEngine'
import { DEMO_LEADERBOARD } from '../data/passportData'
import type { LeaderboardEntry } from '../types/passport'

interface PassportContextValue {
  passport: FanPassport | null
  lastMinted: Collectible | null
  notifications: WCNotification[]
  unreadCount: number
  leaderboard: LeaderboardEntry[]
  rarityConfig: RarityConfig
  clearLastMinted: () => void
  markNotificationRead: (id: string) => void
  validateTicketQR: (payload: string) => { valid: boolean; message: string; collectible?: Collectible }
  validateTicketQRGlobal: (payload: string) => { valid: boolean; message: string; collectible?: Collectible }
  setRarityConfig: (config: RarityConfig) => void
  getAllPassportsStats: () => { totalCollectibles: number; byRarity: Record<string, number>; totalFans: number }
}

const PassportContext = createContext<PassportContextValue | null>(null)
const PASSPORT_KEY = 'wc2030_passports'
const CONFIG_KEY = 'wc2030_rarity_config'
const READ_KEY = 'wc2030_notif_read'

function loadPassports(): Record<string, FanPassport> {
  try {
    return JSON.parse(localStorage.getItem(PASSPORT_KEY) || '{}')
  } catch {
    return {}
  }
}

function savePassports(all: Record<string, FanPassport>) {
  localStorage.setItem(PASSPORT_KEY, JSON.stringify(all))
}

function loadConfig(): RarityConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    return raw ? { ...DEFAULT_RARITY_CONFIG, ...JSON.parse(raw) } : DEFAULT_RARITY_CONFIG
  } catch {
    return DEFAULT_RARITY_CONFIG
  }
}

export function PassportProvider({ children }: { children: ReactNode }) {
  const { user } = useWCAuth()
  const { bookings } = useBookings()
  const [passport, setPassport] = useState<FanPassport | null>(null)
  const [lastMinted, setLastMinted] = useState<Collectible | null>(null)
  const [rarityConfig, setRarityConfigState] = useState<RarityConfig>(loadConfig)
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'))
    } catch {
      return new Set()
    }
  })
  const processedRef = useRef<Set<string>>(new Set())

  const persistPassport = useCallback((p: FanPassport) => {
    const all = loadPassports()
    all[p.userEmail] = p
    savePassports(all)
    setPassport(p)
  }, [])

  useEffect(() => {
    if (!user?.email) {
      setPassport(null)
      return
    }
    const all = loadPassports()
    const existing = all[user.email] ?? createEmptyPassport(user.email)
    all[user.email] = existing
    savePassports(all)
    setPassport(existing)
    processedRef.current = new Set(existing.mintProcessedBookings)
  }, [user?.email])

  useEffect(() => {
    if (!user?.email) return

    const all = loadPassports()
    let updated = all[user.email] ?? createEmptyPassport(user.email)
    let minted: Collectible | null = null
    let changed = false

    for (const booking of bookings) {
      if (!isMintableBooking(booking)) continue
      if (updated.mintProcessedBookings.includes(booking.id)) continue

      const collectible = mintCollectible(booking, rarityConfig)
      updated = applyCollectibleToPassport(updated, collectible, rarityConfig)
      updated = {
        ...updated,
        mintProcessedBookings: [...updated.mintProcessedBookings, booking.id],
      }
      minted = collectible
      changed = true
    }

    if (changed) {
      all[user.email] = updated
      savePassports(all)
      setPassport(updated)
      if (minted) setLastMinted(minted)
    }
  }, [bookings, user?.email, rarityConfig])

  const notifications = passport
    ? buildNotifications(passport, bookings).map((n) => ({ ...n, read: n.read || readIds.has(n.id) }))
    : []

  const unreadCount = notifications.filter((n) => !n.read).length

  const leaderboard = user && passport
    ? computeLeaderboard(user.name, user.country ?? 'Morocco', passport, DEMO_LEADERBOARD)
    : []

  const clearLastMinted = () => setLastMinted(null)

  const markNotificationRead = (id: string) => {
    const next = new Set([...readIds, id])
    setReadIds(next)
    localStorage.setItem(READ_KEY, JSON.stringify([...next]))
  }

  const validateTicketQR = (payload: string) => {
    if (!passport) return { valid: false, message: 'No passport loaded' }
    const result = validateQR(payload, passport)
    if (result.valid && result.collectible && !result.collectible.validated) {
      const updated = markValidated(passport, result.collectible.serialNumber)
      persistPassport(updated)
    }
    return result
  }

  const setRarityConfig = (config: RarityConfig) => {
    setRarityConfigState(config)
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  }

  const validateTicketQRGlobal = (payload: string) => {
    const all = loadPassports()
    for (const p of Object.values(all)) {
      const result = validateQR(payload, p)
      if (result.valid && result.collectible) {
        const updated = markValidated(p, result.collectible.serialNumber)
        all[p.userEmail] = updated
        savePassports(all)
        if (user?.email === p.userEmail) setPassport(updated)
        return result
      }
    }
    return { valid: false, message: 'Collectible not found in system' }
  }

  const getAllPassportsStats = () => {
    const all = Object.values(loadPassports())
    const byRarity: Record<string, number> = { common: 0, rare: 0, epic: 0, legendary: 0 }
    let totalCollectibles = 0
    for (const p of all) {
      for (const c of p.collectibles) {
        totalCollectibles++
        byRarity[c.rarity] = (byRarity[c.rarity] ?? 0) + 1
      }
    }
    return { totalCollectibles, byRarity, totalFans: all.length }
  }

  return (
    <PassportContext.Provider
      value={{
        passport,
        lastMinted,
        notifications,
        unreadCount,
        leaderboard,
        rarityConfig,
        clearLastMinted,
        markNotificationRead,
        validateTicketQR,
        validateTicketQRGlobal,
        setRarityConfig,
        getAllPassportsStats,
      }}
    >
      {children}
    </PassportContext.Provider>
  )
}

export function usePassport() {
  const ctx = useContext(PassportContext)
  if (!ctx) throw new Error('usePassport requires PassportProvider')
  return ctx
}
