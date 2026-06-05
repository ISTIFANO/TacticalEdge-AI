import { Mail, MapPin, Phone } from 'lucide-react'
import { BRAND, BRAND_TAGLINE } from '../../lib/brand'

const values = [
  { title: 'Coach-First', desc: 'Every feature is built around real sideline workflows, not generic analytics.' },
  { title: 'Data with Context', desc: 'Numbers mean nothing without tactical narrative — we deliver both.' },
  { title: 'Continuous Learning', desc: 'Gamification keeps preparation engaging, not a chore.' },
  { title: 'Integrity', desc: 'Your match data stays yours. Privacy and security are non-negotiable.' },
]

const team = [
  { name: 'Amine Rahoui', role: 'CEO & Co-Founder', bio: 'Former academy coach turned product builder.' },
  { name: 'Lina Khoury', role: 'Head of AI', bio: 'ML engineer specializing in sports computer vision.' },
  { name: 'Omar Hassani', role: 'Lead Analyst', bio: 'UEFA B licensed coach and tactical consultant.' },
  { name: 'Elena Popov', role: 'Head of Design', bio: 'UX designer for elite sports performance tools.' },
]

const stats = [
  { value: '18,400+', label: 'Matches Analyzed' },
  { value: '2,450+', label: 'Coaches Using Platform' },
  { value: '94,000+', label: 'Tactical Decisions Generated' },
]

export function AboutPage() {
  return (
    <>
      <section className="border-b border-slate-800 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-[#f4af47]">About {BRAND}</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            Built for Morocco 2030 — coaches who refuse to guess
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            {BRAND} started in Casablanca during a hackathon weekend — a team of engineers and football
            coaches asked a simple question: why is match analysis still stuck in spreadsheets and late-night
            video sessions? {BRAND_TAGLINE}
          </p>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-navy-light/40 py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="mt-4 text-lg text-pitch">
              Helping football coaches make smarter tactical decisions using AI and match data.
            </p>
            <p className="mt-4 text-slate-400">
              We combine computer vision, recommendation engines, and conversational AI so every coach —
              from grassroots to semi-pro — can prepare like a top-flight analysis department.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Our Vision</h2>
            <p className="mt-4 text-slate-400">
              A world where every coach has a tactical intelligence partner in their pocket. We envision
              {BRAND} as the global standard for coach development: measurable, engaging, and
              accessible at every level of the game.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white">Core Values</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-slate-800 bg-navy-light p-5">
                <h3 className="font-semibold text-pitch">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white">Meet the Team</h2>
          <p className="mt-2 text-slate-400">Football people and builders united by one goal.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="rounded-xl border border-slate-800 bg-navy-light p-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pitch/20 text-xl font-bold text-pitch">
                  {m.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <h3 className="mt-4 font-semibold text-white">{m.name}</h3>
                <p className="text-xs text-pitch">{m.role}</p>
                <p className="mt-2 text-sm text-slate-500">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-800 bg-gradient-to-r from-pitch/10 to-transparent py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-extrabold text-white">{s.value}</p>
                <p className="mt-2 text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-white">Contact Us</h2>
          <p className="mt-2 text-slate-400">We would love to hear from clubs, federations, and partners.</p>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <form className="space-y-4 rounded-2xl border border-slate-800 bg-navy-light p-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-sm text-slate-400">Name</label>
                <input className="mt-1 w-full rounded-lg border border-slate-700 bg-navy px-3 py-2 text-white outline-none focus:border-pitch" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <input type="email" className="mt-1 w-full rounded-lg border border-slate-700 bg-navy px-3 py-2 text-white outline-none focus:border-pitch" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Message</label>
                <textarea rows={4} className="mt-1 w-full rounded-lg border border-slate-700 bg-navy px-3 py-2 text-white outline-none focus:border-pitch" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-pitch py-2.5 font-semibold text-navy">
                Send message
              </button>
            </form>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Mail className="h-5 w-5 text-pitch" />
                <div>
                  <p className="font-medium text-white">Email</p>
                  <p className="text-slate-400">hello@morocco2030.pi</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="h-5 w-5 text-pitch" />
                <div>
                  <p className="font-medium text-white">Phone</p>
                  <p className="text-slate-400">+212 5XX-XXXXXX</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="h-5 w-5 text-pitch" />
                <div>
                  <p className="font-medium text-white">Office</p>
                  <p className="text-slate-400">Casablanca, Morocco</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
