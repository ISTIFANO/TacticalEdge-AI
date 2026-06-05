import { useMemo, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Heart, Hotel, Plane, Sparkles, Star, Ticket, TrendingUp } from 'lucide-react'
import { useBookings } from '../context/BookingContext'
import { useWCAuth } from '../context/WCAuthContext'
import { useI18n } from '../context/I18nContext'
import { PaymentModal, type PayMethod } from '../components/PiPayment'
import { formatEdh, priceToPi } from '../utils/payment'
import { COACHES, HOTELS, TEAMS } from '../data/mockData'
import { PassportAdminPanel } from '../components/passport/PassportAdminPanel'

const TEAM_COUNTRY: Record<string, string> = {
  mar: 'Morocco',
  esp: 'Spain',
  por: 'Portugal',
}

export function WCDashboardPage() {
  const { user } = useWCAuth()
  const { t } = useI18n()
  if (!user) return <Navigate to="/world-cup/login" replace />

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {user.name}</h1>
      <p className="mt-1 capitalize text-[var(--wc-muted)]">{user.role.replace('_', ' ')}</p>

      {user.role === 'fan' && <FanDashboard />}
      {user.role === 'hotel_manager' && <HotelManagerDashboard />}
      {user.role === 'travel_agency' && <AgencyDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  )
}

