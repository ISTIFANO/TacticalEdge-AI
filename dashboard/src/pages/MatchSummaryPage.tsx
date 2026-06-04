import { useMatchStore } from '../store/matchStore'
import { useMatchSummary } from '../lib/api'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { StatCard } from '../components/StatCard'
import { TeamColorBadge } from '../components/TeamColorBadge'
import { AnimatedDataTable } from '../components/coach/AnimatedDataTable'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import type { Column } from '../components/DataTable'
import { formatPercent } from '../lib/utils'
export function MatchSummaryPage() {
  const videoId = useMatchStore((s) => s.videoId())
  const { data, isLoading, error } = useMatchSummary(videoId)

  if (isLoading) return <LoadingState />
  if (error) return <EmptyState title="Failed to load match" description={String(error)} />
  if (!data?.teams?.length) return <EmptyState title="No match data" />

  const statColumns: Column<Record<string, unknown>>[] = [
    { key: 'formations', label: 'Formation' },
    { key: 'score', label: 'Score' },
    { key: 'goals', label: 'Goals', sortable: true, align: 'right' },
    { key: 'total_shots', label: 'Shots', sortable: true, align: 'right' },
    { key: 'total_passes', label: 'Passes', sortable: true, align: 'right' },
    { key: 'pass_success', label: 'Pass %', sortable: true, align: 'right', render: (r) => formatPercent(r.pass_success) },
    { key: 'total_possession', label: 'Possession', sortable: true, align: 'right', render: (r) => formatPercent(r.total_possession) },
    { key: 'tackles', label: 'Tackles', sortable: true, align: 'right' },
    { key: 'corners', label: 'Corners', sortable: true, align: 'right' },
  ]

  return (
    <CoachPageShell
      title="Match Summary"
      subtitle={`Video ${videoId} — ${data.team_label === 'my_team' ? 'My Team' : 'Opponent'}`}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {data.teams.map((team, i) => (
          <SpotlightCard key={i} className="p-5">            <div className="mb-4 flex items-center gap-3">
              <TeamColorBadge color={team.team_color_rgb} className="h-6 w-6" />
              <div>
                <h3 className="text-lg font-semibold text-white">Team {i + 1}</h3>
                <p className="text-sm text-slate-400">
                  {String(team.formations ?? 'Unknown')} · {String(team.score ?? '—')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Goals" value={team.goals} />
              <StatCard label="Shots" value={team.total_shots} />
              <StatCard label="Passes" value={team.total_passes} />
              <StatCard label="Possession" value={team.total_possession} isPercent />
            </div>
            {[1, 2, 3, 4, 5].some((n) => team[`substitution_${n}`]) && (
              <div className="mt-4 border-t border-coach-border pt-3">
                <p className="text-xs font-medium uppercase text-slate-500">Substitutions</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const sub = team[`substitution_${n}`]
                    if (!sub || sub === 0) return null
                    return (
                      <span key={n} className="rounded bg-coach-navy px-2 py-0.5 text-xs text-slate-300">
                        Sub {n}: #{String(sub)}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </SpotlightCard>
        ))}
      </div>

      <div>
        <h3 className="coach-heading mb-3 text-sm font-semibold text-slate-400">Team Statistics</h3>
        <AnimatedDataTable data={data.teams as Record<string, unknown>[]} columns={statColumns} keyField="id_match" />
      </div>

      {data.team_statistics.length > 0 && (
        <div>
          <h3 className="coach-heading mb-3 text-sm font-semibold text-slate-400">Raw Team Stats</h3>
          <AnimatedDataTable
            data={data.team_statistics}
            columns={Object.keys(data.team_statistics[0] ?? {})
              .filter((k) => !k.startsWith('Unnamed'))
              .slice(0, 10)
              .map((k) => ({ key: k, label: k.replace(/_/g, ' '), sortable: true }))}
            keyField="Unnamed: 0"
          />
        </div>
      )}
    </CoachPageShell>
  )
}