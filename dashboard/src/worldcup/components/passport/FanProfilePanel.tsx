import type { ReactNode } from 'react'
import { Hotel, Plane, Star, Ticket } from 'lucide-react'
import { useBookings } from '../../context/BookingContext'
import { useWCAuth } from '../../context/WCAuthContext'
import { usePassport } from '../../context/PassportContext'
import { TEAMS } from '../../data/mockData'

export function FanProfilePanel() {
  const { user } = useWCAuth()
  const { bookings } = useBookings()
  const { passport } = usePassport()

  if (!user || !passport) return null

  const team = TEAMS.find((t) => t.id === (user.preferredTeam ?? 'mar'))
  const ticketBookings = bookings.filter((b) => b.type === 'ticket')
  const hotelBookings = bookings.filter((b) => b.type === 'hotel')
  const flightBookings = bookings.filter((b) => b.type === 'flight')

  return (
    <section className="wc-card overflow-hidden">
      <div className="bg-gradient-to-r from-[var(--wc-gold)]/20 via-transparent to-[#f4af47]/10 p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="passport-avatar flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--wc-gold)] to-[#8B6914] text-3xl font-black text-black shadow-lg">
            {team?.flag ?? '🌍'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="font-mono text-xs text-[var(--wc-muted)]">{passport.passportId}</p>
            <p className="mt-1 text-sm text-[var(--wc-muted)]">{user.country} · Fan since 2030</p>
          </div>
          <div className="ms-auto text-center">
            <p className="text-3xl font-black text-[var(--wc-gold)]">{passport.loyaltyPoints}</p>
            <p className="text-xs uppercase tracking-wide text-[var(--wc-muted)]">Loyalty Points</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Star className="h-4 w-4" />} label="Favorite Team" value={`${team?.flag ?? ''} ${team?.name ?? '—'}`} />
        <Stat icon={<Ticket className="h-4 w-4" />} label="Matches" value={`${passport.matchCount} attended`} />
        <Stat icon={<span className="text-sm">🏟️</span>} label="Stadiums" value={`${passport.visitedStadiums.length} visited`} />
        <Stat icon={<span className="text-sm">🏅</span>} label="Badges" value={`${passport.badges.length} collected`} />
      </div>

      <div className="grid border-t border-[var(--wc-border)] sm:grid-cols-3">
        <HistoryBlock icon={<Ticket className="h-4 w-4 text-[var(--wc-gold)]" />} title="Match History" items={ticketBookings.map((b) => b.title)} empty="No match tickets yet" />
        <HistoryBlock icon={<Hotel className="h-4 w-4 text-[var(--wc-gold)]" />} title="Hotels Booked" items={hotelBookings.map((b) => b.title)} empty="No hotel bookings" />
        <HistoryBlock icon={<Plane className="h-4 w-4 text-[var(--wc-gold)]" />} title="Flights Booked" items={flightBookings.map((b) => b.title)} empty="No flights booked" />
      </div>
    </section>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--wc-border)] p-4">
      <div className="flex items-center gap-2 text-[var(--wc-muted)]">{icon}<span className="text-xs uppercase">{label}</span></div>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  )
}

function HistoryBlock({ icon, title, items, empty }: { icon: ReactNode; title: string; items: string[]; empty: string }) {
  return (
    <div className="border-[var(--wc-border)] p-4 sm:border-s">
      <h3 className="flex items-center gap-2 text-sm font-bold">{icon} {title}</h3>
      <ul className="mt-3 space-y-1.5">
        {items.length === 0 ? (
          <li className="text-xs text-[var(--wc-muted)]">{empty}</li>
        ) : (
          items.map((item, i) => (
            <li key={i} className="truncate text-xs">{item}</li>
          ))
        )}
      </ul>
    </div>
  )
}
