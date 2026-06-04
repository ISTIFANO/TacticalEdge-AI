import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useStatus } from '../../lib/api'
import { MatchSelector } from '../MatchSelector'
import { NewsWelcomePopup } from '../NewsWelcomePopup'
import { Sidebar } from '../Sidebar'
import { PitchBackground } from './PitchBackground'
import { FootballLoader } from './FootballLoader'
import { pageTransition } from './motion'

export function CoachLayout() {
  const { data: status } = useStatus()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="coach-root relative flex min-h-screen bg-coach-navy">
      <PitchBackground />
      <div className="relative z-10 flex w-full">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="absolute start-0 top-0 h-full w-64 shadow-xl">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-coach-border bg-coach-surface/80 px-4 py-3 backdrop-blur lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-coach-border p-2 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-coach-lime" />
              </button>
              <MatchSelector />
            </div>
            {status?.processing && (
              <div className="flex items-center gap-2 rounded-lg bg-coach-lime/10 px-3 py-1.5 text-sm text-coach-lime">
                <FootballLoader message="" className="py-0" />
                <span className="hidden sm:inline">Pipeline processing…</span>
              </div>
            )}
            {status?.last_updated && !status.processing && (
              <p className="text-xs text-slate-500">
                Updated {new Date(status.last_updated).toLocaleString()}
              </p>
            )}
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} {...pageTransition}>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <NewsWelcomePopup />
    </div>
  )
}
