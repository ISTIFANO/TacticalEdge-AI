import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { lineupRowVariants } from './motion'

interface MatchFixtureCardProps {
  home: string
  away?: string
  date?: string
  result?: 'W' | 'D' | 'L'
  index?: number
  onClick?: () => void
}

const resultColors = {
  W: 'bg-emerald-500/20 text-emerald-400',
  D: 'bg-slate-500/20 text-slate-400',
  L: 'bg-red-500/20 text-red-400',
}

export function MatchFixtureCard({ home, away, date, result, index = 0, onClick }: MatchFixtureCardProps) {
  return (
    <motion.div
      custom={index}
      variants={lineupRowVariants}
      initial="hidden"
      animate="visible"
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className="coach-card flex cursor-default items-center justify-between gap-4 hover:border-coach-lime/30"
    >
      <div className="flex flex-1 items-center gap-3">
        <span className="truncate text-sm font-medium text-white">{home}</span>
        {away && (
          <>
            <span className="animate-pulse rounded-full bg-coach-lime/20 px-2 py-0.5 text-[10px] font-bold text-coach-lime">VS</span>
            <span className="truncate text-sm font-medium text-white">{away}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {result && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded px-2 py-0.5 text-xs font-bold ${resultColors[result]}`}
          >
            {result}
          </motion.span>
        )}
        {date && <span className="text-xs text-slate-500">{date}</span>}
        <ChevronRight className="h-4 w-4 text-slate-600" />
      </div>
    </motion.div>
  )
}
