import type { PlayerStat } from '../types/analytics'
import { playerStatsToRadar } from '../data/chartData'
import type { RosterPlayer } from '../hooks/useMoroccoRoster'

export interface MergedPlayer extends RosterPlayer {
  stats: PlayerStat | null
  tracked: boolean
}

const ROLE_ORDER = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const

const ROLE_LABELS: Record<string, string> = {
  Goalkeeper: 'Goalkeepers',
  Defender: 'Defenders',
  Midfielder: 'Midfielders',
  Forward: 'Forwards',
}

export function statsByShirt(players: PlayerStat[]): Map<number, PlayerStat> {
  const map = new Map<number, PlayerStat>()
  for (const p of players) {
    const n = Number(p.shirt_number ?? p.Shirt_Number ?? p.shirtNumber)
    if (!Number.isFinite(n) || n <= 0 || n > 99) continue
    map.set(n, p)
  }
  return map
}

export function mergeRosterWithStats(
  roster: RosterPlayer[],
  stats: PlayerStat[],
): MergedPlayer[] {
  const map = statsByShirt(stats)
  return roster.map((r) => ({
    ...r,
    stats: map.get(r.shirt_number) ?? null,
    tracked: map.has(r.shirt_number),
  }))
}

export function groupByRole(players: MergedPlayer[]) {
  const groups = new Map<string, MergedPlayer[]>()
  for (const p of players) {
    const role = p.role || 'Forward'
    if (!groups.has(role)) groups.set(role, [])
    groups.get(role)!.push(p)
  }
  return ROLE_ORDER.filter((r) => groups.has(r)).map((role) => ({
    role,
    label: ROLE_LABELS[role] ?? role,
    players: groups.get(role)!.sort((a, b) => a.shirt_number - b.shirt_number),
  }))
}

export function playerRadarData(p: PlayerStat) {
  return playerStatsToRadar({
    goals: Number(p.goals ?? p.Goals ?? 0),
    total_passes: Number(p.total_passes ?? p.Total_passes ?? 0),
    total_shots: Number(p.total_shots ?? p.Total_shots ?? 0),
    tackles_attempted: Number(p.tackles_attempted ?? p.Tackles_attempted ?? 0),
    distance_covered: Number(p.distance_covered ?? p.Distance_covered ?? 0),
    pass_success_rate: Number(p.pass_success_rate ?? 0),
    key_passes: Number(p.key_passes ?? p.Key_passes ?? 0),
  }).map((d) => ({ subject: d.metric, value: d.value, fullMark: d.fullMark }))
}

export function statValue(p: PlayerStat, ...keys: string[]): number | string | undefined {
  for (const k of keys) {
    const v = p[k]
    if (v != null && v !== '') return v as number | string
  }
  return undefined
}
