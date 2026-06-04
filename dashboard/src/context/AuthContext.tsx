import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type UserRole = 'admin' | 'coach' | 'analyst'

export interface User {
  email: string
  name: string
  club: string
  role: UserRole
  country?: string
  coachingLevel?: string
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

export interface RegisterData {
  name: string
  club: string
  email: string
  password: string
  country: string
  coachingLevel: string
}

const STORAGE_KEY = 'tacticzone_auth_user'
const USERS_KEY = 'tacticzone_users'

const DEMO_USERS: (User & { password: string })[] = [
  {
    email: 'admin@tacticzone.com',
    password: 'Admin123!',
    name: 'Alex Admin',
    club: 'morocco2030.PI HQ',
    role: 'admin',
    country: 'Morocco',
    coachingLevel: 'Pro',
  },
  {
    email: 'coach@tacticzone.com',
    password: 'Coach123!',
    name: 'Karim Benali',
    club: 'FC Casablanca',
    role: 'coach',
    country: 'Morocco',
    coachingLevel: 'Semi-Pro',
  },
  {
    email: 'analyst@tacticzone.com',
    password: 'Analyst123!',
    name: 'Sara Analyst',
    club: 'Atlas Performance Unit',
    role: 'analyst',
    country: 'Morocco',
    coachingLevel: 'Academy',
  },
]

function loadUsers(): (User & { password: string })[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const extra = raw ? (JSON.parse(raw) as (User & { password: string })[]) : []
    return [...DEMO_USERS, ...extra.filter((u) => !DEMO_USERS.some((d) => d.email === u.email))]
  } catch {
    return DEMO_USERS
  }
}

function saveExtraUser(user: User & { password: string }) {
  const raw = localStorage.getItem(USERS_KEY)
  const extra = raw ? (JSON.parse(raw) as (User & { password: string })[]) : []
  extra.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(extra))
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setUser(JSON.parse(raw) as User)
  }, [])

  const login = async (email: string, password: string) => {
    const found = loadUsers().find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!found) throw new Error('Invalid email or password')
    const { password: _, ...safe } = found
    setUser(safe)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
  }

  const register = async (data: RegisterData) => {
    if (loadUsers().some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('An account with this email already exists')
    }
    const newUser: User & { password: string } = {
      email: data.email,
      password: data.password,
      name: data.name,
      club: data.club,
      role: 'coach',
      country: data.country,
      coachingLevel: data.coachingLevel,
    }
    saveExtraUser(newUser)
    const { password: _, ...safe } = newUser
    setUser(safe)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const resetPassword = async (email: string) => {
    if (!loadUsers().some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('No account found with this email')
    }
    // Demo: no email sent
  }

  const updatePassword = async (password: string) => {
    if (!user) throw new Error('Not signed in')
    const users = loadUsers()
    const idx = users.findIndex((u) => u.email === user.email)
    if (idx >= 0 && !DEMO_USERS.some((d) => d.email === user.email)) {
      users[idx].password = password
      localStorage.setItem(USERS_KEY, JSON.stringify(users.filter((u) => !DEMO_USERS.some((d) => d.email === u.email))))
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const DEMO_CREDENTIALS = DEMO_USERS.map(({ email, password, role, name }) => ({
  email,
  password,
  role,
  name,
}))
