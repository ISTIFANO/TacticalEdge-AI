import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  Crosshair,
  FileText,
  Gamepad2,
  LayoutDashboard,
  Lightbulb,
  Map,
  MessageSquare,
  Newspaper,
  Radio,
  Target,
  Clock,
  Upload,
  Trophy,
  Users,
  Home,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { BRAND } from '../lib/brand'
import { CoachXpBar } from './CoachXpBar'
import { BrandName } from './marketing/BrandName'

const NAV = [
  { to: '/coach', label: 'Coach Hub', icon: Home, isHub: true },
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/match', label: 'Match Summary', icon: Trophy },
  { to: '/app/players', label: 'Player Stats', icon: BarChart3 },
  { to: '/app/squads', label: 'Squad Breakdown', icon: Users },
  { to: '/app/physical', label: 'Physical', icon: Activity },
  { to: '/app/events', label: 'Events & Formations', icon: Crosshair },
  { to: '/app/tracking', label: 'Tracking', icon: Map },
  { to: '/app/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/app/reports', label: 'Reports', icon: FileText },
  { to: '/app/assistant', label: 'Coach Assistant', icon: MessageSquare },
  { to: '/app/puzzles', label: 'Tactical Puzzles', icon: Gamepad2 },
  { to: '/app/upload', label: 'Analyze Videos', icon: Upload },
  { to: '/app/live', label: 'Live Monitor', icon: Radio },
  { to: '/app/tactical', label: 'Tactical', icon: Target },
  { to: '/app/timeline', label: 'Timeline', icon: Clock },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-coach-border bg-coach-surface/95 backdrop-blur">
      <div className="border-b border-coach-border px-4 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt={BRAND}
            className="h-10 w-10 shrink-0 rounded-lg object-contain"
          />
          <div className="min-w-0">
            <BrandName className="coach-heading truncate text-base" accentClassName="text-coach-lime" />
            <p className="text-xs text-slate-500">Coach Analytics</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map(({ to, label, icon: Icon, end, isHub }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-coach-lime'
                  : 'text-slate-400 hover:bg-coach-lime/5 hover:text-slate-200',
                isHub && !isActive && 'border border-coach-border/50',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="coach-nav-indicator"
                    className="absolute inset-0 rounded-lg bg-coach-lime/15"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon className="relative h-4 w-4 shrink-0" />
                <span className="relative truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-coach-border p-3">
        <NavLink
          to="/app/news"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'text-coach-lime'
                : 'text-slate-400 hover:bg-coach-lime/5 hover:text-slate-200',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="coach-nav-indicator"
                  className="absolute inset-0 rounded-lg bg-coach-lime/15"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <Newspaper className="relative h-4 w-4 shrink-0" />
              <span className="relative">Coach News</span>
            </>
          )}
        </NavLink>
      </div>
      <CoachXpBar compact />
    </aside>
  )
}
