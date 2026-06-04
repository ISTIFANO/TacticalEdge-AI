import { Link } from 'react-router-dom'
import { BrandName } from '../components/marketing/BrandName'
import {
  Award,
  BarChart3,
  Brain,
  ChevronRight,
  FileText,
  LogOut,
  MessageSquare,
  Puzzle,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  useAssistantMeta,
  useCoachProfile,
  useGeneratePuzzle,
  useMatchLibrary,
  useReports,
} from '../lib/api'
import type { CoachReportEntry } from '../types/coach'
import { PitchBackground } from '../components/coach/PitchBackground'
import { CoachHeroBanner } from '../components/coach/CoachHeroBanner'
import { CoachCard } from '../components/coach/CoachCard'
import { MatchFixtureCard } from '../components/coach/MatchFixtureCard'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import { CoachButton } from '../components/coach/CoachButton'
import { FootballLoader } from '../components/coach/FootballLoader'

const WEEKLY_CHALLENGES = [
  { title: 'Solve 5 puzzles', progress: 3, total: 5, xp: 150 },
  { title: 'Upload 1 match analysis', progress: 1, total: 1, xp: 200 },
  { title: 'Ask the AI coach 3 questions', progress: 2, total: 3, xp: 75 },
]

const BADGES = [
  { id: 'first-analysis', label: 'First Analysis', earned: true, icon: BarChart3 },
  { id: 'puzzle-streak', label: '3-Day Streak', earned: true, icon: Zap },
  { id: 'tactical-mind', label: 'Tactical Mind', earned: true, icon: Brain },
  { id: 'set-piece-pro', label: 'Set Piece Pro', earned: false, icon: Target },
  { id: 'elite-strategist', label: 'Elite Strategist', earned: false, icon: Trophy },
]

function PreparationRating({ accuracy, puzzles }: { accuracy: number; puzzles: number }) {
  const rating = Math.min(99, Math.round(62 + accuracy * 0.25 + puzzles * 2))
  return (
    <SpotlightCard className="p-6">
      <p className="coach-heading text-xs text-slate-500">Preparation Rating</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="coach-stat text-5xl font-extrabold text-coach-lime">{rating}</span>
        <span className="mb-2 text-sm text-slate-500">/ 99</span>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Based on puzzle accuracy, recent analyses, and weekly challenge completion.
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-coach-navy">
        <div className="h-full bg-gradient-to-r from-coach-lime to-emerald-400" style={{ width: `${rating}%` }} />
      </div>
    </SpotlightCard>
  )
}

