import { createContext, useContext, useState, type ReactNode } from 'react'

interface EdirhamContextValue {
  connected: boolean
  walletId: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const EdirhamContext = createContext<EdirhamContextValue | null>(null)
const KEY = 'wc2030_edh_connected'

export function EdirhamProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(() => localStorage.getItem(KEY) === '1')
  const [walletId, setWalletId] = useState<string | null>(() => localStorage.getItem('wc2030_edh_wallet'))

  const connect = async () => {
    await new Promise((r) => setTimeout(r, 600))
    setConnected(true)
    setWalletId('EDH-MAR-2030')
    localStorage.setItem(KEY, '1')
    localStorage.setItem('wc2030_edh_wallet', 'EDH-MAR-2030')
  }

  const disconnect = () => {
    setConnected(false)
    setWalletId(null)
    localStorage.removeItem(KEY)
    localStorage.removeItem('wc2030_edh_wallet')
  }

  return (
    <EdirhamContext.Provider value={{ connected, walletId, connect, disconnect }}>
      {children}
    </EdirhamContext.Provider>
  )
}

export function useEdirham() {
  const ctx = useContext(EdirhamContext)
  if (!ctx) throw new Error('useEdirham requires EdirhamProvider')
  return ctx
}
