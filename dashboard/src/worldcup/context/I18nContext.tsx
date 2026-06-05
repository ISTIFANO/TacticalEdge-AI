import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { LANGS, type Lang, t } from '../i18n/translations'

interface I18nContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextValue | null>(null)
const KEY = 'wc2030_lang'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem(KEY) as Lang) || 'fr')
  const dir = LANGS.find((l) => l.code === lang)?.dir ?? 'ltr'

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem(KEY, l)
    document.documentElement.lang = l
    document.documentElement.dir = LANGS.find((x) => x.code === l)?.dir ?? 'ltr'
  }

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  return (
    <I18nContext.Provider value={{ lang, setLang, t: (key) => t(lang, key), dir }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n requires I18nProvider')
  return ctx
}
