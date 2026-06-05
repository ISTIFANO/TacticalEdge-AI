import { createContext, useContext, useState, type ReactNode } from 'react'

interface PiContextValue {
  connected: boolean
  username: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const PiContext = createContext<PiContextValue | null>(null)
const KEY = 'wc2030_pi_connected'

export function PiProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(() => localStorage.getItem(KEY) === '1')
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('wc2030_pi_user'))

  const connect = async () => {
    await new Promise((r) => setTimeout(r, 800))
    setConnected(true)
    setUsername('pioneer_fan')
    localStorage.setItem(KEY, '1')
    localStorage.setItem('wc2030_pi_user', 'pioneer_fan')
  }

  const disconnect = () => {
    setConnected(false)
    setUsername(null)
    localStorage.removeItem(KEY)
    localStorage.removeItem('wc2030_pi_user')
  }

  return (
    <PiContext.Provider value={{ connected, username, connect, disconnect }}>
      {children}
    </PiContext.Provider>
  )
}

export function usePi() {
  const ctx = useContext(PiContext)
  if (!ctx) throw new Error('usePi requires PiProvider')
  return ctx
}