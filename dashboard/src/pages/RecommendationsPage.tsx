import { useFormations, useLineup, useRecCompare, useRecSquads, useRecTeams } from '../lib/api'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { FormationPitch } from '../components/FormationPitch'
import { AnimatedDataTable } from '../components/coach/AnimatedDataTable'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import type { Column } from '../components/DataTable'
import { ChartCard, ComparisonBarChart } from '../components/Charts'
import { TeamColorBadge } from '../components/TeamColorBadge'
import { formatPercent } from '../lib/utils'
import type { TeamColor } from '../types/analytics'

export function RecommendationsPage() {
  const { data: formations, isLoading: lf } = useFormations()
  const { data: lineup, isLoading: ll } = useLineup()
  const { data: teams, isLoading: lt } = useRecTeams()
  const { data: squads, isLoading: ls } = useRecSquads()
  const { data: compare, isLoading: lc } = useRecCompare()

  const loading = lf || ll || lt || ls || lc
  if (loading) return <LoadingState message="Loading recommendations…" />

  const formationCols: Column<Record<string, unknown>>[] = [
    { key: 'formations', label: 'Formation' },
    { key: 'score', label: 'Score' },
    { key: 'goals', label: 'Goals', sortable: true, align: 'right' },
    { key: 'total_passes', label: 'Passes', sortable: true, align: 'right' },
    { key: 'pass_success', label: 'Pass %', sortable: true, align: 'right', render: (r) => formatPercent(r.pass_success) },
    { key: 'total_possession', label: 'Possession', sortable: true, align: 'right', render: (r) => formatPercent(r.total_possession) },
  ]

  const compareChart = (compare?.comparison ?? [])
    .filter((r) => r.my_team != null && r.opponent != null)
    .slice(0, 8)
    .map((r) => ({
      metric: String(r.metric).replace(/_/g, ' '),
      match_1: Number(r.my_team),
      match_2: Number(r.opponent),
    }))

  const myColor = teams?.my_team?.team_color_rgb as TeamColor | undefined
  const oppColor = teams?.opponent_team?.team_color_rgb as TeamColor | undefined

  return (
    <CoachPageShell title="Recommendations" subtitle="Formations, lineup, and squad comparison (no LLM)">
      <section className="grid gap-4 lg:grid-cols-2">
        <SpotlightCard className="p-5">          <div className="mb-3 flex items-center gap-2">
            <TeamColorBadge color={myColor} />
            <h3 className="font-semibold text-white">My Team</h3>
          </div>
          {teams?.my_team ? (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {['formations', 'goals', 'total_passes', 'pass_success', 'total_possession'].map((k) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500">{k.replace(/_/g, ' ')}</dt>
                  <dd className="font-medium text-slate-200">{String(teams.my_team![k] ?? '—')}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No data</p>
          )}
        </SpotlightCard>
        <SpotlightCard className="p-5">          <div className="mb-3 flex items-center gap-2">
            <TeamColorBadge color={oppColor} />
            <h3 className="font-semibold text-white">Opponent</h3>
          </div>
          {teams?.opponent_team ? (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {['formations', 'goals', 'total_passes', 'pass_success', 'total_possession'].map((k) => (
                <div key={k}>
                  <dt className="text-xs text-slate-500">{k.replace(/_/g, ' ')}</dt>
                  <dd className="font-medium text-slate-200">{String(teams.opponent_team![k] ?? '—')}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-slate-500">No data</p>
          )}
        </SpotlightCard>
      </section>
      {compareChart.length > 0 && (
        <ChartCard title="My Team vs Opponent">
          <ComparisonBarChart data={compareChart} keys={['match_1', 'match_2']} labels={['My Team', 'Opponent']} />
        </ChartCard>
      )}

      <section>
        <h3 className="coach-heading mb-3 text-sm font-semibold text-slate-400">Recommended Starting XI</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <FormationPitch players={lineup?.starting_11 ?? []} />
          <div>
            <AnimatedDataTable
              data={(lineup?.starting_11 ?? []) as Record<string, unknown>[]}
              columns={[
                { key: 'shirt_number', label: '#' },
                { key: 'position', label: 'Pos', render: (r) => String(r.position ?? r.Position ?? '—') },
                { key: 'status', label: 'Status' },
              ]}
            />
            {(lineup?.substitutes?.length ?? 0) > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase text-slate-500">Substitutes</p>
                <AnimatedDataTable
                  data={lineup!.substitutes as Record<string, unknown>[]}
                  columns={[
                    { key: 'shirt_number', label: '#' },
                    { key: 'position', label: 'Pos' },
                  ]}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <h3 className="coach-heading mb-3 text-sm font-semibold text-slate-400">Historical Formation Matches</h3>
        {(formations?.length ?? 0) > 0 ? (
          <AnimatedDataTable data={formations!} columns={formationCols} keyField="formations" />
        ) : (
          <EmptyState title="No formation recommendations" />
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="coach-heading mb-3 text-sm font-semibold text-slate-400">My Squad</h3>
          <AnimatedDataTable
            data={(squads?.my_squad ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'shirt_number', label: '#', sortable: true },
              { key: 'Position', label: 'Pos' },
              { key: 'Total_passes', label: 'Passes', sortable: true, align: 'right' },
              { key: 'Distance_covered', label: 'Dist', sortable: true, align: 'right' },
            ]}
          />
        </div>
        <div>
          <h3 className="coach-heading mb-3 text-sm font-semibold text-slate-400">Opponent Squad</h3>
          <AnimatedDataTable
            data={(squads?.opponent_squad ?? []) as Record<string, unknown>[]}
            columns={[
              { key: 'shirt_number', label: '#', sortable: true },
              { key: 'Position', label: 'Pos' },
              { key: 'Total_passes', label: 'Passes', sortable: true, align: 'right' },
              { key: 'Distance_covered', label: 'Dist', sortable: true, align: 'right' },
            ]}
          />
        </div>
      </section>
    </CoachPageShell>
  )
}