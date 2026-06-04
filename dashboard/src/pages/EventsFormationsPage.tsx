import { useMatchStore } from '../store/matchStore'
import { useMatchSummary } from '../lib/api'
import { LoadingState } from '../components/LoadingState'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import { ChartCard, ComparisonBarChart } from '../components/Charts'
import { TeamColorBadge } from '../components/TeamColorBadge'
import { MOCK_TEAM_NAMES } from '../data/analyticsMockData'

export function EventsFormationsPage() {
  const videoId = useMatchStore((s) => s.videoId())
  const { data, isLoading } = useMatchSummary(videoId)

  if (isLoading) return <LoadingState />
  if (!data?.teams?.length) return null

  const teamNames = MOCK_TEAM_NAMES[videoId as 1 | 2] ?? ['Team 1', 'Team 2']
  const eventMetrics = ['corners', 'interceptions', 'clearances', 'tackles', 'total_shots'] as const

  const t1 = data.teams[0]
  const t2 = data.teams[1]
  const poss1 = Number(t1?.total_possession ?? 50)
  const poss2 = Number(t2?.total_possession ?? 50)

  return (
    <CoachPageShell title="Events & Formations" subtitle="Formations, set pieces, and defensive actions">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.teams.map((team, i) => (
          <SpotlightCard key={i} className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <TeamColorBadge color={team.team_color_rgb} className="h-8 w-8" />
              <div>
                <h3 className="coach-heading text-lg font-semibold text-white">{teamNames[i]}</h3>
                <p className="coach-stat text-2xl font-bold text-coach-lime">{String(team.formations ?? '—')}</p>
                <p className="text-xs text-slate-500">Score {String(team.score ?? '—')} · {Number(team.total_possession ?? 0)}% possession</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {(
                [
                  ['Corners', team.corners],
                  ['Interceptions', team.interceptions],
                  ['Clearances', team.clearances],
                  ['Tackles', team.tackles],
                  ['Tackle Success', team.tackle_success],
                  ['Key Passes', team.key_passes],
                  ['Shots', team.total_shots],
                  ['Pass Success %', team.pass_success],
                ] as [string, unknown][]
              ).map(([label, val]) => (
                <div key={label} className="rounded-lg bg-coach-navy/60 px-3 py-2">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-semibold text-white">{String(val ?? '—')}</dd>
                </div>
              ))}
            </dl>
          </SpotlightCard>
        ))}
      </div>

      <ChartCard title="Defensive Actions Comparison" subtitle={`${teamNames[0]} vs ${teamNames[1]}`}>
        <ComparisonBarChart
          data={eventMetrics.map((m) => ({
            metric: m.replace(/_/g, ' '),
            match_1: Number(t1?.[m] ?? 0),
            match_2: Number(t2?.[m] ?? 0),
          }))}
          keys={['match_1', 'match_2']}
          labels={[teamNames[0], teamNames[1]]}
        />
      </ChartCard>

      <ChartCard title="Possession Split" subtitle="Share of ball per team">
        <ComparisonBarChart
          data={[{ metric: 'Possession %', match_1: poss1, match_2: poss2 }]}
          keys={['match_1', 'match_2']}
          labels={[`${teamNames[0]} %`, `${teamNames[1]} %`]}
        />
      </ChartCard>
    </CoachPageShell>
  )
}
