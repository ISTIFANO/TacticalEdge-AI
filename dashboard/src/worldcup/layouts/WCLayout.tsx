import { Link, NavLink, Outlet } from 'react-router-dom'
import { Globe, Moon, Sun, Trophy } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useWCTheme } from '../context/ThemeContext'
import { useWCAuth } from '../context/WCAuthContext'
import { LANGS } from '../i18n/translations'
import { PiConnectButton, EdirhamConnectButton } from '../components/PiPayment'
import { NotificationsBell } from '../components/passport/NotificationsBell'

export function WCLayout() {
  const { t, lang, setLang } = useI18n()
  const { theme, toggle } = useWCTheme()
  const { user, logout } = useWCAuth()

  const nav = [
    { to: '/world-cup', label: t('nav.home'), end: true },
    { to: '/world-cup/about', label: t('nav.about') },
    { to: '/world-cup/hotels', label: t('nav.hotels') },
    { to: '/world-cup/flights', label: t('nav.flights') },
    { to: '/world-cup/tickets', label: t('nav.tickets') },
    { to: '/world-cup/teams', label: t('nav.teams') },
    { to: '/world-cup/stadiums', label: t('nav.stadiums') },
    { to: '/world-cup/packages', label: t('nav.packages') },
    ...(user?.role === 'fan' ? [{ to: '/world-cup/passport', label: t('nav.passport') }] : []),
    { to: '/world-cup/contact', label: t('nav.contact') },
  ]

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
      isActive ? 'bg-[var(--wc-gold)]/20 text-[var(--wc-gold)]' : 'text-[var(--wc-muted)] hover:text-[var(--wc-text)]'
    }`

  return (
    <div className="wc-root min-h-screen bg-[var(--wc-bg)] text-[var(--wc-text)]">
      <header className="sticky top-0 z-50 border-b border-[var(--wc-border)] bg-[var(--wc-bg)]/95 backdrop-blur-lg">
        {/* Row 1 — logo + actions */}
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:px-4 sm:gap-3">
          <Link to="/world-cup" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#C5A572] to-[#8B6914] sm:h-10 sm:w-10">
              <Trophy className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div className="hidden min-[400px]:block">
              <span className="block text-sm font-bold leading-tight">FIFA WC</span>
              <span className="text-[10px] text-[var(--wc-muted)]">2030 · MAR ESP POR</span>
            </div>
          </Link>

          <div className="ms-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            <div className="relative hidden md:block">
              <Globe className="pointer-events-none absolute start-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--wc-muted)]" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as typeof lang)}
                className="max-w-[7rem] rounded-lg border border-[var(--wc-border)] bg-[var(--wc-card)] py-1.5 ps-7 pe-1 text-[11px] sm:max-w-none sm:ps-8 sm:pe-2 sm:text-xs"
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            <button type="button" onClick={toggle} className="rounded-lg border border-[var(--wc-border)] p-1.5 sm:p-2" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <EdirhamConnectButton compact className="hidden sm:inline-flex" />
            <PiConnectButton compact className="hidden sm:inline-flex" />

            {user && <NotificationsBell />}

            {user ? (
              <>
                <Link
                  to="/world-cup/dashboard"
                  className="hidden rounded-lg bg-[var(--wc-gold)] px-2.5 py-1.5 text-[11px] font-semibold text-black md:inline-block sm:px-3 sm:text-xs"
                >
                  {t('nav.dashboard')}
                </Link>
                <button type="button" onClick={logout} className="hidden text-[11px] text-[var(--wc-muted)] sm:inline sm:text-xs">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/world-cup/login" className="hidden text-xs text-[var(--wc-muted)] sm:inline">{t('nav.login')}</Link>
                <Link to="/world-cup/register" className="rounded-lg bg-[var(--wc-gold)] px-2.5 py-1.5 text-[11px] font-semibold text-black sm:px-3 sm:text-xs">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Row 2 — scrollable nav (no overflow on page) */}
        <nav className="wc-nav-scroll border-t border-[var(--wc-border)]/60">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 py-1.5 sm:px-4">
            {nav.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
            {/* Mobile-only lang + logout */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as typeof lang)}
              className="ms-1 shrink-0 rounded-lg border border-[var(--wc-border)] bg-[var(--wc-card)] px-2 py-1 text-[11px] md:hidden"
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            {user && (
              <button type="button" onClick={logout} className="shrink-0 whitespace-nowrap px-2 py-1 text-[11px] text-[var(--wc-muted)] sm:hidden">
                {t('nav.logout')}
              </button>
            )}
          </div>
        </nav>
      </header>
      <main><Outlet /></main>
      <footer className="mt-16 border-t border-[var(--wc-border)] py-8 text-center text-xs text-[var(--wc-muted)]">
        FIFA World Cup 2030™ · Morocco · Spain · Portugal · Centennial Celebration
        <div className="mt-2">
          <Link to="/" className="text-[var(--wc-gold)] hover:underline">morocco2030.PI Analytics</Link>
        </div>
      </footer>
    </div>
  )
}
