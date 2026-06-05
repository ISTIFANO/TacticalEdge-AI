import { useState } from 'react'
import { usePi } from '../context/PiContext'
import { useEdirham } from '../context/EdirhamContext'
import { useI18n } from '../context/I18nContext'
import { formatEdh, priceToPi } from '../utils/payment'

export type PayMethod = 'edh' | 'pi'

interface PaymentModalProps {
  open: boolean
  title: string
  priceEdh: number
  onClose: () => void
  onConfirm: (method: PayMethod, piAmount?: number) => void
}

export function PaymentModal({ open, title, priceEdh, onClose, onConfirm }: PaymentModalProps) {
  const { t } = useI18n()
  const { connected: piConnected, connect: connectPi } = usePi()
  const { connected: edhConnected, connect: connectEdh } = useEdirham()
  const [method, setMethod] = useState<PayMethod>('edh')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const piAmount = priceToPi(priceEdh)

  const pay = async () => {
    if (method === 'pi' && !piConnected) {
      setLoading(true)
      await connectPi()
      setLoading(false)
    }
    if (method === 'edh' && !edhConnected) {
      setLoading(true)
      await connectEdh()
      setLoading(false)
    }
    onConfirm(method, method === 'pi' ? piAmount : undefined)
    onClose()
  }

  const needsConnect = (method === 'pi' && !piConnected) || (method === 'edh' && !edhConnected)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--wc-border)] bg-[var(--wc-card)] p-6 shadow-2xl">
        <h3 className="text-lg font-bold">{t('pay.checkout')}</h3>
        <p className="mt-1 text-sm text-[var(--wc-muted)]">{title}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod('edh')}
            className={`rounded-xl border p-4 text-left transition ${method === 'edh' ? 'border-[#c41e3a] bg-[#c41e3a]/10' : 'border-[var(--wc-border)]'}`}
          >
            <div className="flex items-center gap-2">
              <img src="/e-dirham.png" alt="e-Dirham" className="h-6 w-6 object-contain" />
              <p className="text-xs text-[var(--wc-muted)]">e-Dirham</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{formatEdh(priceEdh)}</p>
          </button>
          <button
            type="button"
            onClick={() => setMethod('pi')}
            className={`rounded-xl border p-4 text-left transition ${method === 'pi' ? 'border-[#f4af47] bg-[#f4af47]/10' : 'border-[var(--wc-border)]'}`}
          >
            <div className="flex items-center gap-2">
              <img src="/pi-network.png" alt="Pi" className="h-5 w-5" />
              <p className="text-xs text-[var(--wc-muted)]">Pi Network</p>
            </div>
            <p className="mt-2 text-2xl font-bold">{piAmount} π</p>
          </button>
        </div>

        {needsConnect && (
          <p className="mt-3 text-xs text-[var(--wc-muted)]">
            {method === 'pi' ? t('pay.pi_connect_hint') : t('pay.edh_connect_hint')}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="wc-btn-outline flex-1">{t('pay.cancel')}</button>
          <button
            type="button"
            onClick={pay}
            disabled={loading}
            className={`flex-1 ${method === 'pi' ? 'wc-btn-pi' : 'wc-btn-edh'}`}
          >
            {loading ? '…' : method === 'pi' ? t('pay.pay_pi') : t('pay.pay_edh')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PiConnectButton({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useI18n()
  const { connected, username, connect, disconnect } = usePi()
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (connected) { disconnect(); return }
    setLoading(true)
    await connect()
    setLoading(false)
  }

  const label = connected ? `@${username}` : loading ? '…' : compact ? 'π' : t('pi.connect')

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      title={t('pi.connect')}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-[#f4af47]/50 bg-[#f4af47]/10 font-semibold text-[#f4af47] transition hover:bg-[#f4af47]/20 ${
        compact ? 'p-2 text-xs' : 'px-5 py-3'
      } ${className}`}
    >
      <img src="/pi-network.png" alt="" className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
      {!compact || connected ? <span className="max-w-[5rem] truncate sm:max-w-none">{label}</span> : null}
    </button>
  )
}

export function EdirhamConnectButton({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useI18n()
  const { connected, walletId, connect, disconnect } = useEdirham()
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (connected) { disconnect(); return }
    setLoading(true)
    await connect()
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      title={t('edh.connect')}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-[#c41e3a]/40 bg-gradient-to-r from-[#c41e3a]/10 to-[#006233]/10 font-semibold text-[#c41e3a] transition hover:opacity-90 ${
        compact ? 'p-2 text-xs' : 'px-4 py-2.5 text-sm'
      } ${className}`}
    >
      <img src="/e-dirham.png" alt="" className={`object-contain ${compact ? 'h-5 w-5' : 'h-6 w-6'}`} />
      {!compact ? (
        <span>{connected ? walletId : loading ? '…' : t('edh.connect')}</span>
      ) : connected ? (
        <span className="hidden max-w-[4rem] truncate lg:inline">{walletId}</span>
      ) : null}
    </button>
  )
}

export function PriceTag({ amountEdh, className = '' }: { amountEdh: number; className?: string }) {
  return (
    <div className={className}>
      <p className="font-bold text-[var(--wc-gold)]">{formatEdh(amountEdh)}</p>
      <p className="text-xs text-[#f4af47]">{priceToPi(amountEdh)} π</p>
    </div>
  )
}
