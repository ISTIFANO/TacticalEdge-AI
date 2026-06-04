import { useMemo } from 'react'
import { useMatchStore } from '../store/matchStore'
import { usePlayers, useSquad } from '../lib/api'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import { ChartCard, ScatterDistanceSpeed, SimpleBarChart } from '../components/Charts'
import { PHYSICAL_SCATTER, TOP_PLAYERS_BARS } from '../data/chartData'
import { formatNumber } from '../lib/utils'

export function PhysicalPerformancePage() {
  const videoId = useMatchStore((s) => s.videoId())
  const { data: players, isLoading: lp, error: ep } = usePlayers(videoId)
  const { data: squad1 } = useSquad(videoId, 1)
  const { data: squad2 } = useSquad(videoId, 2)

  const scatterData = useMemo(
    () =>
      (players ?? [])
        .filter((p) => Number(p.Distance_covered ?? 0) > 0 || Number(p.Highest_speed ?? 0) > 0)
        .map((p) => ({
          name: `#${p.shirt_number}`,
          distance: Number(p.Distance_covered ?? 0),
          speed: Number(p.Highest_speed ?? 0),
        })),
    [players],
  )

  const distanceByTeam = useMemo(() => {
    const all = [...(squad1 ?? []), ...(squad2 ?? [])]
    return all
      .filter((p) => Number(p.Distance_covered ?? 0) > 0)
      .sort((a, b) => Number(b.Distance_covered ?? 0) - Number(a.Distance_covered ?? 0))
      .slice(0, 8)
      .map((p) => ({
        name: `#${p.shirt_number ?? p.Shirt_Number}`,
        value: Number(p.Distance_covered ?? 0),
      }))
  }, [squad1, squad2])

  const avgSpeedByPos = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>()
    for (const p of players ?? []) {
      const pos = String(p.Position ?? 'Unknown')
      const spd = Number(p.Avg_speed ?? 0)
      if (spd <= 0) continue
      const cur = map.get(pos) ?? { sum: 0, count: 0 }
      cur.sum += spd
      cur.count += 1
      map.set(pos, cur)
    }
    return Array.from(map.entries()).map(([name, { sum, count }]) => ({
      name: name === '0' ? 'Unknown' : name,
      value: Math.round((sum / count) * 10) / 10,
    }))
  }, [players])

  const scatterChart = scatterData.length > 0 ? scatterData : PHYSICAL_SCATTER
  const distanceChart = distanceByTeam.length > 0 ? distanceByTeam : TOP_PLAYERS_BARS.distance
  const speedByPosFallback = [
    { name: 'Defender', value: 7.2 },
    { name: 'Midfielder', value: 8.4 },
    { name: 'Forward', value: 9.1 },
    { name: 'Winger', value: 9.6 },
  ]
  const speedChart = avgSpeedByPos.length > 0 ? avgSpeedByPos : speedByPosFallback

  if (lp) return <LoadingState />
  if (ep) return <EmptyState title="Failed to load physical data" description={String(ep)} />

  return (
    <CoachPageShell title="Physical Performance" subtitle="Distance, speed, and workload metrics">      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Distance vs Top Speed" subtitle="Hover for full breakdown">
          <ScatterDistanceSpeed data={scatterChart} />
        </ChartCard>
        <ChartCard title="Distance Covered (Top 8)" subtitle="Sorted by value">
          <SimpleBarChart data={distanceChart} dataKey="value" />
        </ChartCard>
        <ChartCard title="Avg Speed by Position" subtitle="km/h average">
          <SimpleBarChart data={speedChart} dataKey="value" />
        </ChartCard>
      </div>

      <SpotlightCard className="p-4">
        <h3 className="coach-heading mb-3 text-sm font-semibold text-slate-400">Summary</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Total players tracked</p>
            <p className="coach-stat text-xl font-bold text-coach-lime">{players?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Max distance</p>
            <p className="coach-stat text-xl font-bold text-coach-lime">
              {formatNumber(Math.max(...(players ?? []).map((p) => Number(p.Distance_covered ?? 0))))} m
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Max speed (capped)</p>
            <p className="coach-stat text-xl font-bold text-coach-lime">
              {formatNumber(Math.max(...(players ?? []).map((p) => Number(p.Highest_speed ?? 0))))} km/h
            </p>
          </div>
        </div>
      </SpotlightCard>
    </CoachPageShell>
  )
}