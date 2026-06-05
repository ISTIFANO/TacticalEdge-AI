import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BrandName } from './BrandName'

export function MarketingNav() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-navy/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="morocco2030.PI" className="h-9 w-9 rounded-lg object-contain" />
          <BrandName className="text-lg" accentClassName="text-[#f4af47]" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 md:flex">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'text-[#f4af47]' : 'hover:text-white')}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'text-[#f4af47]' : 'hover:text-white')}>
            About
          </NavLink>
          <a href="/#features" className="hover:text-white">Features</a>
          <a href="/#morocco-squad" className="hover:text-white">Players</a>
          <Link to="/world-cup" className="text-[#C5A572] hover:underline">World Cup 2030</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/coach"
                className="hidden rounded-lg bg-pitch/15 px-3 py-1.5 text-sm font-medium text-pitch sm:inline-block"
              >
                Coach Hub
              </Link>
              <Link
                to="/app"
                className="rounded-lg bg-pitch px-3 py-1.5 text-sm font-semibold text-navy"
              >
                Analytics
              </Link>
              <button type="button" onClick={logout} className="text-sm text-slate-500 hover:text-white">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:text-white">
                Sign in
              </Link>
              <Link to="/register" className="rounded-lg bg-[#f4af47] px-3 py-1.5 text-sm font-semibold text-navy">
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
