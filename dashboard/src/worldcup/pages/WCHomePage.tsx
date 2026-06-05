import { Link } from 'react-router-dom'
import { Calendar, Hotel, MapPin, Newspaper, Plane, Ticket } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { CountdownTimer } from '../components/WCShared'
import { PiMoroccoMap } from '../components/PiMoroccoMap'
import { PiConnectButton, EdirhamConnectButton } from '../components/PiPayment'
import { formatEdh, formatPi, priceToPi } from '../utils/payment'
import { FIXTURES, HOTELS, NEWS, PACKAGES } from '../data/mockData'
import { PackageImage } from '../components/PackageImage'

export function WCHomePage() {
  const { t } = useI18n()

  const stats = [
    { value: '48', label: t('stat.teams') },
    { value: '6', label: t('stat.cities') },
    { value: '104', label: t('stat.matches') },
    { value: '2030', label: t('hero.morocco') },
  ]

  return (
    <>
      <section className="relative min-h-[85vh] overflow-hidden border-b border-[var(--wc-border)]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#1a0a0a]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--wc-bg)] via-transparent to-transparent" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 lg:flex-row lg:items-center lg:py-24">
          <div className="flex-1 text-start">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--wc-gold)]">{t('hero.title')}</p>
            <h1 className="mt-4 text-5xl font-black leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              {t('hero.passion').split(' ').slice(0, 2).join(' ')}
              <br />
              <span className="bg-gradient-to-r from-[#C5A572] via-[#f4af47] to-[#C5A572] bg-clip-text text-transparent">
                {t('hero.passion').split(' ').slice(2).join(' ')}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">{t('hero.subtitle')}</p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/world-cup/tickets" className="wc-btn-primary inline-flex items-center gap-2 px-8 py-4 text-base">
                <Ticket className="h-5 w-5" /> {t('hero.cta.tickets')}
              </Link>
              <EdirhamConnectButton />
              <PiConnectButton />
            </div>

            <div className="mt-12 grid grid-cols-4 gap-4 sm:max-w-lg">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-6 lg:items-end">
            <CountdownTimer />
            <div className="grid w-full max-w-sm grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[var(--wc-gold)]/30 bg-black/40 p-5 backdrop-blur">
                <p className="text-xs uppercase text-slate-400">{t('hero.tickets_avail')}</p>
                <p className="mt-1 text-3xl font-black text-[var(--wc-gold)]">500K+</p>
              </div>
              <div className="rounded-2xl border border-[#c41e3a]/30 bg-black/40 p-5 backdrop-blur col-span-2">
                <p className="text-xs uppercase text-slate-400">{t('hero.payment')}</p>
                <div className="mt-2 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <img src="/e-dirham.png" alt="e-Dirham" className="h-8 w-8 object-contain" />
                    <span className="font-bold text-white">e-Dirham</span>
                  </div>
                  <span className="text-slate-500">+</span>
                  <div className="flex items-center gap-2">
                    <img src="/pi-network.png" alt="Pi Network" className="h-8 w-8" />
                    <span className="font-bold text-[#f4af47]">Pi Network</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-4xl">
              <span>🇲🇦</span><span>🇪🇸</span><span>🇵🇹</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{t('section.map')}</h2>
          <p className="mt-2 text-sm text-[var(--wc-muted)]">{t('section.map.subtitle')}</p>
        </div>
        <div className="mt-8">
          <PiMoroccoMap />
        </div>
        <p className="mt-4 text-center text-xs text-[var(--wc-muted)]">{t('section.map.caption')}</p>
      </section>

      <section className="border-y border-[var(--wc-border)] bg-[var(--wc-card)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold">{t('section.hotels')}</h2>
            <Link to="/world-cup/hotels" className="text-sm text-[var(--wc-gold)]">{t('book.compare')} →</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOTELS.slice(0, 4).map((h) => (
              <div key={h.id} className="wc-card overflow-hidden">
                <img src={h.image} alt="" className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="font-semibold">{h.name}</p>
                  <p className="text-xs text-[var(--wc-muted)]">{h.city}, {h.country}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="font-bold text-[var(--wc-gold)]">{formatEdh(h.price)}</p>
                    <p className="text-xs text-[#f4af47]">{priceToPi(h.price)} π</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold">{t('section.packages')}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((p) => (
            <Link key={p.id} to="/world-cup/packages" className="wc-card group overflow-hidden transition hover:border-[var(--wc-gold)]/50">
              <PackageImage src={p.image} alt={p.title} className="h-36 w-full object-cover transition group-hover:scale-105" />
              <div className="p-4">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-[var(--wc-gold)]">{formatEdh(p.price)} · {formatPi(priceToPi(p.price))}</p>
                {p.imageSource && (
                  <p className="mt-1 text-[10px] text-[var(--wc-muted)]">Art · Gemini WC 2030</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--wc-border)] bg-[var(--wc-card)] py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold"><Newspaper className="h-6 w-6 text-[var(--wc-gold)]" /> {t('section.news')}</h2>
            <ul className="mt-6 space-y-4">
              {NEWS.map((n) => (
                <li key={n.id} className="wc-card p-4">
                  <p className="text-xs text-[var(--wc-muted)]">{n.date}</p>
                  <p className="mt-1 font-semibold">{n.title}</p>
                  <p className="mt-1 text-sm text-[var(--wc-muted)]">{n.excerpt}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold"><Calendar className="h-6 w-6 text-[var(--wc-gold)]" /> Fixtures</h2>
            <ul className="mt-6 space-y-3">
              {FIXTURES.map((f, i) => (
                <li key={i} className="flex items-center gap-4 rounded-xl border border-[var(--wc-border)] p-4">
                  <div className="text-center">
                    <p className="text-xs text-[var(--wc-muted)]">{f.date.slice(5)}</p>
                    <p className="text-lg font-bold text-[var(--wc-gold)]">{f.date.slice(8)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{f.match}</p>
                    <p className="flex items-center gap-1 text-xs text-[var(--wc-muted)]"><MapPin className="h-3 w-3" /> {f.city}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <Link to="/world-cup/flights" className="wc-card flex items-center gap-3 p-4 hover:border-[var(--wc-gold)]/40">
                <Plane className="h-8 w-8 text-[var(--wc-gold)]" />
                <span className="font-medium">{t('nav.flights')}</span>
              </Link>
              <Link to="/world-cup/hotels" className="wc-card flex items-center gap-3 p-4 hover:border-[var(--wc-gold)]/40">
                <Hotel className="h-8 w-8 text-[var(--wc-gold)]" />
                <span className="font-medium">{t('nav.hotels')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
