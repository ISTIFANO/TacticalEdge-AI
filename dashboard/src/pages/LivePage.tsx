import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useLiveSnapshot } from '../lib/api'
import { LoadingState } from '../components/LoadingState'
import { StatCard } from '../components/StatCard'
import { CoachButton } from '../components/coach/CoachButton'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'

export function LivePage() {
  const { data, isLoading } = useLiveSnapshot()

  if (isLoading && !data) return <LoadingState message="Connecting to live feed…" />

  const live = data?.live
  const matches = (data?.overview_summary as { matches?: { teams?: Record<string, unknown>[] }[] })?.matches ?? []
  const team = matches[0]?.teams?.[0] ?? {}

  const isActive = live?.processing || live?.phase === 'cv' || live?.phase === 'recsys' || live?.phase === 'reports'

  return (
    <CoachPageShell title="Live Monitor" subtitle="Rolling stats during pipeline processing (Live Lite mode)">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Live Lite — stats update every batch. Same pipeline scales to real-time with GPU hardware.
      </div>

      <SpotlightCard className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="coach-heading text-sm font-medium text-slate-400">
            Phase: {live?.phase ?? 'idle'}
            {live?.mode && ` · ${live.mode}`}
          </span>
          {isActive && <Loader2 className="h-5 w-5 animate-spin text-coach-lime" />}
        </div>
        <div className="mb-2 h-3 overflow-hidden rounded-full bg-coach-navy">
          <div
            className="h-full bg-coach-lime transition-all duration-500"
            style={{ width: `${live?.progress_pct ?? 0}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">
          Video {live?.current_video ?? 1} · Frame {live?.frames_processed ?? 0} / {live?.total_frames ?? 0}
          {' '}({live?.progress_pct ?? 0}%)
        </p>
      </SpotlightCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Goals" value={team.goals ?? 0} />
        <StatCard label="Shots" value={team.total_shots ?? 0} />
        <StatCard label="Passes" value={team.total_passes ?? 0} />
        <StatCard label="Possession" value={team.total_possession ?? 0} isPercent />
      </div>

      {live?.phase === 'done' && (
        <Link to="/app/reports">
          <CoachButton>View generated reports →</CoachButton>
        </Link>
      )}
    </CoachPageShell>
  )
}
