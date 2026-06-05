import { useState } from 'react'
import { useI18n } from '../context/I18nContext'
import { useBookings } from '../context/BookingContext'
import { PaymentModal, PriceTag, type PayMethod } from '../components/PiPayment'
import { PACKAGES } from '../data/mockData'
import { PackageImage } from '../components/PackageImage'

export function WCPackagesPage() {
  const { t } = useI18n()
  const { addBooking } = useBookings()
  const [checkout, setCheckout] = useState<{ title: string; price: number; details: string } | null>(null)

  const confirmPay = (method: PayMethod, piAmount?: number) => {
    if (!checkout) return
    addBooking({
      type: 'package',
      title: checkout.title,
      date: '2030-06-08',
      price: checkout.price,
      paymentMethod: method,
      piAmount,
      details: checkout.details,
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('nav.packages')}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {PACKAGES.map((p) => (
          <div key={p.id} className="wc-card overflow-hidden lg:flex">
            <PackageImage src={p.image} alt={p.title} className="h-56 w-full object-cover lg:h-auto lg:w-2/5" />
            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl font-bold">{p.title}</h3>
              <p className="text-sm text-[var(--wc-muted)]">{p.country} · {p.days} days</p>
              {p.imageSource && (
                <a
                  href={p.imageSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--wc-gold)] hover:underline"
                >
                  View original on Gemini ↗
                </a>
              )}
              <ul className="mt-4 flex-1 space-y-1 text-sm">
                {p.includes.map((i) => (
                  <li key={i} className="flex items-center gap-2"><span className="text-[var(--wc-gold)]">✓</span> {i}</li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between">
                <PriceTag amountEdh={p.price} />
                <button
                  type="button"
                  onClick={() => setCheckout({
                    title: p.title,
                    price: p.price,
                    details: `${p.country} · ${p.days} days · Includes: ${p.includes.join(', ')}`,
                  })}
                  className="wc-btn-primary"
                >
                  {t('book.now')}
                </button>
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
