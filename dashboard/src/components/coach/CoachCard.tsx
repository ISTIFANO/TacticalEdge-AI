import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { kickoffItemVariants } from './motion'
import { CoachXpBar } from '../CoachXpBar'

interface CoachCardProps {
  name: string
  club?: string
  role?: string
  level?: string
  initials: string
  className?: string
  showXp?: boolean
}

export function CoachCard({ name, club, role, level, initials, className, showXp = true }: CoachCardProps) {
  return (
    <motion.div
      variants={kickoffItemVariants}
      className={cn(
        'coach-shimmer-once relative overflow-hidden rounded-xl border border-coach-border bg-gradient-to-br from-coach-pitch/40 to-coach-surface p-6',
        className,
      )}
      style={{ transformPerspective: 800 }}
      initial={{ opacity: 0, rotateY: 15 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center gap-4">
        <div className="coach-avatar-ring rounded-2xl p-0.5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coach-surface text-2xl font-bold text-coach-lime">
            {initials}
          </div>
        </div>
        <div>
          <h2 className="coach-heading text-lg font-bold text-white">{name}</h2>
          {club && <p className="text-sm text-slate-400">{club}</p>}
          {(role || level) && (
            <span className="mt-1 inline-block rounded-full bg-coach-lime/15 px-2 py-0.5 text-xs capitalize text-coach-lime">
              {role}{level ? ` · ${level}` : ''}
            </span>
          )}
        </div>
      </div>
      {showXp && (
        <div className="mt-6">
          <CoachXpBar />
        </div>
      )}
    </motion.div>
  )
}
