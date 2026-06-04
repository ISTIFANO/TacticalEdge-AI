export interface CoachReportEntry {
  title: string
  markdown: string
  generated_at?: string
  model?: string
  provider?: string
  error?: boolean
}

export interface CoachReportsPayload {
  generated_at: string | null
  model: string | null
  provider: string | null
  mode: string | null
  reports: Record<string, CoachReportEntry>
}

export interface ChatResponse {
  reply: string
  model?: string | null
  provider?: string | null
  context: string
  video_id: number
}

export interface LiveSnapshot {
  live: {
    frames_processed: number
    total_frames: number
    current_video: number
    phase: string
    progress_pct: number
    partial_ready: boolean
    mode: string
    processing: boolean
    analytics_ready: boolean
    last_updated: string | null
  }
  status: Record<string, unknown>
  overview_summary: Record<string, unknown>
}

export interface TacticalAnalysis {
  video_id: number
  thirds_occupancy: Record<string, number>
  avg_team_width: number
  avg_compactness: number
  max_frame: number
  period_split_frame: number
  team_summary: Record<string, unknown>
  top_distance_players: Record<string, unknown>[]
}

export interface TimelineEvent {
  type: string
  label: string
  frame: number
  team?: string
}

export interface TimelineResponse {
  video_id: number
  max_frame: number
  events: TimelineEvent[]
}

export const REPORT_TABS = [
  { id: 'match_summary', label: 'Match Summary' },
  { id: 'opponent_analysis', label: 'Opponent Analysis' },
  { id: 'lineup_recommendations', label: 'Lineup' },
  { id: 'training_plan', label: 'Training Plan' },
  { id: 'halftime_brief', label: 'Halftime Brief' },
] as const
