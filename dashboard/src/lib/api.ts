import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ApiStatus,
  HeatmapPoint,
  PlayerStat,
  RecommendationsCompare,
  RecommendationsLineup,
  RecommendationsTeams,
  TrackingResponse,
} from '../types/analytics'
import type { CoachProfile, PuzzleSubmitResult, TacticalPuzzle } from '../types/gamification'
import type { NewsArticle, NewsArticleSummary } from '../types/news'
import type { CoachReportsPayload, LiveSnapshot, TimelineResponse } from '../types/coach'
import {
  fetchStableMatchSummary,
  fetchStableOverview,
  fetchStablePlayers,
  fetchStableSquad,
  fetchStableTactical,
  resolveFormations,
  resolveLineup,
  resolveRecCompare,
  resolveRecTeams,
} from './resolveAnalytics'
import { MOCK_PLAYERS } from '../data/analyticsMockData'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `API ${path}: ${res.status}`)
  }
  return res.json()
}

export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: () => fetchJson<ApiStatus>('/api/status'),
    refetchInterval: (q) => (q.state.data?.processing ? 3000 : false),
  })
}

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: () => fetchStableOverview(),
  })
}

export function useMatchSummary(videoId: number) {
  return useQuery({
    queryKey: ['match', videoId],
    queryFn: () => fetchStableMatchSummary(videoId as 1 | 2),
    enabled: videoId === 1 || videoId === 2,
  })
}

export function usePlayers(videoId: number, team?: number, minDistance = 0) {
  const params = new URLSearchParams()
  if (team != null) params.set('team', String(team))
  if (minDistance > 0) params.set('min_distance', String(minDistance))
  const qs = params.toString()
  return useQuery({
    queryKey: ['players', videoId, team, minDistance],
    queryFn: async () => {
      const all = await fetchStablePlayers(videoId as 1 | 2, qs ? `?${qs}` : '')
      if (team != null) return all.filter((p) => Number(p.team) === team)
      if (minDistance > 0) return all.filter((p) => Number(p.Distance_covered ?? 0) >= minDistance)
      return all
    },
    enabled: videoId === 1 || videoId === 2,
  })
}

export function useSquad(videoId: number, teamId: number) {
  return useQuery({
    queryKey: ['squad', videoId, teamId],
    queryFn: () => fetchStableSquad(videoId as 1 | 2, teamId as 1 | 2),
    enabled: (videoId === 1 || videoId === 2) && (teamId === 1 || teamId === 2),
  })
}

export function useTracking(
  videoId: number,
  opts: { frame?: number; classLabel?: string; limit?: number; offset?: number } = {},
) {
  const { frame, classLabel, limit = 500, offset = 0 } = opts
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (frame != null) params.set('frame', String(frame))
  if (classLabel) params.set('class_label', classLabel)
  return useQuery({
    queryKey: ['tracking', videoId, frame, classLabel, limit, offset],
    queryFn: () => fetchJson<TrackingResponse>(`/api/analytics/tracking/${videoId}?${params}`),
    enabled: videoId === 1 || videoId === 2,
  })
}

export function useHeatmap(videoId: number, sampleEvery = 10) {
  return useQuery({
    queryKey: ['heatmap', videoId, sampleEvery],
    queryFn: () => fetchJson<HeatmapPoint[]>(`/api/analytics/tracking/${videoId}/heatmap?sample_every=${sampleEvery}`),
    enabled: videoId === 1 || videoId === 2,
  })
}

export function useFormations() {
  return useQuery({
    queryKey: ['formations'],
    queryFn: async () => {
      const live = await fetchJson<Record<string, unknown>[]>('/api/recommendations/formations').catch(() => undefined)
      return resolveFormations(live)
    },
  })
}

export function useLineup() {
  return useQuery({
    queryKey: ['lineup'],
    queryFn: async () => {
      const live = await fetchJson<RecommendationsLineup>('/api/recommendations/lineup').catch(() => undefined)
      return resolveLineup(live)
    },
  })
}

export function useRecTeams() {
  return useQuery({
    queryKey: ['rec-teams'],
    queryFn: async () => {
      const live = await fetchJson<RecommendationsTeams>('/api/recommendations/teams').catch(() => undefined)
      return resolveRecTeams(live)
    },
  })
}

export function useRecSquads() {
  return useQuery({
    queryKey: ['rec-squads'],
    queryFn: async () => {
      try {
        return await fetchJson<{ my_squad: PlayerStat[]; opponent_squad: PlayerStat[] }>('/api/recommendations/squads')
      } catch {
        return { my_squad: MOCK_PLAYERS[1].filter((p) => p.team === 1), opponent_squad: MOCK_PLAYERS[1].filter((p) => p.team === 2) }
      }
    },
  })
}

export function useRecCompare() {
  return useQuery({
    queryKey: ['rec-compare'],
    queryFn: async () => {
      const live = await fetchJson<RecommendationsCompare>('/api/recommendations/compare').catch(() => undefined)
      return resolveRecCompare(live)
    },
  })
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => fetchJson<CoachReportsPayload>('/api/reports'),
  })
}

