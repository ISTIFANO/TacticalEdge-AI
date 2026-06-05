import { useState } from 'react'
import { Plane } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useBookings } from '../context/BookingContext'
import { PaymentModal, PriceTag, type PayMethod } from '../components/PiPayment'
import { FLIGHTS } from '../data/mockData'

export function WCFlightsPage() {
  const { t } = useI18n()
  const { addBooking } = useBookings()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [checkout, setCheckout] = useState<{ title: string; price: number; details: string } | null>(null)

  const results = FLIGHTS.filter((f) => (!from || f.from.includes(from.toUpperCase())) && (!to || f.to.includes(to.toUpperCase())))

  const confirmPay = (method: PayMethod, piAmount?: number) => {
    if (!checkout) return
    addBooking({
      type: 'flight',
      title: checkout.title,
      date: '2030-06-10',
      price: checkout.price,
      paymentMethod: method,
      piAmount,
      details: checkout.details,
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('nav.flights')}</h1>
      <div className="mt-6 grid gap-4 rounded-2xl border border-[var(--wc-border)] bg-[var(--wc-card)] p-6 sm:grid-cols-5">
        <div>
          <label className="text-xs text-[var(--wc-muted)]">{t('search.from')}</label>
          <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="CMN, MAD, LIS..." className="wc-input mt-1 w-full" />
        </div>
        <div>
          <label className="text-xs text-[var(--wc-muted)]">{t('search.to')}</label>
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="BCN, OPO..." className="wc-input mt-1 w-full" />
        </div>
        <div>
          <label className="text-xs text-[var(--wc-muted)]">{t('search.depart')}</label>
          <input type="date" className="wc-input mt-1 w-full" defaultValue="2030-06-10" />
        </div>
        <div>
          <label className="text-xs text-[var(--wc-muted)]">{t('search.passengers')}</label>
          <select className="wc-input mt-1 w-full"><option>1</option><option>2</option><option>3+</option></select>
        </div>
        <div className="flex items-end">
          <button type="button" className="wc-btn-primary w-full">{t('search.search')}</button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {results.map((f) => (
          <div key={f.id} className="wc-card flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <Plane className="h-8 w-8 text-[var(--wc-gold)]" />
              <div>
                <p className="font-bold">{f.airline}</p>
                <p className="text-sm text-[var(--wc-muted)]">{f.from} → {f.to} · {f.stops === 0 ? 'Direct' : `${f.stops} stop`}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{f.depart} – {f.arrive}</p>
              <p className="text-xs text-[var(--wc-muted)]">{f.duration}</p>
            </div>
            <div className="flex items-center gap-4">
              <PriceTag amountEdh={f.price} />
              <button
                type="button"
                onClick={() => setCheckout({
                  title: `${f.airline} ${f.from}-${f.to}`,
                  price: f.price,
                  details: `${f.airline} · ${f.from}→${f.to} · ${f.depart}–${f.arrive} · ${f.duration} · ${f.stops === 0 ? 'Direct' : `${f.stops} stop(s)`}`,
                })}
                className="wc-btn-primary"
              >
                {t('book.now')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <PaymentModal
        open={!!checkout}
        title={checkout?.title ?? ''}
        priceEdh={checkout?.price ?? 0}
        onClose={() => setCheckout(null)}
        onConfirm={confirmPay}
      />
    </div>
  )
}
