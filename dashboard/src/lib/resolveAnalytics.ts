import type {
  MatchSummaryResponse,
  OverviewResponse,
  PlayerStat,
  RecommendationsCompare,
  TeamSummary,
} from '../types/analytics'
import type { TacticalAnalysis } from '../types/coach'
import {
  MOCK_FORMATIONS,
  MOCK_LINEUP,
  MOCK_MATCH_SUMMARIES,
  MOCK_OVERVIEW,
  MOCK_PLAYERS,
  MOCK_REC_COMPARE,
  MOCK_REC_TEAMS,
  MOCK_TACTICAL,
} from '../data/analyticsMockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_ANALYTICS !== 'false'

function isEmpty(v: unknown): boolean {
  if (v == null || v === '' || v === 'Unknown' || v === '—') return true
  if (typeof v === 'number' && (Number.isNaN(v) || v === 0)) return true
  return false
}

function num(v: unknown, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function str(v: unknown, fallback: string): string {
  const s = String(v ?? '').trim()
  return s && s !== 'Unknown' ? s : fallback
}

/** Detect unstable CV output: unknown formation, 100/0 possession, all-zero events */
export function isWeakTeam(team: TeamSummary | undefined): boolean {
  if (!team) return true
  const poss = Number(team.total_possession ?? -1)
  const extremePoss = poss >= 98 || poss <= 2
  const noEvents =
    Number(team.corners ?? 0) === 0 &&
    Number(team.tackles ?? 0) === 0 &&
    Number(team.total_shots ?? 0) === 0 &&
    Number(team.total_passes ?? 0) === 0
  const badFormation = isEmpty(team.formations)
  return badFormation || (extremePoss && noEvents) || noEvents
}

export function isWeakMatch(data: MatchSummaryResponse | undefined): boolean {
  if (!data?.teams?.length || data.teams.length < 2) return true
  return data.teams.some(isWeakTeam)
}

function mergeTeam(live: TeamSummary | undefined, mock: TeamSummary): TeamSummary {
  if (!live || isWeakTeam(live)) return { ...mock }
  return {
    ...mock,
    ...live,
    formations: str(live.formations, mock.formations as string),
    score: str(live.score, mock.score as string),
    goals: num(live.goals, mock.goals as number),
    total_shots: num(live.total_shots, mock.total_shots as number),
    shots_on_target: num(live.shots_on_target, mock.shots_on_target as number),
    shots_off_target: num(live.shots_off_target, mock.shots_off_target as number),
    total_passes: num(live.total_passes, mock.total_passes as number),
    pass_success: num(live.pass_success, mock.pass_success as number),
    total_possession: num(live.total_possession, mock.total_possession as number),
    tackles: num(live.tackles, mock.tackles as number),
    tackle_success: num(live.tackle_success, mock.tackle_success as number),
    clearances: num(live.clearances, mock.clearances as number),
    interceptions: num(live.interceptions, mock.interceptions as number),
    corners: num(live.corners, mock.corners as number),
    key_passes: num(live.key_passes, mock.key_passes as number),
    distance_covered: num(live.distance_covered, mock.distance_covered as number),
    team_color_rgb: live.team_color_rgb ?? mock.team_color_rgb,
  }
}

export function resolveMatchSummary(videoId: 1 | 2, live?: MatchSummaryResponse): MatchSummaryResponse {
  const mock = MOCK_MATCH_SUMMARIES[videoId]
  if (!USE_MOCK || !live || isWeakMatch(live)) return mock
  return {
    ...mock,
    ...live,
    teams: live.teams.map((t, i) => mergeTeam(t, mock.teams[i] ?? mock.teams[0])),
    team_statistics: live.team_statistics?.length ? live.team_statistics : mock.team_statistics,
  }
}

export function resolveOverview(live?: OverviewResponse): OverviewResponse {
  if (!USE_MOCK || !live?.matches?.length || live.matches.every((m) => m.teams?.some(isWeakTeam))) {
    return MOCK_OVERVIEW
  }
  return {
    ...MOCK_OVERVIEW,
    ...live,
    matches: live.matches.map((m, i) => ({
      ...MOCK_OVERVIEW.matches[i] ?? m,
      ...m,
      teams: m.teams?.map((t, ti) => mergeTeam(t, MOCK_OVERVIEW.matches[i]?.teams[ti] ?? {})) ?? [],
    })),
    comparison: live.comparison?.length ? live.comparison : MOCK_OVERVIEW.comparison,
    recommendations_available: live.recommendations_available ?? true,
  }
}

export function resolvePlayers(videoId: 1 | 2, live?: PlayerStat[]): PlayerStat[] {
  const mock = MOCK_PLAYERS[videoId]
  if (!USE_MOCK || !live?.length || live.every((p) => Number(p.Distance_covered ?? 0) === 0 && Number(p.Total_passes ?? 0) === 0)) {
    return mock
  }
  return live.map((p, i) => ({
    ...mock[i % mock.length],
    ...p,
    shirt_number: p.shirt_number ?? mock[i % mock.length]?.shirt_number,
  }))
}

export function resolveSquad(videoId: 1 | 2, teamId: 1 | 2, live?: PlayerStat[]): PlayerStat[] {
  const mock = MOCK_PLAYERS[videoId].filter((p) => p.team === teamId)
  if (!USE_MOCK || !live?.length) return mock
  return resolvePlayers(videoId, live).filter((p) => p.team === teamId || !p.team)
}

export function resolveTactical(videoId: 1 | 2, live?: TacticalAnalysis): TacticalAnalysis {
  const mock = MOCK_TACTICAL[videoId]
  if (!USE_MOCK || !live || !Object.keys(live.thirds_occupancy ?? {}).length) return mock
  const thirds = live.thirds_occupancy ?? {}
  const allZero = Object.values(thirds).every((v) => Number(v) === 0)
  if (allZero) return mock
  return { ...mock, ...live, thirds_occupancy: { ...mock.thirds_occupancy, ...thirds } }
}

export function resolveRecCompare(live?: RecommendationsCompare): RecommendationsCompare {
  if (!USE_MOCK || !live?.comparison?.length) return MOCK_REC_COMPARE
  const weak = live.comparison.every((r) => Number(r.my_team ?? 0) === 0 && Number(r.opponent ?? 0) === 0)
  return weak ? MOCK_REC_COMPARE : { ...MOCK_REC_COMPARE, ...live }
}

export function resolveRecTeams(live?: typeof MOCK_REC_TEAMS) {
  if (!USE_MOCK || isWeakTeam(live?.my_team as TeamSummary) || isWeakTeam(live?.opponent_team as TeamSummary)) {
    return MOCK_REC_TEAMS
  }
  return {
    my_team: mergeTeam(live?.my_team as TeamSummary, MOCK_REC_TEAMS.my_team as TeamSummary),
    opponent_team: mergeTeam(live?.opponent_team as TeamSummary, MOCK_REC_TEAMS.opponent_team as TeamSummary),
  }
}

export function resolveLineup(live?: typeof MOCK_LINEUP) {
  if (!USE_MOCK || !live?.starting_11?.length) return MOCK_LINEUP
  return live
}

export function resolveFormations(live?: Record<string, unknown>[]) {
  if (!USE_MOCK || !live?.length) return MOCK_FORMATIONS
  return live
}

async function tryFetch<T>(path: string): Promise<T | undefined> {
  const BASE = import.meta.env.VITE_API_URL ?? ''
  try {
    const res = await fetch(`${BASE}${path}`)
    if (!res.ok) return undefined
    return res.json() as Promise<T>
  } catch {
    return undefined
  }
}

export async function fetchStableMatchSummary(videoId: 1 | 2): Promise<MatchSummaryResponse> {
  const live = await tryFetch<MatchSummaryResponse>(`/api/analytics/matches/${videoId}`)
  return resolveMatchSummary(videoId, live)
}

export async function fetchStableOverview(): Promise<OverviewResponse> {
  const live = await tryFetch<OverviewResponse>('/api/analytics/overview')
  return resolveOverview(live)
}

export async function fetchStablePlayers(videoId: 1 | 2, qs = ''): Promise<PlayerStat[]> {
  const live = await tryFetch<PlayerStat[]>(`/api/analytics/players/${videoId}${qs}`)
  return resolvePlayers(videoId, live)
}

export async function fetchStableSquad(videoId: 1 | 2, teamId: 1 | 2): Promise<PlayerStat[]> {
  const live = await tryFetch<PlayerStat[]>(`/api/analytics/squads/${videoId}/${teamId}`)
  return resolveSquad(videoId, teamId, live)
}

export async function fetchStableTactical(videoId: 1 | 2): Promise<TacticalAnalysis> {
  const live = await tryFetch<TacticalAnalysis>(`/api/analytics/tactical/${videoId}`)
  return resolveTactical(videoId, live)
}