export function CoachHubPage() {
  const { user, logout } = useAuth()
  const { data: profile } = useCoachProfile()
  const { data: library } = useMatchLibrary()
  const { data: reports } = useReports()
  const { data: assistantMeta } = useAssistantMeta()
  const generate = useGeneratePuzzle()

  useEffect(() => {
    generate.mutate({ videoId: 1, difficulty: 'medium' })
  }, [])

  const puzzle = generate.data
  const recentMatches = library?.matches?.slice(0, 4) ?? [
    { id: 1, label: 'Team vs Opponent — Latest', created_at: new Date().toISOString() },
  ]
  const latestReports: ({ id: string } & CoachReportEntry)[] = reports?.reports
    ? Object.entries(reports.reports).slice(0, 3).map(([id, r]) => ({ id, ...r }))
    : []

  return (
    <div className="coach-root relative min-h-screen bg-coach-navy">
      <PitchBackground />
      <div className="relative z-10">
        <header className="border-b border-coach-border bg-coach-surface/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
              <BrandName accentClassName="text-coach-lime" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/app"
                className="hidden rounded-lg border border-coach-border px-4 py-2 text-sm text-slate-300 hover:border-coach-lime/50 sm:inline-block"
              >
                Full Analytics
              </Link>
              <Link to="/app/upload">
                <CoachButton>New Analysis</CoachButton>
              </Link>
              <button type="button" onClick={logout} className="text-slate-500 hover:text-white" aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
          <CoachHeroBanner
            title="Coach Dashboard"
            subtitle="Welcome back — your preparation hub at a glance."
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <CoachCard
              name={user?.name ?? 'Coach'}
              club={user?.club}
              role={user?.role}
              level={user?.coachingLevel ?? 'Coach'}
              initials={user?.name?.split(' ').map((n: string) => n[0]).join('') ?? 'CZ'}
            />
            <div className="lg:col-span-2">
              <PreparationRating
                accuracy={profile?.accuracy_pct ?? 72}
                puzzles={profile?.puzzles_solved ?? 4}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="coach-heading font-semibold text-white">Recent Matches</h3>
                <Link to="/app/match" className="text-xs text-coach-lime hover:underline">View all</Link>
              </div>
              <ul className="mt-4 space-y-3">
                {recentMatches.map((m: { id: number; label: string; created_at: string }, i: number) => (
                  <MatchFixtureCard
                    key={m.id}
                    home={m.label}
                    date={new Date(m.created_at).toLocaleDateString()}
                    index={i}
                  />
                ))}
              </ul>
            </SpotlightCard>

            <SpotlightCard className="p-6">
              <div className="flex items-center gap-2">
                <Puzzle className="h-5 w-5 text-coach-lime" />
                <h3 className="coach-heading font-semibold text-white">Tactical Puzzle of the Day</h3>
              </div>
              {generate.isPending && <FootballLoader message="Loading puzzle…" className="py-8" />}
              {puzzle && (
                <div className="mt-4">
                  <span className="rounded-full bg-coach-lime/15 px-2 py-0.5 text-xs capitalize text-coach-lime">
                    {puzzle.difficulty} · +{puzzle.xp_reward} XP
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{puzzle.scenario}</p>
                  <Link
                    to="/app/puzzles"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-coach-lime hover:underline"
                  >
                    Solve now <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
              {generate.isError && (
                <p className="mt-4 text-sm text-slate-500">
                  Start the API server to load live puzzles.{' '}
                  <Link to="/app/puzzles" className="text-coach-lime">Open puzzles</Link>
                </p>
              )}
            </SpotlightCard>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <SpotlightCard className="p-6">
              <h3 className="coach-heading flex items-center gap-2 font-semibold text-white">
                <Target className="h-5 w-5 text-coach-lime" />
                Weekly Challenges
              </h3>
              <ul className="mt-4 space-y-4">
                {WEEKLY_CHALLENGES.map((c) => (
                  <li key={c.title}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{c.title}</span>
                      <span className="text-coach-lime">+{c.xp} XP</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-coach-navy">
                      <div
                        className="h-full bg-coach-lime"
                        style={{ width: `${(c.progress / c.total) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {c.progress}/{c.total} complete
                    </p>
                  </li>
                ))}
              </ul>
            </SpotlightCard>

            <SpotlightCard className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="coach-heading flex items-center gap-2 font-semibold text-white">
                  <FileText className="h-5 w-5 text-coach-lime" />
                  Latest Reports
                </h3>
                <Link to="/app/reports" className="text-xs text-coach-lime hover:underline">All reports</Link>
              </div>
              <ul className="mt-4 space-y-3">
                {latestReports.length > 0 ? (
                  latestReports.map((r) => (
                    <li key={r.id} className="rounded-lg border border-coach-border bg-coach-navy px-3 py-2">
                      <p className="text-sm font-medium text-white">{r.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{r.id.replace(/_/g, ' ')}</p>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="rounded-lg border border-coach-border bg-coach-navy px-3 py-2 text-sm text-slate-400">
                      Pre-Match Tactical Brief
                    </li>
                    <li className="rounded-lg border border-coach-border bg-coach-navy px-3 py-2 text-sm text-slate-400">
                      Halftime Adjustment Report
                    </li>
                    <li className="rounded-lg border border-coach-border bg-coach-navy px-3 py-2 text-sm text-slate-400">
                      Post-Match Performance Summary
                    </li>
                  </>
                )}
              </ul>
            </SpotlightCard>

            <SpotlightCard className="p-6">
              <h3 className="coach-heading flex items-center gap-2 font-semibold text-white">
                <Award className="h-5 w-5 text-coach-lime" />
                Badge Collection
              </h3>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {BADGES.map((b) => (
                  <div
                    key={b.id}
                    className={`flex flex-col items-center rounded-xl border p-3 text-center ${
                      b.earned ? 'border-coach-lime/30 bg-coach-lime/5' : 'border-coach-border opacity-40 grayscale'
                    }`}
                  >
                    <b.icon className="h-6 w-6 text-coach-lime" />
                    <p className="mt-2 text-[10px] leading-tight text-slate-400">{b.label}</p>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </div>

          <SpotlightCard className="border-coach-lime/20 bg-gradient-to-r from-coach-lime/10 to-transparent p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-coach-lime/20">
                  <MessageSquare className="h-6 w-6 text-coach-lime" />
                </div>
                <div>
                  <h3 className="coach-heading font-semibold text-white">AI Coach Assistant</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Ask about formations, set pieces, or in-game adjustments — powered by your match data.
                  </p>
                  {assistantMeta?.suggested_prompts?.[0] && (
                    <p className="mt-2 text-xs text-slate-500">
                      Try: &ldquo;{assistantMeta.suggested_prompts[0]}&rdquo;
                    </p>
                  )}
                </div>
              </div>
              <Link to="/app/assistant">
                <CoachButton>
                  Open Assistant
                  <ChevronRight className="ml-1 inline h-4 w-4" />
                </CoachButton>
              </Link>
            </div>
          </SpotlightCard>
        </main>
      </div>
    </div>
  )
}
