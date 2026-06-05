import { useState } from 'react'
import { useI18n } from '../context/I18nContext'
import { useBookings } from '../context/BookingContext'
import { PaymentModal, PriceTag, type PayMethod } from '../components/PiPayment'
import { TICKETS } from '../data/mockData'

export function WCTicketsPage() {
  const { t } = useI18n()
  const { addBooking } = useBookings()
  const [checkout, setCheckout] = useState<{ title: string; price: number; details: string; date: string } | null>(null)

  const confirmPay = (method: PayMethod, piAmount?: number) => {
    if (!checkout) return
    addBooking({
      type: 'ticket',
      title: checkout.title,
      date: checkout.date,
      price: checkout.price,
      paymentMethod: method,
      piAmount,
      details: checkout.details,
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('nav.tickets')}</h1>
      <p className="mt-2 text-[var(--wc-muted)]">Official FIFA World Cup 2030 match tickets — Morocco, Spain, Portugal</p>
      <div className="mt-8 space-y-6">
        {TICKETS.map((tk) => (
          <div key={tk.id} className="wc-card overflow-hidden lg:flex">
            <div className="bg-gradient-to-r from-[var(--wc-gold)]/20 to-transparent p-6 lg:w-1/3">
              <p className="text-xs uppercase text-[var(--wc-gold)]">{tk.date}</p>
              <h3 className="mt-2 text-xl font-bold">{tk.match}</h3>
              <p className="text-sm text-[var(--wc-muted)]">{tk.stadium}</p>
              <p className="text-sm">{tk.city}</p>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-4 p-6">
              {[
                { cat: 'Category 1', price: tk.category1 },
                { cat: 'Category 2', price: tk.category2 },
                { cat: 'Category 3', price: tk.category3 },
              ].map(({ cat, price }) => (
                <div key={cat} className="rounded-xl border border-[var(--wc-border)] p-4 text-center">
                  <p className="text-xs text-[var(--wc-muted)]">{cat}</p>
                  <PriceTag amountEdh={price} className="mt-2" />
                  <button
                    type="button"
                    onClick={() => setCheckout({
                      title: `${tk.match} (${cat})`,
                      price,
                      date: tk.date,
                      details: `${tk.match} · ${tk.stadium}, ${tk.city} · ${cat} · ${tk.date}`,
                    })}
                    className="wc-btn-primary mt-3 w-full text-xs py-2"
                  >
                    {t('book.now')}
                  </button>
                </div>
              ))}
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