export function useGenerateReports() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { mode?: string; reports?: string[] }) =>
      fetch(`${BASE}/api/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reports: body.reports ?? ['all'], mode: body.mode ?? 'full' }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json() as Promise<CoachReportsPayload>
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  })
}

export function useLiveSnapshot() {
  return useQuery({
    queryKey: ['live'],
    queryFn: () => fetchJson<LiveSnapshot>('/api/live/snapshot'),
    refetchInterval: (q) =>
      q.state.data?.live?.processing || q.state.data?.live?.phase === 'cv' ? 3000 : 10000,
  })
}

export function useTactical(videoId: number) {
  return useQuery({
    queryKey: ['tactical', videoId],
    queryFn: () => fetchStableTactical(videoId as 1 | 2),
    enabled: videoId === 1 || videoId === 2,
  })
}

export function useTimeline(videoId: number) {
  return useQuery({
    queryKey: ['timeline', videoId],
    queryFn: () => fetchJson<TimelineResponse>(`/api/analytics/timeline/${videoId}`),
    enabled: videoId === 1 || videoId === 2,
  })
}

export async function sendChat(message: string, context: string, videoId: number) {
  const res = await fetch(`${BASE}/api/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context, video_id: videoId }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export function useAssistantMeta() {
  return useQuery({
    queryKey: ['assistant-meta'],
    queryFn: () => fetchJson<{ suggested_prompts: string[] }>('/api/assistant/history'),
  })
}

export function useMatchLibrary() {
  return useQuery({
    queryKey: ['match-library'],
    queryFn: () => fetchJson<{ matches: { id: number; label: string; created_at: string }[] }>('/api/matches'),
  })
}

export function useCoachProfile() {
  return useQuery({
    queryKey: ['coach-profile'],
    queryFn: () => fetchJson<CoachProfile>('/api/gamification/profile'),
  })
}

export function useGamificationCategories() {
  return useQuery({
    queryKey: ['puzzle-categories'],
    queryFn: () => fetchJson<{ categories: { id: string; label: string }[] }>('/api/gamification/categories'),
  })
}

export function useGeneratePuzzle() {
  return useMutation({
    mutationFn: (opts: { videoId: number; category?: string; difficulty?: string }) => {
      const params = new URLSearchParams({ video_id: String(opts.videoId) })
      if (opts.category) params.set('category', opts.category)
      if (opts.difficulty) params.set('difficulty', opts.difficulty)
      return fetchJson<TacticalPuzzle>(`/api/gamification/puzzle?${params}`)
    },
  })
}

export function useSubmitPuzzle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { puzzleId: string; answer: string }) =>
      fetch(`${BASE}/api/gamification/puzzle/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzle_id: body.puzzleId, answer: body.answer }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json() as Promise<PuzzleSubmitResult>
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coach-profile'] }),
  })
}

export interface PipelineStatus {
  team_video_ready: boolean
  opponent_video_ready: boolean
  team_path: string
  opponent_path: string
  pipeline_running: boolean
  ready_to_run: boolean
}

export function usePipelineStatus() {
  return useQuery({
    queryKey: ['pipeline-status'],
    queryFn: () => fetchJson<PipelineStatus>('/api/pipeline/status'),
    refetchInterval: (q) => (q.state.data?.pipeline_running ? 4000 : 15000),
  })
}

export function useUploadVideos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (opts: { teamFile: File; opponentFile: File; mode: string }) => {
      const fd = new FormData()
      fd.append('team_video', opts.teamFile)
      fd.append('opponent_video', opts.opponentFile)
      const up = await fetch(`${BASE}/api/pipeline/upload`, { method: 'POST', body: fd })
      if (!up.ok) throw new Error(await up.text())
      const start = await fetch(`${BASE}/api/pipeline/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: opts.mode }),
      })
      if (!start.ok) throw new Error(await start.text())
      return start.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline-status'] })
      qc.invalidateQueries({ queryKey: ['status'] })
      qc.invalidateQueries({ queryKey: ['live'] })
    },
  })
}

export function useStartPipelineFromUrls() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (opts: { teamUrl: string; opponentUrl: string; mode: string }) =>
      fetch(`${BASE}/api/pipeline/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: opts.mode,
          team_url: opts.teamUrl,
          opponent_url: opts.opponentUrl,
        }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline-status'] })
      qc.invalidateQueries({ queryKey: ['status'] })
      qc.invalidateQueries({ queryKey: ['live'] })
    },
  })
}

export function useNewsList() {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      try {
        return await fetchJson<{ articles: NewsArticleSummary[] }>('/api/news')
      } catch {
        const res = await fetch(`${BASE}/coach-news.json`)
        if (!res.ok) throw new Error('News unavailable')
        const data = (await res.json()) as { articles: NewsArticleSummary[] }
        return {
          articles: data.articles.map(({ id, title, date, author, category, image_url, excerpt }) => ({
            id,
            title,
            date,
            author,
            category,
            image_url,
            excerpt,
          })),
        }
      }
    },
  })
}

export function useNewsArticle(articleId: string | undefined) {
  return useQuery({
    queryKey: ['news', articleId],
    queryFn: async () => {
      try {
        return await fetchJson<NewsArticle>(`/api/news/${articleId}`)
      } catch {
        const res = await fetch(`${BASE}/coach-news.json`)
        if (!res.ok) throw new Error('Article unavailable')
        const data = (await res.json()) as { articles: NewsArticle[] }
        const article = data.articles.find((a) => a.id === articleId)
        if (!article) throw new Error('Article not found')
        return article
      }
    },
    enabled: Boolean(articleId),
  })
}
