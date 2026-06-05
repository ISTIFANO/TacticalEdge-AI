import { Link } from 'react-router-dom'
import {
  BarChart3,
  Brain,
  ChevronRight,
  Globe,
  MapPin,
  Play,
  Puzzle,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import { BrandName } from '../../components/marketing/BrandName'
import { PlayerImageSlider } from '../../components/marketing/PlayerImageSlider'
import { BRAND, BRAND_TAGLINE } from '../../lib/brand'
import { STADIUMS, TEAMS } from '../../worldcup/data/mockData'

const HERO_BG =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80'
const MOROCCO_STADIUM =
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80'

const features = [
  {
    icon: BarChart3,
    title: 'Match Analysis',
    desc: 'Automated tracking, events, and formation breakdowns for Morocco and every opponent.',
  },
  {
    icon: Target,
    title: 'Tactical Recommendations',
    desc: 'Data-driven lineup and formation suggestions built around your squad profile.',
  },
  {
    icon: Brain,
    title: 'AI Coach Assistant',
    desc: 'Ask about pressing, set pieces, and in-game adjustments in natural language.',
  },
  {
    icon: Puzzle,
    title: 'Tactical Puzzles',
    desc: 'Daily scenarios that sharpen decision-making and earn XP.',
  },
]

function FormPills({ results }: { results: string[] }) {
  const styles: Record<string, string> = {
    W: 'bg-emerald-500/20 text-emerald-400',
    D: 'bg-slate-500/20 text-slate-400',
    L: 'bg-red-500/20 text-red-400',
  }
  return (
    <div className="flex gap-1">
      {results.map((r, i) => (
        <span key={i} className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${styles[r] ?? 'bg-slate-700 text-slate-400'}`}>
          {r}
        </span>
      ))}
    </div>
  )
}

export function HomePage() {
  const moroccoStadiums = STADIUMS.filter((s) => s.country === 'Morocco')
  const hostTeams = TEAMS.filter((t) => ['mar', 'esp', 'por'].includes(t.id))
  const groupTeams = TEAMS.filter((t) => t.group === 'C')
  const moroccoTeam = TEAMS.find((t) => t.id === 'mar')

  return (
    <>
      {/* Hero — Morocco World Cup 2030 */}
      <section className="relative min-h-[90vh] overflow-hidden border-b border-slate-800">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_BG}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#1a0a0a]/85 to-[#0a2818]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-red-700/40 to-transparent" />
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-700/30 to-transparent" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:py-28">
          <div className="flex-1">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-600/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-200">
              <Trophy className="h-3.5 w-3.5" />
              {BRAND} · FIFA World Cup 2030
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              <BrandName className="text-4xl sm:text-5xl lg:text-6xl" accentClassName="text-[#f4af47]" />
              <span className="mt-2 block bg-gradient-to-r from-red-400 via-white to-emerald-400 bg-clip-text text-transparent">
                Morocco 2030
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              {BRAND_TAGLINE}. Analyze the Atlas Lions, scout every opponent, and prepare for the centennial
              World Cup hosted across Morocco, Spain, and Portugal.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-3xl">
              <span title="Morocco">🇲🇦</span>
              <span title="Spain">🇪🇸</span>
              <span title="Portugal">🇵🇹</span>
              <span className="text-sm text-slate-400">Host nations</span>
            </div>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/world-cup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-500"
              >
                Explore World Cup 2030
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f4af47]/50 bg-[#f4af47]/10 px-8 py-3.5 text-base font-semibold text-[#f4af47] transition hover:bg-[#f4af47]/20"
              >
                <Play className="h-5 w-5" />
                Coach Dashboard
              </Link>
            </div>
            {moroccoTeam && (
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-400" />
                  Morocco · Group {moroccoTeam.group}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-pitch" />
                  Coach: {moroccoTeam.coach}
                </span>
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  FIFA Rank #{moroccoTeam.rank}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4 lg:max-w-md">
            <div
              className="relative overflow-hidden rounded-2xl border border-red-500/30 shadow-2xl"
              style={{ backgroundImage: `url('${MOROCCO_STADIUM}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-32">
                <span className="rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold text-white">🇲🇦 MAR</span>
                <h2 className="mt-2 text-2xl font-bold text-white">Grand Stade de Casablanca</h2>
                <p className="text-sm text-slate-300">115,000 capacity · Opening & knockout matches</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Platform', value: BRAND },
                { label: 'Coach', value: moroccoTeam?.coach ?? 'Walid Regragui' },
                { label: 'Top scorer', value: moroccoTeam?.topScorer ?? 'En-Nesyri' },
                { label: 'Payment', value: 'Pi Network + e-Dirham' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-700/80 bg-black/40 p-3 backdrop-blur">
                  <p className="text-[10px] uppercase text-slate-500">{item.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Animated player image slider — web images */}
      <section id="morocco-squad" className="border-b border-slate-800 bg-gradient-to-b from-red-950/20 to-navy py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-400">Atlas Lions</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Morocco Stars — Live Gallery</h2>
              <p className="mt-2 text-slate-400">
                Animated slider · Web-sourced images · Auto-play highlights for WC 2030
              </p>
            </div>
            <Link to="/login" className="text-sm text-[#f4af47] hover:underline">
              Analyze on {BRAND} →
            </Link>
          </div>

          <div className="mt-10">
            <PlayerImageSlider />
          </div>
        </div>
      </section>

      {/* Pi Network map — morocco2030.PI */}
      <section id="pi-map" className="border-b border-slate-800 bg-gradient-to-b from-[#0a2818]/40 to-navy py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#f4af47]">Pi Network</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Carte Pi — Maroc 2030</h2>
              <p className="mt-2 text-slate-400">
                Recherchez des vendeurs ou des Pi · Payez billets, hôtels et forfaits WC
              </p>
            </div>
            <Link to="/world-cup" className="text-sm text-[#f4af47] hover:underline">
              Explorer sur {BRAND} →
            </Link>
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-emerald-800/50 shadow-2xl shadow-emerald-950/30">
            <img
              src="/pi-morocco-map.png"
              alt="Carte Pi Maroc — Recherchez des vendeurs ou des Pi"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* WC 2030 teams */}
      <section id="teams" className="border-b border-slate-800 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C5A572]">FIFA World Cup 2030</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Host nations & Group C</h2>
            <p className="mt-3 text-slate-400">Teams, coaches, form, and qualifier stats</p>
          </div>

          <h3 className="mt-12 mb-4 text-sm font-semibold uppercase text-slate-500">Host nations</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {hostTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-slate-800 bg-navy-light p-6 transition hover:border-[#C5A572]/40"
              >
                <span className="text-5xl">{team.flag}</span>
                <h3 className="mt-4 text-xl font-bold text-white">{team.name}</h3>
                <p className="text-sm text-slate-500">FIFA Rank #{team.rank} · Group {team.group}</p>
                <p className="mt-1 text-sm text-slate-400">Coach: {team.coach}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Played</dt>
                    <dd className="font-bold text-white">{team.played}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">W / D / L</dt>
                    <dd className="font-bold text-white">{team.wins} / {team.draws} / {team.losses}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Goals</dt>
                    <dd className="font-bold text-pitch">{team.goals}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Top scorer</dt>
                    <dd className="font-medium text-slate-300">{team.topScorer}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Possession</dt>
                    <dd className="font-bold text-white">{team.possession}%</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Pass accuracy</dt>
                    <dd className="font-bold text-white">{team.passAccuracy}%</dd>
                  </div>
                </dl>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Form</span>
                  <FormPills results={team.form} />
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt-12 mb-4 text-sm font-semibold uppercase text-slate-500">Group C — Morocco&apos;s group</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupTeams.map((team) => (
              <div key={team.id} className="rounded-xl border border-slate-800 bg-navy-light/80 p-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{team.flag}</span>
                  <div>
                    <h4 className="font-bold text-white">{team.name}</h4>
                    <p className="text-xs text-slate-500">{team.coach}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>Rank #{team.rank}</span>
                  <span>{team.goals} goals</span>
                  <span>{team.cleanSheets} clean sheets</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Morocco stadiums */}
      <section className="border-b border-slate-800 bg-navy-light/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white">Morocco 2030 stadiums</h2>
          <p className="mt-2 text-slate-400">Venues hosting World Cup matches across the kingdom</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {moroccoStadiums.map((s) => (
              <div key={s.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-navy-light">
                <img src={s.image} alt={s.name} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <div>
                      <h3 className="font-semibold text-white">{s.name}</h3>
                      <p className="text-sm text-slate-500">{s.city}, {s.country}</p>
                      <p className="mt-1 text-sm text-pitch">{s.capacity.toLocaleString()} capacity</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/world-cup/stadiums"
            className="mt-6 inline-flex items-center gap-2 text-sm text-[#C5A572] hover:underline"
          >
            View all host stadiums <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-slate-800 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="inline-flex items-center gap-2 text-xs font-medium text-[#f4af47]">
              <Sparkles className="h-3.5 w-3.5" />
              {BRAND} · AI Coaching Platform
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">Prepare Morocco for 2030</h2>
            <p className="mt-3 text-slate-400">From video upload to match-day decisions — one integrated workflow.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-800 bg-navy-light p-6 transition hover:border-pitch/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pitch/15 text-pitch">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-pitch px-8 py-3 font-semibold text-navy hover:bg-emerald-400"
            >
              Start free analysis <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="demo" className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Globe className="mx-auto h-10 w-10 text-[#C5A572]" />
          <h2 className="mt-4 text-2xl font-bold text-white">Morocco · Spain · Portugal 2030</h2>
          <p className="mt-2 text-slate-400">
            Book tickets, explore the fan passport, or dive into coach analytics — all on {BRAND}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/world-cup/tickets" className="rounded-xl bg-[#C5A572] px-6 py-3 font-semibold text-navy">
              World Cup Tickets
            </Link>
            <Link to="/world-cup/passport" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-white hover:border-[#C5A572]">
              Fan Passport
            </Link>
            <Link to="/login" className="rounded-xl border border-[#f4af47] px-6 py-3 font-semibold text-[#f4af47] hover:bg-[#f4af47]/10">
              Coach Login
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
