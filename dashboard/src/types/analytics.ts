export interface TeamColor {
  r: number
  g: number
  b: number
}

export interface ApiStatus {
  processing: boolean
  analytics_ready: boolean
  videos_ready: number[]
  last_updated: string | null
}

export interface TeamSummary {
  video_id?: number
  team_label?: string
  team_color_rgb?: TeamColor | null
  formations?: string
  score?: string
  goals?: number
  total_shots?: number
  shots_on_target?: number
  shots_off_target?: number
  total_passes?: number
  pass_success?: number
  total_possession?: number
  tackles?: number
  tackle_success?: number
  clearances?: number
  interceptions?: number
  corners?: number
  distance_covered?: number
  player_count?: number
  [key: string]: unknown
}

export interface OverviewMatch {
  video_id: number
  team_label: string
  teams: TeamSummary[]
  top_distance_players: PlayerStat[]
}

export interface OverviewResponse {
  matches: OverviewMatch[]
  comparison: { metric: string; match_1: number; match_2: number }[]
  recommendations_available: boolean
}

export interface MatchSummaryResponse {
  video_id: number
  team_label: string
  teams: TeamSummary[]
  team_statistics: Record<string, unknown>[]
}

export interface PlayerStat {
  shirt_number?: number
  Position?: number | string
  Goals?: number
  Assists?: number
  Total_passes?: number
  Pass_Success?: number
  pass_success_rate?: number
  Total_shots?: number
  Shots_on_Target?: number
  shot_accuracy?: number
  Distance_covered?: number
  Avg_speed?: number
  Highest_speed?: number
  Tackles_attempted?: number
  tackling_success?: number
  team?: number
  team_color?: string
  team_color_rgb?: TeamColor | null
  video_id?: number
  [key: string]: unknown
}

export interface TrackPoint {
  frame: number
  class_label: string
  track_id: number
  bbox: number[] | null
  center_x: number | null
  center_y: number | null
  [key: string]: unknown
}

export interface TrackingResponse {
  total: number
  items: TrackPoint[]
  max_frame: number
  offset: number
  limit: number
}

export interface HeatmapPoint {
  x: number
  y: number
}

export interface LineupPlayer {
  status?: string
  position?: string
  Position?: string
  shirt_number?: number
  player_name?: string
  [key: string]: unknown
}

export interface RecommendationsLineup {
  starting_11: LineupPlayer[]
  substitutes: LineupPlayer[]
}

export interface RecommendationsTeams {
  my_team: Record<string, unknown> | null
  opponent_team: Record<string, unknown> | null
}

export interface RecommendationsCompare {
  comparison: { metric: string; my_team: unknown; opponent: unknown }[]
  my_team: Record<string, unknown>
  opponent_team: Record<string, unknown>
}

export type MatchMode = '1' | '2' | 'both'
