export type PuzzleDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Elite'

export type PuzzleCategory =
  | 'attack'
  | 'counter_attack'
  | 'corner_kick'
  | 'free_kick'
  | 'defensive_transition'
  | 'pressing'
  | 'formation_adjustment'

export interface CoachProfile {
  xp: number
  level: number
  title: string
  xp_to_next_level: number
  next_level_xp: number
  puzzles_solved: number
  puzzles_correct: number
  accuracy_pct: number
}

export interface TacticalPuzzle {
  id: string
  category: PuzzleCategory
  scenario: string
  question: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
  difficulty: PuzzleDifficulty
  xp_reward: number
  match_context?: {
    video_id: number
    formation: string
    possession: number
  }
}

export interface PuzzleSubmitResult {
  correct: boolean
  your_answer: string
  correct_answer: string
  explanation: string
  xp_earned: number
  xp_reward: number
  difficulty: PuzzleDifficulty
  category: PuzzleCategory
  profile: CoachProfile
}

export const CATEGORY_LABELS: Record<PuzzleCategory, string> = {
  attack: 'Attack',
  counter_attack: 'Counter Attack',
  corner_kick: 'Corner Kick',
  free_kick: 'Free Kick',
  defensive_transition: 'Defensive Transition',
  pressing: 'Pressing',
  formation_adjustment: 'Formation Adjustment',
}

export const DIFFICULTY_COLORS: Record<PuzzleDifficulty, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/15',
  Medium: 'text-amber-400 bg-amber-500/15',
  Hard: 'text-orange-400 bg-orange-500/15',
  Elite: 'text-rose-400 bg-rose-500/15',
}
