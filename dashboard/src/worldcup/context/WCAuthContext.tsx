import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type WCRole = 'fan' | 'hotel_manager' | 'travel_agency' | 'admin'

export interface WCUser {
  email: string
  name: string
  role: WCRole
  country?: string
  favorites?: string[]
  preferredTeam?: string
}

export interface WCRegisterData {
  name: string
  email: string
  password: string
  country: string
  role: WCRole
}

interface WCAuthContextValue {
  user: WCUser | null
  login: (email: string, password: string) => Promise<void>
  register: (data: WCRegisterData) => Promise<void>
  logout: () => void
  toggleFavorite: (teamId: string) => void
  setPreferredTeam: (teamId: string) => void
}

const STORAGE = 'wc2030_user'
const USERS_KEY = 'wc2030_users'

const DEMO: (WCUser & { password: string })[] = [
  { email: 'fan@wc2030.com', password: 'Fan123!', name: 'Ahmed Fan', role: 'fan', country: 'Morocco', favorites: ['mar', 'esp'], preferredTeam: 'mar' },
  { email: 'hotel@wc2030.com', password: 'Hotel123!', name: 'Sara Hotel Manager', role: 'hotel_manager', country: 'Spain' },
  { email: 'agency@wc2030.com', password: 'Agency123!', name: 'João Travel Agency', role: 'travel_agency', country: 'Portugal' },
  { email: 'admin@wc2030.com', password: 'Admin123!', name: 'WC Admin', role: 'admin', country: 'Morocco' },
]

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const extra = raw ? (JSON.parse(raw) as (WCUser & { password: string })[]) : []
    return [...DEMO, ...extra.filter((u) => !DEMO.some((d) => d.email === u.email))]
  } catch {
    return DEMO
  }
}

const WCAuthContext = createContext<WCAuthContextValue | null>(null)

export function WCAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WCUser | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE)
    if (raw) setUser(JSON.parse(raw))
  }, [])

  const persist = (u: WCUser) => {
    setUser(u)
    localStorage.setItem(STORAGE, JSON.stringify(u))
  }

  const login = async (email: string, password: string) => {
    const found = loadUsers().find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!found) throw new Error('Invalid credentials')
    const { password: _, ...safe } = found
    persist(safe)
  }

  const register = async (data: WCRegisterData) => {
    if (loadUsers().some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email already registered')
    }
    const nu: WCUser & { password: string } = {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      country: data.country,
      favorites: data.role === 'fan' ? [] : undefined,
    }
    const extra = loadUsers().filter((u) => !DEMO.some((d) => d.email === u.email))
    extra.push(nu)
    localStorage.setItem(USERS_KEY, JSON.stringify(extra))
    const { password: _, ...safe } = nu
    persist(safe)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE)
  }

  const toggleFavorite = (teamId: string) => {
    if (!user || user.role !== 'fan') return
    const favs = user.favorites ?? []
    const next = favs.includes(teamId) ? favs.filter((f) => f !== teamId) : [...favs, teamId]
    persist({ ...user, favorites: next })
  }

  const setPreferredTeam = (teamId: string) => {
    if (!user) return
    persist({ ...user, preferredTeam: teamId })
  }

  return (
    <WCAuthContext.Provider value={{ user, login, register, logout, toggleFavorite, setPreferredTeam }}>
      {children}
    </WCAuthContext.Provider>
  )
}

export function useWCAuth() {
  const ctx = useContext(WCAuthContext)
  if (!ctx) throw new Error('useWCAuth requires WCAuthProvider')
  return ctx
}

export const WC_DEMO = DEMO.map(({ email, password, role, name }) => ({ email, password, role, name }))
