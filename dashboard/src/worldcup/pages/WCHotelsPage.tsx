import { useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useBookings } from '../context/BookingContext'
import { PaymentModal, PriceTag, type PayMethod } from '../components/PiPayment'
import { HOTELS } from '../data/mockData'

export function WCHotelsPage() {
  const { t } = useI18n()
  const { addBooking } = useBookings()
  const [city, setCity] = useState('')
  const [maxPrice, setMaxPrice] = useState(1000)
  const [stars, setStars] = useState(0)
  const [compare, setCompare] = useState<string[]>([])
  const [checkout, setCheckout] = useState<{ title: string; price: number; details: string } | null>(null)

  const filtered = useMemo(
    () =>
      HOTELS.filter(
        (h) =>
          (!city || h.city === city) &&
          h.price <= maxPrice &&
          (!stars || h.stars >= stars),
      ),
    [city, maxPrice, stars],
  )

  const cities = [...new Set(HOTELS.map((h) => h.city))]

  const confirmPay = (method: PayMethod, piAmount?: number) => {
    if (!checkout) return
    addBooking({
      type: 'hotel',
      title: checkout.title,
      date: new Date().toISOString().slice(0, 10),
      price: checkout.price,
      paymentMethod: method,
      piAmount,
      details: checkout.details,
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('nav.hotels')}</h1>
      <div className="mt-6 grid gap-4 rounded-2xl border border-[var(--wc-border)] bg-[var(--wc-card)] p-4 sm:grid-cols-4">
        <div>
          <label className="text-xs text-[var(--wc-muted)]">{t('filter.city')}</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="wc-input mt-1 w-full">
            <option value="">{t('filter.all')}</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--wc-muted)]">{t('filter.price')}</label>
          <input type="range" min={100} max={1000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="mt-3 w-full" />
          <p className="text-xs">{maxPrice} Đ</p>
        </div>
        <div>
          <label className="text-xs text-[var(--wc-muted)]">{t('filter.stars')}</label>
          <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="wc-input mt-1 w-full">
            <option value={0}>{t('filter.all')}</option>
            {[3, 4, 5].map((s) => <option key={s} value={s}>{s}+ ★</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button type="button" className="wc-btn-primary w-full">{t('search.search')}</button>
        </div>
      </div>

      {compare.length > 0 && (
        <p className="mt-4 text-sm text-[var(--wc-gold)]">{t('book.compare')}: {compare.length} selected</p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((h) => (
          <div key={h.id} className="wc-card overflow-hidden">
            <img src={h.image} alt="" className="h-48 w-full object-cover" />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{h.name}</h3>
                  <p className="text-sm text-[var(--wc-muted)]">{h.city}, {h.country}</p>
                </div>
                <span className="flex items-center gap-0.5 text-[var(--wc-gold)]">
                  {Array.from({ length: h.stars }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                </span>
              </div>
              <p className="mt-2 text-sm">Rating {h.rating}/10 · {h.rooms} rooms left</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {h.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-[var(--wc-bg)] px-2 py-0.5 text-[10px]">{a}</span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <PriceTag amountEdh={h.price} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCompare((c) => (c.includes(h.id) ? c.filter((x) => x !== h.id) : [...c, h.id]))}
                    className="wc-btn-outline text-xs px-3 py-1.5"
                  >
                    {t('book.compare')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckout({
                      title: h.name,
                      price: h.price,
                      details: `${h.city}, ${h.country} · ${h.stars}★ · ${h.amenities.join(', ')} · ${h.rooms} rooms available`,
                    })}
                    className="wc-btn-primary text-xs px-3 py-1.5"
                  >
                    {t('book.now')}
                  </button>
                </div>
              </div>
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
