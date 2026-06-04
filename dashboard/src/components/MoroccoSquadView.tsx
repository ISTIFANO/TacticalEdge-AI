import { Activity, Shield, Star, Target, Zap } from 'lucide-react'
import { ChartCard, PlayerRadarChart } from './Charts'
import { formatNumber } from '../lib/utils'
import type { MergedPlayer } from '../lib/squadUtils'
import { playerRadarData, statValue } from '../lib/squadUtils'
import type { MoroccoRoster } from '../hooks/useMoroccoRoster'

interface MoroccoSquadViewProps {
  roster: MoroccoRoster
  players: MergedPlayer[]
  selected: number
  onSelect: (shirt: number) => void
}

function PlayerAvatar({ player, size = 'md' }: { player: MergedPlayer; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-24 w-24' : size === 'md' ? 'h-14 w-14' : 'h-11 w-11'
  const text = size === 'lg' ? 'text-2xl' : 'text-sm'
  if (player.image) {
    return (
      <img
        src={player.image}
        alt={player.name}
        className={`${dim} rounded-2xl object-cover object-top ring-2 ring-red-500/40`}
      />
    )
  }
  return (
    <div
      className={`${dim} flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-600/30 to-red-900/20 ${text} font-bold text-red-300 ring-2 ring-red-500/30`}
    >
      {player.shirt_number}
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-navy/80 px-2.5 py-1 text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

export function MoroccoSquadView({ roster, players, selected, onSelect }: MoroccoSquadViewProps) {
  const active = players.find((p) => p.shirt_number === selected) ?? players.find((p) => p.tracked) ?? players[0]
  const trackedCount = players.filter((p) => p.tracked).length

  const groups = [
    { label: 'Goalkeepers', filter: (p: MergedPlayer) => p.role === 'Goalkeeper' },
    { label: 'Defenders', filter: (p: MergedPlayer) => p.role === 'Defender' },
    { label: 'Midfielders', filter: (p: MergedPlayer) => p.role === 'Midfielder' },
    { label: 'Forwards', filter: (p: MergedPlayer) => p.role === 'Forward' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-r from-red-950/50 via-navy-light to-navy p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red-500/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white">MAR</span>
              <span className="text-xs text-slate-400">Group {roster.group}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{roster.team} National Team</h3>
            <p className="mt-1 text-sm text-slate-400">
              {trackedCount} players tracked in match · {players.length} in squad roster
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Shield, text: roster.key_stars.captain },
              { icon: Target, text: roster.key_stars.goalkeeper },
              { icon: Zap, text: roster.key_stars.playmaker },
              { icon: Activity, text: roster.key_stars.midfield_leader },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-200"
              >
                <Icon className="h-3 w-3" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Position groups */}
      {groups.map(({ label, filter }) => {
        const groupPlayers = players.filter(filter)
        if (!groupPlayers.length) return null
        return (
          <section key={label}>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <span className="h-px flex-1 bg-slate-800" />
              {label}
              <span className="h-px flex-1 bg-slate-800" />
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {groupPlayers.map((p) => {
                const isActive = p.shirt_number === (selected || active?.shirt_number)
                const s = p.stats
                return (
                  <button
                    key={p.shirt_number}
                    type="button"
                    onClick={() => onSelect(p.shirt_number)}
                    className={`group relative overflow-hidden rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'border-pitch bg-pitch/10 shadow-lg shadow-pitch/10'
                        : 'border-slate-800 bg-navy-light hover:border-red-500/30 hover:bg-navy-lighter'
                    }`}
                  >
                    {p.key_star && (
                      <Star className="absolute right-3 top-3 z-10 h-4 w-4 fill-amber-400 text-amber-400" />
                    )}
                    <div className="flex gap-3 p-4">
                      <div className="relative shrink-0">
                        <PlayerAvatar player={p} size="md" />
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white ring-2 ring-navy-light">
                          {p.shirt_number}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{p.name}</p>
                        <p className="text-xs text-red-300/80">{p.position}</p>
                        {p.tracked && s ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <StatPill label="G" value={formatNumber(statValue(s, 'goals', 'Goals'))} />
                            <StatPill label="A" value={formatNumber(statValue(s, 'assists', 'Assists'))} />
                            <StatPill label="Pass" value={formatNumber(statValue(s, 'total_passes', 'Total_passes'))} />
                            <StatPill label="Dist" value={`${formatNumber(statValue(s, 'distance_covered', 'Distance_covered'))}m`} />
                          </div>
                        ) : (
                          <p className="mt-2 text-[10px] text-slate-600">Not detected in this match</p>
                        )}
                      </div>
                    </div>
                    {p.tracked && (
                      <div className="border-t border-slate-800/80 px-4 py-1.5">
                        <span className="text-[10px] font-medium text-pitch">● Match data available</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Selected player detail */}
      {active && (
        <section className="overflow-hidden rounded-2xl border border-slate-700/80 bg-navy-light">
          <div className="grid lg:grid-cols-5">
            <div className="relative bg-gradient-to-br from-red-900/40 to-navy p-6 lg:col-span-2">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <PlayerAvatar player={active} size="lg" />
                <p className="mt-4 text-3xl font-extrabold text-white">
                  #{active.shirt_number}
                  {active.key_star && <Star className="ml-2 inline h-6 w-6 fill-amber-400 text-amber-400" />}
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">{active.name}</h3>
                <p className="text-sm text-red-300">{active.position}</p>
                {active.notes && <p className="mt-2 text-xs text-slate-400">{active.notes}</p>}
              </div>
            </div>
            <div className="p-6 lg:col-span-3">
              {active.stats ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <ChartCard title="Performance radar" className="border-0 bg-navy/50 p-0">
                    <PlayerRadarChart data={playerRadarData(active.stats)} />
                  </ChartCard>
                  <div>
                    <h4 className="mb-3 text-sm font-semibold uppercase text-slate-400">Match statistics</h4>
                    <dl className="grid grid-cols-2 gap-3">
                      {(
                        [
                          ['Goals', statValue(active.stats, 'goals', 'Goals')],
                          ['Assists', statValue(active.stats, 'Assists', 'assists')],
                          ['Passes', statValue(active.stats, 'total_passes', 'Total_passes')],
                          ['Pass %', statValue(active.stats, '%_pass_success', 'pass_success_rate')],
                          ['Shots', statValue(active.stats, 'total_shots', 'Total_shots')],
                          ['Shots on target', statValue(active.stats, 'shots_on_target', 'Shots_on_Target')],
                          ['Key passes', statValue(active.stats, 'key_passes', 'Key_passes')],
                          ['Saves', statValue(active.stats, 'saved_shots', 'Saved_shots')],
                          ['Distance', statValue(active.stats, 'distance_covered', 'Distance_covered')],
                          ['Top speed', statValue(active.stats, 'highest_speed', 'Highest_speed')],
                          ['Tackles', statValue(active.stats, 'tackles_attempted', 'Tackles_attempted')],
                          ['Clearances', statValue(active.stats, 'clearances', 'Clearances')],
                          ['Interceptions', statValue(active.stats, 'interceptions', 'Interceptions')],
                        ] as [string, number | string | undefined][]
                      ).map(([label, val]) => (
                        <div key={label} className="rounded-xl border border-slate-800 bg-navy px-3 py-2">
                          <dt className="text-[10px] uppercase text-slate-500">{label}</dt>
                          <dd className="text-lg font-semibold text-white">{formatNumber(val)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
                  <p className="text-slate-400">No match tracking data for this player yet.</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Run the full CV pipeline or select a player with match data (highlighted in green).
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
