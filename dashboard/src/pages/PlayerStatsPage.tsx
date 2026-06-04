import { useState } from 'react'
import { useMatchStore } from '../store/matchStore'
import { usePlayers } from '../lib/api'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { AnimatedDataTable } from '../components/coach/AnimatedDataTable'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import type { Column } from '../components/DataTable'
import { ChartCard, SimpleBarChart } from '../components/Charts'
import { TOP_PLAYERS_BARS } from '../data/chartData'
import { formatNumber } from '../lib/utils'
import type { PlayerStat } from '../types/analytics'

const COLUMNS: Column<PlayerStat>[] = [
  { key: 'shirt_number', label: '#', sortable: true, align: 'center' },
  { key: 'team', label: 'Team', sortable: true, align: 'center' },
  { key: 'Goals', label: 'Goals', sortable: true, align: 'right' },
  { key: 'Total_passes', label: 'Passes', sortable: true, align: 'right' },
  { key: 'Pass_Success', label: 'Pass OK', sortable: true, align: 'right' },
  { key: 'pass_success_rate', label: 'Pass %', sortable: true, align: 'right', render: (r) => `${formatNumber(r.pass_success_rate)}%` },
  { key: 'Total_shots', label: 'Shots', sortable: true, align: 'right' },
  { key: 'Distance_covered', label: 'Distance', sortable: true, align: 'right', render: (r) => formatNumber(r.Distance_covered) },
  { key: 'Highest_speed', label: 'Top Speed', sortable: true, align: 'right', render: (r) => formatNumber(r.Highest_speed) },
]

export function PlayerStatsPage() {
  const videoId = useMatchStore((s) => s.videoId())
  const [teamFilter, setTeamFilter] = useState<number | undefined>()
  const [minDist, setMinDist] = useState(0)
  const { data, isLoading, error } = usePlayers(videoId, teamFilter, minDist)

  if (isLoading) return <LoadingState />
  if (error) return <EmptyState title="Failed to load players" description={String(error)} />

  const players = data ?? []

  if (!players.length) {
    return (
      <EmptyState
        title="No player stats for this video"
        description="Run the CV pipeline or switch to the other match (Video 1 / Video 2) in the header."
      />
    )
  }

  const topGoals = [...players].sort((a, b) => Number(b.Goals ?? 0) - Number(a.Goals ?? 0)).slice(0, 5)
    .map((p) => ({ name: `#${p.shirt_number}`, value: Number(p.Goals ?? 0), color: '#C1272D' }))
  const topDistance = [...players].sort((a, b) => Number(b.Distance_covered ?? 0) - Number(a.Distance_covered ?? 0)).slice(0, 5)
    .map((p) => ({ name: `#${p.shirt_number}`, value: Number(p.Distance_covered ?? 0), color: '#C1272D' }))
  const topSpeed = [...players].sort((a, b) => Number(b.Highest_speed ?? 0) - Number(a.Highest_speed ?? 0)).slice(0, 5)
    .map((p) => ({ name: `#${p.shirt_number}`, value: Number(p.Highest_speed ?? 0), color: '#C1272D' }))

  const goalsChart = topGoals.some((d) => d.value > 0) ? topGoals : TOP_PLAYERS_BARS.goals
  const distanceChart = topDistance.some((d) => d.value > 0) ? topDistance : TOP_PLAYERS_BARS.distance
  const speedChart = topSpeed.some((d) => d.value > 0) ? topSpeed : TOP_PLAYERS_BARS.speed

  return (
    <CoachPageShell
      title="Player Stats"
      subtitle={`Video ${videoId} — ${players.length} players`}
      actions={
        <div className="flex flex-wrap gap-3">
          <select
            value={teamFilter ?? ''}
            onChange={(e) => setTeamFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-lg border border-coach-border bg-coach-surface px-3 py-1.5 text-sm text-slate-300"
          >
            <option value="">All teams</option>
            <option value="1">Team 1</option>
            <option value="2">Team 2</option>
          </select>
          <input
            type="number"
            min={0}
            value={minDist}
            onChange={(e) => setMinDist(Number(e.target.value))}
            placeholder="Min distance"
            className="w-32 rounded-lg border border-coach-border bg-coach-surface px-3 py-1.5 text-sm text-slate-300"
          />
        </div>
      }
    >      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Top Goals" subtitle="Sorted · hover for details">
          <SimpleBarChart data={goalsChart} dataKey="value" />
        </ChartCard>
        <ChartCard title="Top Distance" subtitle="Meters covered">
          <SimpleBarChart data={distanceChart} dataKey="value" />
        </ChartCard>
        <ChartCard title="Top Speed" subtitle="km/h peak">
          <SimpleBarChart data={speedChart} dataKey="value" />
        </ChartCard>
      </div>

      <AnimatedDataTable data={players} columns={COLUMNS} />
    </CoachPageShell>
  )
}