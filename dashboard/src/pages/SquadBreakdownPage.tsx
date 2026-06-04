import { useMemo, useState } from 'react'
import { useMatchStore } from '../store/matchStore'
import { useRecSquads, useSquad } from '../lib/api'
import { useMoroccoRoster } from '../hooks/useMoroccoRoster'
import { mergeRosterWithStats, playerRadarData, statValue } from '../lib/squadUtils'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { MoroccoSquadView } from '../components/MoroccoSquadView'
import { AnimatedTabBar } from '../components/coach/AnimatedTabBar'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { PlayerCard } from '../components/coach/PlayerCard'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import { ChartCard, PlayerRadarChart } from '../components/Charts'
import { formatNumber } from '../lib/utils'
import type { PlayerStat } from '../types/analytics'

function GenericSquadGrid({
  squad,
  selected,
  onSelect,
}: {
  squad: PlayerStat[]
  selected: number | null
  onSelect: (n: number) => void
}) {
  const valid = squad.filter((p) => {
    const n = Number(p.shirt_number ?? p.Shirt_Number)
    return n > 0 && n <= 99
  })

  const active =
    valid.find((p) => Number(p.shirt_number ?? p.Shirt_Number) === selected) ?? valid[0]

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {valid.map((p, idx) => {
          const num = Number(p.shirt_number ?? p.Shirt_Number)
          const isActive = num === (selected ?? Number(valid[0]?.shirt_number ?? valid[0]?.Shirt_Number))
          return (
            <PlayerCard
              key={num}
              shirtNumber={num}
              stats={`${formatNumber(statValue(p, 'distance_covered', 'Distance_covered'))} m · ${formatNumber(statValue(p, 'total_passes', 'Total_passes'))} passes`}
              active={isActive}
              onClick={() => onSelect(num)}
              index={idx}
            />
          )
        })}
      </div>

      {active && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ChartCard title={`Player #${active.shirt_number ?? active.Shirt_Number} — Radar`}>
            <PlayerRadarChart data={playerRadarData(active)} />
          </ChartCard>
          <SpotlightCard className="p-5">            <h3 className="mb-4 font-semibold text-white">
              #{String(active.shirt_number ?? active.Shirt_Number)} — Match stats
            </h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {(
                [
                  ['Goals', statValue(active, 'goals', 'Goals')],
                  ['Passes', statValue(active, 'total_passes', 'Total_passes')],
                  ['Shots', statValue(active, 'total_shots', 'Total_shots')],
                  ['Distance', statValue(active, 'distance_covered', 'Distance_covered')],
                ] as [string, number | string | undefined][]
              ).map(([label, val]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-200">{formatNumber(val)}</dd>
                </div>
              ))}
            </dl>
          </SpotlightCard>
        </div>
      )}    </>
  )
}

export function SquadBreakdownPage() {
  const videoId = useMatchStore((s) => s.videoId())
  const [teamId, setTeamId] = useState<1 | 2>(1)
  const [selected, setSelected] = useState<number | null>(null)

  const { data: rawSquad, isLoading: loadingRaw, error } = useSquad(videoId, teamId)
  const { data: recSquads } = useRecSquads()
  const { data: moroccoRoster, isLoading: loadingRoster } = useMoroccoRoster()

  const isMorocco = teamId === 1

  // Mapped squad uses recommendation-system corrected shirt numbers (not raw OCR like #141)
  const mappedStats = useMemo(() => {
    if (!recSquads) return []
    return teamId === 1 ? recSquads.my_squad ?? [] : recSquads.opponent_squad ?? []
  }, [recSquads, teamId])

  const statsSource = mappedStats.length > 0 ? mappedStats : (rawSquad ?? [])

  const mergedMorocco = useMemo(() => {
    if (!moroccoRoster?.players) return []
    return mergeRosterWithStats(moroccoRoster.players, statsSource)
  }, [moroccoRoster, statsSource])

  const defaultSelect = useMemo(() => {
    const tracked = mergedMorocco.find((p) => p.tracked)
    if (tracked) return tracked.shirt_number
    return mergedMorocco[0]?.shirt_number ?? null
  }, [mergedMorocco])

  const activeSelected = selected ?? defaultSelect ?? null

  if (loadingRaw || (isMorocco && loadingRoster)) return <LoadingState />
  if (error) return <EmptyState title="Failed to load squad" description={String(error)} />

  const hasMoroccoView = isMorocco && moroccoRoster && mergedMorocco.length > 0
  const genericSquad = statsSource.filter((p) => {
    const n = Number(p.shirt_number ?? p.Shirt_Number)
    return n > 0 && n <= 99
  })

  if (!hasMoroccoView && !genericSquad.length) {
    return (
      <EmptyState
        title="No squad data"
        description={`Run the CV pipeline for video ${videoId}, then open Team ${teamId} again.`}
      />
    )
  }

  const trackedCount = isMorocco
    ? mergedMorocco.filter((p) => p.tracked).length
    : genericSquad.length

  return (
    <CoachPageShell
      title="Squad Breakdown"
      subtitle={
        isMorocco && moroccoRoster
          ? `${moroccoRoster.team} · Group ${moroccoRoster.group} · ${trackedCount} tracked in match`
          : `Video ${videoId} · Team ${teamId} · ${trackedCount} players`
      }
      actions={
        <AnimatedTabBar
          tabs={[
            { id: '1', label: 'Morocco' },
            { id: '2', label: 'Opponent' },
          ]}
          active={String(teamId)}
          onChange={(id) => { setTeamId(Number(id) as 1 | 2); setSelected(null) }}
        />
      }
    >      {mappedStats.length > 0 && (
        <p className="text-xs text-slate-600">
          Shirt numbers mapped via recommendation system (corrected from video OCR).
        </p>
      )}

      {hasMoroccoView && activeSelected != null ? (
        <MoroccoSquadView
          roster={moroccoRoster}
          players={mergedMorocco}
          selected={activeSelected}
          onSelect={setSelected}
        />
      ) : (
        <GenericSquadGrid
          squad={genericSquad}
          selected={selected}
          onSelect={setSelected}
        />
      )}
    </CoachPageShell>
  )
}