function FanDashboard() {
  const { user, setPreferredTeam } = useWCAuth()
  const { bookings, donations, addDonation } = useBookings()
  const { t } = useI18n()

  const [donateTarget, setDonateTarget] = useState<'team' | 'coach'>('team')
  const [donateId, setDonateId] = useState('mar')
  const [donateAmount, setDonateAmount] = useState(25)
  const [donateModal, setDonateModal] = useState(false)

  const preferredId = user?.preferredTeam ?? 'mar'
  const team = TEAMS.find((t) => t.id === preferredId)

  const recommendedHotels = useMemo(() => {
    const country = TEAM_COUNTRY[preferredId]
    const pool = country ? HOTELS.filter((h) => h.country === country) : HOTELS
    return [...pool].sort((a, b) => b.rating - a.rating).slice(0, 3)
  }, [preferredId])

  const confirmDonation = (method: PayMethod, piAmount?: number) => {
    const target =
      donateTarget === 'team'
        ? TEAMS.find((t) => t.id === donateId)?.name ?? donateId
        : COACHES.find((c) => c.id === donateId)?.name ?? donateId
    addDonation({
      target,
      targetType: donateTarget,
      amount: donateAmount,
      paymentMethod: method,
      piAmount,
    })
  }

  return (
    <div className="mt-8 space-y-8">
      <Link to="/world-cup/passport" className="passport-cta flex items-center justify-between gap-4 rounded-2xl border border-[var(--wc-gold)]/40 bg-gradient-to-r from-[var(--wc-gold)]/10 to-purple-500/10 p-5 transition hover:border-[var(--wc-gold)]">
        <div className="flex items-center gap-4">
          <Sparkles className="h-8 w-8 text-[var(--wc-gold)]" />
          <div>
            <p className="font-bold">{t('passport.title')}</p>
            <p className="text-sm text-[var(--wc-muted)]">{t('passport.cta')}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-[var(--wc-gold)]">→</span>
      </Link>

      {/* Preferred team + stats */}
      <section className="wc-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="h-5 w-5 text-[var(--wc-gold)]" /> {t('fan.stats')}
          </h2>
          <div className="flex items-center gap-3">
            <label className="text-sm text-[var(--wc-muted)]">{t('fan.preferred')}</label>
            <select
              value={preferredId}
              onChange={(e) => setPreferredTeam(e.target.value)}
              className="wc-input"
            >
              {TEAMS.map((tm) => (
                <option key={tm.id} value={tm.id}>{tm.flag} {tm.name}</option>
              ))}
            </select>
          </div>
        </div>

        {team && (
          <div className="mt-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{team.flag}</span>
              <div>
                <h3 className="text-2xl font-bold">{team.name}</h3>
                <p className="text-sm text-[var(--wc-muted)]">FIFA Rank #{team.rank} · Group {team.group} · Coach: {team.coach}</p>
                <div className="mt-2 flex gap-1">
                  {team.form.map((f, i) => (
                    <span
                      key={i}
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${
                        f === 'W' ? 'bg-emerald-500/20 text-emerald-400' : f === 'D' ? 'bg-slate-500/20 text-slate-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Played', value: team.played },
                { label: 'Wins', value: team.wins },
                { label: 'Draws', value: team.draws },
                { label: 'Losses', value: team.losses },
                { label: 'Goals', value: team.goals },
                { label: 'Conceded', value: team.goalsAgainst },
                { label: 'Possession', value: `${team.possession}%` },
                { label: 'Pass accuracy', value: `${team.passAccuracy}%` },
                { label: 'Clean sheets', value: team.cleanSheets },
                { label: 'Top scorer', value: team.topScorer },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-[var(--wc-border)] p-4">
                  <p className="text-xs uppercase text-[var(--wc-muted)]">{s.label}</p>
                  <p className="mt-1 text-xl font-bold text-[var(--wc-gold)]">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Bookings */}
        <section className="wc-card p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Ticket className="h-5 w-5 text-[var(--wc-gold)]" /> {t('fan.my_bookings')}
          </h2>
          <ul className="mt-4 space-y-3">
            {bookings.length === 0 ? (
              <li className="text-sm text-[var(--wc-muted)]">No bookings yet — explore tickets, hotels, or flights.</li>
            ) : (
              bookings.map((b) => (
                <li key={b.id} className="rounded-xl border border-[var(--wc-border)] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {b.type === 'hotel' && <Hotel className="h-4 w-4 text-[var(--wc-gold)]" />}
                        {b.type === 'flight' && <Plane className="h-4 w-4 text-[var(--wc-gold)]" />}
                        {b.type === 'ticket' && <Ticket className="h-4 w-4 text-[var(--wc-gold)]" />}
                        <span className="font-semibold">{b.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--wc-muted)]">{b.date} · {b.status}</p>
                      {b.details && <p className="mt-2 text-sm text-[var(--wc-muted)]">{b.details}</p>}
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-[var(--wc-gold)]">{formatEdh(b.price)}</p>
                      {b.paymentMethod === 'pi' && b.piAmount != null && (
                        <p className="text-xs text-[#f4af47]">{b.piAmount} π</p>
                      )}
                      <p className="mt-1 text-[10px] uppercase text-[var(--wc-muted)]">
                        {b.paymentMethod === 'pi' ? 'Pi Network' : 'e-Dirham'}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Hotel recommendations */}
        <section className="wc-card p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Hotel className="h-5 w-5 text-[var(--wc-gold)]" /> {t('fan.recommendations')}
          </h2>
          <p className="mt-1 text-sm text-[var(--wc-muted)]">
            Near {team?.name ?? 'your team'} host cities
          </p>
          <ul className="mt-4 space-y-4">
            {recommendedHotels.map((h) => (
              <li key={h.id} className="flex gap-4 rounded-xl border border-[var(--wc-border)] p-3">
                <img src={h.image} alt="" className="h-20 w-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{h.name}</p>
                  <p className="text-xs text-[var(--wc-muted)]">{h.city}, {h.country}</p>
                  <div className="mt-1 flex items-center gap-1 text-[var(--wc-gold)]">
                    {Array.from({ length: h.stars }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                    <span className="ms-2 text-xs text-[var(--wc-muted)]">{h.rating}/10</span>
                  </div>
                  <p className="mt-1 text-sm">
                    <span className="font-bold text-[var(--wc-gold)]">{formatEdh(h.price)}</span>
                    <span className="text-xs text-[var(--wc-muted)]">/night · </span>
                    <span className="text-xs text-[#f4af47]">{priceToPi(h.price)} π</span>
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--wc-muted)]">{h.amenities.join(' · ')}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Donations */}
      <section className="wc-card p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Heart className="h-5 w-5 text-red-400" /> {t('fan.donate')}
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setDonateTarget('team'); setDonateId('mar') }}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${donateTarget === 'team' ? 'bg-[var(--wc-gold)] text-black' : 'border border-[var(--wc-border)]'}`}
              >
                {t('fan.donate_team')}
              </button>
              <button
                type="button"
                onClick={() => { setDonateTarget('coach'); setDonateId('regragui') }}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${donateTarget === 'coach' ? 'bg-[var(--wc-gold)] text-black' : 'border border-[var(--wc-border)]'}`}
              >
                {t('fan.donate_coach')}
              </button>
            </div>
            <select
              value={donateId}
              onChange={(e) => setDonateId(e.target.value)}
              className="wc-input w-full"
            >
              {donateTarget === 'team'
                ? TEAMS.map((tm) => <option key={tm.id} value={tm.id}>{tm.flag} {tm.name}</option>)
                : COACHES.map((c) => <option key={c.id} value={c.id}>{c.flag} {c.name} ({c.team})</option>)}
            </select>
            <div>
              <label className="text-xs text-[var(--wc-muted)]">{t('pay.amount_edh')}</label>
              <input
                type="number"
                min={5}
                value={donateAmount}
                onChange={(e) => setDonateAmount(Number(e.target.value))}
                className="wc-input mt-1 w-full"
              />
              <p className="mt-1 text-xs text-[#f4af47]">≈ {priceToPi(donateAmount)} π</p>
            </div>
            <button type="button" onClick={() => setDonateModal(true)} className="wc-btn-edh w-full">
              {t('pay.checkout')} — {formatEdh(donateAmount)} / {priceToPi(donateAmount)} π
            </button>
          </div>

          <div>
            <p className="text-sm font-medium">Your donations</p>
            <ul className="mt-3 space-y-2">
              {donations.length === 0 ? (
                <li className="text-sm text-[var(--wc-muted)]">No donations yet</li>
              ) : (
                donations.map((d) => (
                  <li key={d.id} className="flex justify-between rounded-lg border border-[var(--wc-border)] p-3 text-sm">
                    <span>{d.target} ({d.targetType})</span>
                    <span>
                      {formatEdh(d.amount)}
                      {d.paymentMethod === 'pi' && d.piAmount != null && ` · ${d.piAmount} π`}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <PaymentModal
        open={donateModal}
        title={`Donation — ${donateTarget === 'team' ? TEAMS.find((t) => t.id === donateId)?.name : COACHES.find((c) => c.id === donateId)?.name}`}
        priceEdh={donateAmount}
        onClose={() => setDonateModal(false)}
        onConfirm={confirmDonation}
      />
    </div>
  )
}

function HotelManagerDashboard() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {['Listings', 'Rooms & Availability', 'Pricing', 'Reservations'].map((item) => (
        <div key={item} className="wc-card p-6">
          <h3 className="font-semibold">{item}</h3>
          <p className="mt-2 text-sm text-[var(--wc-muted)]">Manage {item.toLowerCase()} for your properties</p>
          <button type="button" className="wc-btn-outline mt-4 text-xs">Open</button>
        </div>
      ))}
    </div>
  )
}

function AgencyDashboard() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {['Travel Packages', 'Tours & Transport', 'Special Offers'].map((item) => (
        <div key={item} className="wc-card p-6">
          <h3 className="font-semibold">{item}</h3>
          <p className="mt-2 text-sm text-[var(--wc-muted)]">Create and publish {item.toLowerCase()}</p>
        </div>
      ))}
    </div>
  )
}

function AdminDashboard() {
  return (
    <>
      <PassportAdminPanel />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['Users', 'Bookings', 'Hotels', 'Flights', 'Stadiums', 'Content'].map((item) => (
          <div key={item} className="wc-card p-4 text-center">
            <p className="text-2xl font-bold text-[var(--wc-gold)]">—</p>
            <p className="mt-1 text-sm">{item}</p>
          </div>
        ))}
      </div>
    </>
  )
}
