import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface Tab {
  id: string
  label: string
}

interface AnimatedTabBarProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function AnimatedTabBar({ tabs, active, onChange, className }: AnimatedTabBarProps) {
  return (
    <div className={cn('relative flex gap-1 rounded-lg border border-coach-border bg-coach-surface/80 p-1', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative z-10 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              isActive ? 'text-coach-lime' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {isActive && (
              <motion.div
                layoutId="coach-tab-indicator"
                className="absolute inset-0 rounded-md bg-coach-lime/15"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="coach-tab-underline"
                className="absolute bottom-0 left-0 h-0.5 w-full bg-coach-lime"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
