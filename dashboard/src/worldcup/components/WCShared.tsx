import { useI18n } from '../context/I18nContext'
import { useCountdown } from '../hooks/useCountdown'

export function CountdownTimer() {
  const { t } = useI18n()
  const { days, hours, mins, secs } = useCountdown()

  const units = [
    { v: days, l: t('countdown.days') },
    { v: hours, l: t('countdown.hours') },
    { v: mins, l: t('countdown.mins') },
    { v: secs, l: t('countdown.secs') },
  ]

  return (
    <div className="text-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-[var(--wc-gold)]">{t('countdown.label')}</p>
      <div className="flex justify-center gap-3">
        {units.map(({ v, l }) => (
          <div key={l} className="wc-countdown-unit min-w-[4.5rem] rounded-xl border border-[var(--wc-gold)]/30 bg-black/30 px-3 py-4 backdrop-blur">
            <span className="block text-3xl font-extrabold tabular-nums text-white">{String(v).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase text-[var(--wc-muted)]">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WCMap({ onSelect }: { onSelect?: (id: string) => void }) {
  const points = [
    { id: 'm1', type: 'stadium', x: 28, y: 62, label: 'Casablanca' },
    { id: 'm2', type: 'stadium', x: 48, y: 48, label: 'Madrid' },
    { id: 'm3', type: 'stadium', x: 52, y: 44, label: 'Barcelona' },
    { id: 'm4', type: 'stadium', x: 22, y: 52, label: 'Lisbon' },
    { id: 'm5', type: 'airport', x: 26, y: 64, label: 'CMN' },
    { id: 'm6', type: 'airport', x: 46, y: 50, label: 'MAD' },
    { id: 'm7', type: 'airport', x: 20, y: 54, label: 'LIS' },
    { id: 'm8', type: 'attraction', x: 32, y: 68, label: 'Marrakech' },
  ]
  const colors: Record<string, string> = {
    stadium: '#C5A572',
    airport: '#3B82F6',
    hotel: '#22C55E',
    attraction: '#A855F7',
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[var(--wc-border)] bg-gradient-to-br from-[#1a3a2a] via-[#1e293b] to-[#0f172a]">
      <svg viewBox="0 0 100 80" className="h-full w-full opacity-40">
        <path d="M15 55 L35 70 L45 45 L55 42 L70 48 L85 40" fill="none" stroke="#64748b" strokeWidth="0.5" />
        <ellipse cx="30" cy="65" rx="18" ry="12" fill="#166534" opacity="0.3" />
        <ellipse cx="52" cy="45" rx="22" ry="15" fill="#1d4ed8" opacity="0.2" />
        <ellipse cx="22" cy="50" rx="12" ry="10" fill="#15803d" opacity="0.25" />
      </svg>
      {points.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect?.(p.id)}
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          title={p.label}
        >
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white/50"
            style={{ background: colors[p.type] }}
          />
        </button>
      ))}
      <div className="absolute bottom-3 start-3 flex flex-wrap gap-2 text-[10px]">
        {Object.entries(colors).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 capitalize text-white">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} /> {k}
          </span>
        ))}
      </div>
    </div>
  )
}

export function HostFlags() {
  return (
    <div className="flex items-center justify-center gap-4 text-4xl">
      <span title="Morocco">🇲🇦</span>
      <span className="text-[var(--wc-gold)]">·</span>
      <span title="Spain">🇪🇸</span>
      <span className="text-[var(--wc-gold)]">·</span>
      <span title="Portugal">🇵🇹</span>
    </div>
  )
}
