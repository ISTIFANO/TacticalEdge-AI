import { Link } from 'react-router-dom'
import { Trophy, Zap } from 'lucide-react'
import { useCoachProfile } from '../lib/api'
import { cn } from '../lib/utils'

export function CoachXpBar({ compact = false }: { compact?: boolean }) {
  const { data: profile } = useCoachProfile()

  if (!profile) return null

  const progress =
    profile.next_level_xp > 0
      ? ((profile.next_level_xp - profile.xp_to_next_level) / profile.next_level_xp) * 100
      : 0

  if (compact) {
    return (
      <Link to="/app/puzzles" className="block border-t border-slate-800 p-3 transition-colors hover:bg-slate-800/40">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Trophy className="h-3.5 w-3.5 text-pitch" />
          <span className="font-medium text-slate-300">Lv.{profile.level}</span>
          <span className="text-slate-500">{profile.title}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-pitch transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-slate-500">
          {profile.xp} XP · {profile.puzzles_correct}/{profile.puzzles_solved} puzzles
        </p>
      </Link>
    )
  }

  return (
    <div className="rounded-xl border border-slate-700/80 bg-navy-light p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Coach Level</p>
          <p className="text-lg font-bold text-white">
            Lv.{profile.level}{' '}
            <span className="text-sm font-normal text-pitch">{profile.title}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-pitch/15 px-3 py-1.5 text-pitch">
          <Zap className="h-4 w-4" />
          <span className="font-semibold">{profile.xp} XP</span>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className={cn('h-full bg-pitch transition-all duration-500')} style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {profile.xp_to_next_level} XP to next level · {profile.accuracy_pct}% puzzle accuracy
      </p>
    </div>
  )
}
