import { useMatchStore } from '../store/matchStore'
import { useTactical } from '../lib/api'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { ChartCard, SimpleBarChart } from '../components/Charts'
import { PITCH_THIRDS } from '../data/chartData'
import { StatCard } from '../components/StatCard'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'

export function TacticalPage() {
  const videoId = useMatchStore((s) => s.videoId())
  const { data, isLoading, error } = useTactical(videoId)

  if (isLoading) return <LoadingState />
  if (error) return <EmptyState title="Failed to load tactical data" description={String(error)} />

  const thirdsData = Object.entries(data?.thirds_occupancy ?? {}).map(([name, value]) => ({ name, value }))
  const chartData = thirdsData.length > 0 ? thirdsData : PITCH_THIRDS

  return (
    <CoachPageShell title="Tactical Insights" subtitle="Derived from tracking data — no extra models required">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Avg Team Width" value={data?.avg_team_width} />
        <StatCard label="Avg Compactness" value={data?.avg_compactness} suffix=" px" />
        <StatCard label="Max Frame" value={data?.max_frame} />
      </div>

      <ChartCard title="Pitch Thirds Occupancy (%)" subtitle="Team shape distribution">
        <SimpleBarChart data={chartData} dataKey="value" />
      </ChartCard>

      <SpotlightCard className="p-4">
        <h3 className="coach-heading mb-3 text-sm font-semibold text-slate-400">Team Summary</h3>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {Object.entries(data?.team_summary ?? {}).map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-slate-500">{k.replace(/_/g, ' ')}</dt>
              <dd className="font-medium text-white">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </SpotlightCard>
    </CoachPageShell>
  )
}
