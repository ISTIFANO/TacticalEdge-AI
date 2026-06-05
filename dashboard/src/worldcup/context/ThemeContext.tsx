import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const KEY = 'wc2030_theme'

export function WCThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(KEY) as Theme) || 'dark')

  useEffect(() => {
    localStorage.setItem(KEY, theme)
    document.documentElement.setAttribute('data-wc-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useWCTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useWCTheme requires WCThemeProvider')
  return ctx
}
