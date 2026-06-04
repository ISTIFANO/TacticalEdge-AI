import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOverview } from '../lib/api'
import { LoadingState } from '../components/LoadingState'
import { StatCard } from '../components/StatCard'
import { TeamColorBadge } from '../components/TeamColorBadge'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import {
  ChartCard,
  ComparisonBarChart,
  DonutChart,
  DistanceLineChart,
  FormLineChart,
  LeaguePointsChart,
  MatchTrendChart,
  ShotsBarChart,
  TeamRadarChart,
  TouchHeatmapChart,
  XgGoalsScatter,
} from '../components/Charts'
import {
  generateTouchMap,
  LEAGUE_TABLE,
  MOROCCO_SEASON_TREND,
  PASS_DISTRIBUTION,
  PLAYER_TOUCH_PROFILES,
  radarProfileToChartData,
  SHOTS_BREAKDOWN,
  TEAM_METRICS_COMPARISON,
  TEAM_RADAR_PROFILES,
  XG_SCATTER,
} from '../data/chartData'

export function OverviewPage() {
  const { data, isLoading, error } = useOverview()
  const [radarTeam, setRadarTeam] = useState(TEAM_RADAR_PROFILES[0].team)

  const radarData = useMemo(() => {
    const profile = TEAM_RADAR_PROFILES.find((t) => t.team === radarTeam) ?? TEAM_RADAR_PROFILES[0]
    return radarProfileToChartData(profile)
  }, [radarTeam])

  if (isLoading) return <LoadingState />

  const hasApiMatches = (data?.matches?.length ?? 0) > 0
  const m1 = data?.matches?.[0]
  const m2 = data?.matches?.[1]
  const team1 = m1?.teams?.[0]

  const comparisonData = (data?.comparison ?? []).map((c) => ({
    metric: c.metric.replace(/_/g, ' '),
    match_1: c.match_1,
    match_2: c.match_2,
  }))

  const apiShotsData = (data?.matches ?? []).flatMap((m) =>
    (m.teams ?? []).map((t, ti) => ({
      team: `${m.team_label} T${ti + 1}`,
      on: Number(t.shots_on_target ?? 0),
      off: Number(t.shots_off_target ?? 0),
      blocked: 0,
      xG: Number(t.total_shots ?? 0) * 0.12,
    })),
  )

  const passDonut = team1
    ? [
        { name: 'Accurate', value: Number(team1.pass_success ?? team1.accurate_passes ?? 0) },
        { name: 'Failed', value: Math.max(0, Number(team1.total_passes ?? 0) - Number(team1.accurate_passes ?? team1.pass_success ?? 0)) },
      ].filter((d) => d.value > 0)
    : []

  const distanceData = [...(m1?.top_distance_players ?? [])].map((p, i) => ({
    name: `#${p.shirt_number ?? i}`,
    distance: Number(p.Distance_covered ?? 0),
  }))

  const tackleData = (data?.matches ?? []).map((m) => {
    const t = m.teams?.[0]
    return {
      name: m.team_label,
      tackles: Number(t?.tackles ?? 0),
      success: Number(t?.tackle_success ?? 0),
    }
  })

  const metricsComparison = TEAM_METRICS_COMPARISON.map((m) => ({
    metric: m.metric,
    match_1: m.team1,
    match_2: m.team2,
  }))

  return (
    <CoachPageShell title="Overview" subtitle="Season analytics & cross-match KPIs">
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-2 text-sm text-red-300">
          Live API unavailable — showing season analytics data. {String(error)}
        </p>
      )}
      {/* Season analytics — realistic football data */}
      <section>
        <h2 className="coach-heading mb-1 text-lg font-bold text-white">Season Analytics</h2>
        <p className="mb-4 text-sm text-slate-500">Match trends, xG performance, league context & player touch maps</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="xG & Goals Trend" subtitle="Match-by-match · drag brush to zoom" height="h-72">
            <MatchTrendChart data={MOROCCO_SEASON_TREND} />
          </ChartCard>
          <ChartCard title="xG vs Actual Goals" subtitle="Season totals · diagonal = expected output">
            <XgGoalsScatter data={XG_SCATTER} />
          </ChartCard>
          <ChartCard title="League Points" subtitle="Realistic 38-game distribution">
            <LeaguePointsChart data={LEAGUE_TABLE.map((r) => ({ team: r.team, pts: r.pts, rank: r.rank }))} />
          </ChartCard>
          <ChartCard title="Recent Form" subtitle="Cumulative points · W/D/L markers">
            <FormLineChart form={LEAGUE_TABLE[0].form} labels={['GW34', 'GW35', 'GW36', 'GW37', 'GW38']} />
          </ChartCard>
          <ChartCard
            title="Team Profile Radar"
            subtitle="8 metrics normalized 0–100"
            action={
              <select
                value={radarTeam}
                onChange={(e) => setRadarTeam(e.target.value)}
                className="rounded-lg border border-coach-border bg-coach-surface px-2 py-1 text-xs text-slate-300"
              >
                {TEAM_RADAR_PROFILES.map((t) => (
                  <option key={t.team} value={t.team}>{t.team}</option>
                ))}
              </select>
            }
          >
            <TeamRadarChart data={radarData} teams={[radarTeam]} />
          </ChartCard>
          <ChartCard title="Key Metrics Comparison" subtitle="Morocco vs Brazil · last match">
            <ComparisonBarChart data={metricsComparison} keys={['match_1', 'match_2']} labels={['Morocco', 'Brazil']} sort />
          </ChartCard>
          <ChartCard title="Shots Breakdown" subtitle="Hover for xG · click legend to toggle">
            <ShotsBarChart data={SHOTS_BREAKDOWN} />
          </ChartCard>
          <ChartCard title="Player Touch Map" subtitle="Position-appropriate density · CB / AM / W">
            <TouchHeatmapChart
              profiles={PLAYER_TOUCH_PROFILES}
              getGrid={(id) => {
                const p = PLAYER_TOUCH_PROFILES.find((x) => x.id === id)
                return generateTouchMap(p?.role ?? 'CB')
              }}
            />
          </ChartCard>
        </div>
      </section>

      {/* CV pipeline match data */}
      {hasApiMatches ? (
        <section className="mt-10">
          <h2 className="coach-heading mb-4 text-lg font-bold text-white">Match Pipeline Data</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[m1, m2].filter(Boolean).flatMap((m) =>
              (m!.teams ?? []).slice(0, 1).map((t, i) => (
                <div key={`${m!.video_id}-${i}`} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <TeamColorBadge color={t.team_color_rgb} />
                    {m!.team_label} — Team {i + 1}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard label="Goals" value={t.goals} />
                    <StatCard label="Shots" value={t.total_shots} />
                    <StatCard label="Pass Success" value={t.pass_success} isPercent />
                    <StatCard label="Distance" value={t.distance_covered} suffix=" m" />
                  </div>
                </div>
              )),
            )}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {comparisonData.length > 0 && (
              <ChartCard title="Match Comparison">
                <ComparisonBarChart data={comparisonData} keys={['match_1', 'match_2']} labels={['Match 1', 'Match 2']} />
              </ChartCard>
            )}
            {(apiShotsData.length > 0 ? apiShotsData : SHOTS_BREAKDOWN).length > 0 && (
              <ChartCard title="Shots On / Off Target">
                <ShotsBarChart data={apiShotsData.length > 0 ? apiShotsData : SHOTS_BREAKDOWN} />
              </ChartCard>
            )}
            {(passDonut.length > 0 ? passDonut : PASS_DISTRIBUTION).length > 0 && (
              <ChartCard title="Pass Distribution">
                <DonutChart data={passDonut.length > 0 ? passDonut : PASS_DISTRIBUTION} />
              </ChartCard>
            )}
            {distanceData.length > 0 && (
              <ChartCard title="Top Distance — Match 1" subtitle="Brush to zoom players">
                <DistanceLineChart data={distanceData} />
              </ChartCard>
            )}
            {tackleData.length > 0 && (
              <ChartCard title="Tackle Success by Match">
                <ComparisonBarChart
                  data={tackleData.map((d) => ({ metric: d.name, match_1: d.tackles, match_2: d.success }))}
                  keys={['match_1', 'match_2']}
                  labels={['Tackles', 'Success %']}
                />
              </ChartCard>
            )}
          </div>
        </section>
      ) : (
        <p className="mt-6 text-sm text-slate-500">Run the CV pipeline to populate live match charts above the season analytics.</p>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/app/match', label: 'Match Summary' },
          { to: '/app/players', label: 'Player Stats' },
          { to: '/app/tracking', label: 'Tracking Explorer' },
          { to: '/app/recommendations', label: 'Recommendations' },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="coach-card p-4 text-sm font-medium text-coach-lime hover:border-coach-lime/50"
          >
            → {link.label}
          </Link>
        ))}
      </div>

      {data?.recommendations_available && (
        <p className="mt-4 text-xs text-slate-500">Recommendations data available — see Recommendations page.</p>
      )}
    </CoachPageShell>
  )
}
