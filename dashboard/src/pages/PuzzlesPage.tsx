import { useState } from 'react'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { CoachXpBar } from '../components/CoachXpBar'
import { LoadingState } from '../components/LoadingState'
import { CoachButton } from '../components/coach/CoachButton'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import {
  useCoachProfile,
  useGeneratePuzzle,
  useGamificationCategories,
  useSubmitPuzzle,
} from '../lib/api'
import { useMatchStore } from '../store/matchStore'
import {
  CATEGORY_LABELS,
  DIFFICULTY_COLORS,
  type PuzzleDifficulty,
  type PuzzleSubmitResult,
  type TacticalPuzzle,
} from '../types/gamification'
import { cn } from '../lib/utils'

const DIFFICULTIES: PuzzleDifficulty[] = ['Easy', 'Medium', 'Hard', 'Elite']

export function PuzzlesPage() {
  const videoId = useMatchStore((s) => s.videoId())
  const { data: profile } = useCoachProfile()
  const { data: catData } = useGamificationCategories()
  const generate = useGeneratePuzzle()
  const submit = useSubmitPuzzle()

  const [category, setCategory] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [puzzle, setPuzzle] = useState<TacticalPuzzle | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<PuzzleSubmitResult | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadPuzzle = () => {
    setSelected(null)
    setResult(null)
    setLoadError(null)
    generate.mutate(
      { videoId, category: category || undefined, difficulty: difficulty || undefined },
      {
        onSuccess: (p) => setPuzzle(p),
        onError: (err) => {
          setPuzzle(null)
          setLoadError(
            err instanceof Error
              ? err.message
              : 'Could not load puzzle. Restart the API server: python -m uvicorn api_server:app --host 127.0.0.1 --port 8000',
          )
        },
      },
    )
  }

  const onSubmit = () => {
    if (!puzzle || !selected || result) return
    submit.mutate(
      { puzzleId: puzzle.id, answer: selected },
      { onSuccess: (r) => setResult(r) },
    )
  }

  return (
    <CoachPageShell
      title="Tactical Puzzles"
      subtitle="Decision-making scenarios from match situations — earn XP for correct calls"
    >
      <CoachXpBar />

      <SpotlightCard className="flex flex-wrap gap-3 p-4">        <div>
          <label className="mb-1 block text-xs text-slate-500">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-coach-border bg-coach-navy px-3 py-1.5 text-sm text-white focus:border-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/30"          >
            <option value="">Random</option>
            {(catData?.categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-lg border border-coach-border bg-coach-navy px-3 py-1.5 text-sm text-white focus:border-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/30"          >
            <option value="">Random</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <CoachButton onClick={loadPuzzle} disabled={generate.isPending}>
            {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {puzzle ? 'New puzzle' : 'Start puzzle'}
          </CoachButton>
        </div>
      </SpotlightCard>
      {generate.isPending && !puzzle && <LoadingState message="Generating tactical scenario…" />}

      {loadError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {loadError}
        </div>
      )}

      {puzzle && (
        <SpotlightCard className="space-y-4 p-6">          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {CATEGORY_LABELS[puzzle.category]}
            </span>
            <span className={cn('rounded-md px-2 py-0.5 text-xs font-medium', DIFFICULTY_COLORS[puzzle.difficulty])}>
              {puzzle.difficulty}
            </span>
            <span className="ml-auto text-xs text-coach-lime">+{puzzle.xp_reward} XP</span>          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Scenario</p>
            <p className="leading-relaxed text-slate-200">{puzzle.scenario}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tactical question</p>
            <p className="font-medium text-white">{puzzle.question}</p>
          </div>

          <div className="grid gap-2">
            {(['A', 'B', 'C', 'D'] as const).map((key) => {
              const isSelected = selected === key
              const isCorrect = result?.correct_answer === key
              const isWrong = result && result.your_answer === key && !result.correct
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!!result}
                  onClick={() => setSelected(key)}
                  className={cn(
                    'rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                    isSelected && !result && 'border-coach-lime bg-coach-lime/10 text-white',
                    !isSelected && !result && 'border-coach-border text-slate-300 hover:border-coach-lime/40',                    isCorrect && result && 'border-emerald-500 bg-emerald-500/10 text-emerald-100',
                    isWrong && 'border-rose-500 bg-rose-500/10 text-rose-100',
                    result && !isCorrect && !isWrong && 'opacity-60',
                  )}
                >
                  <span className="mr-2 font-bold text-coach-lime">{key}.</span>                  {puzzle.options[key]}
                </button>
              )
            })}
          </div>

          {!result && (
            <CoachButton onClick={onSubmit} disabled={!selected || submit.isPending} className="w-full">
              {submit.isPending ? 'Checking…' : 'Submit answer'}
            </CoachButton>
          )}
          {result && (
            <div
              className={cn(
                'rounded-lg border p-4',
                result.correct ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-amber-500/40 bg-amber-500/10',
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                {result.correct ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-400" />
                )}
                <span className="font-semibold text-white">
                  {result.correct ? 'Correct!' : 'Not quite'}
                  {' · '}+{result.xp_earned} XP
                </span>
              </div>
              <p className="text-xs font-medium uppercase text-slate-500">Tactical explanation</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">{result.explanation}</p>
              <CoachButton variant="outline" onClick={loadPuzzle} className="mt-4">
                Next puzzle →
              </CoachButton>
            </div>
          )}
        </SpotlightCard>
      )}

      {!puzzle && !generate.isPending && profile && profile.puzzles_solved === 0 && (
        <p className="text-center text-sm text-slate-500">
          Click &quot;Start puzzle&quot; to get your first tactical scenario based on match video {videoId}.
        </p>
      )}
    </CoachPageShell>
  )
}