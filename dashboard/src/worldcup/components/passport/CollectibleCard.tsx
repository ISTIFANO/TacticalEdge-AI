import { QRCodeSVG } from 'qrcode.react'
import { Download, Share2 } from 'lucide-react'
import { RARITY_STYLES } from '../../data/passportData'
import type { Collectible } from '../../types/passport'

interface CollectibleCardProps {
  collectible: Collectible
  compact?: boolean
  onShare?: () => void
  onDownload?: () => void
}

export function CollectibleCard({ collectible, compact, onShare, onDownload }: CollectibleCardProps) {
  const style = RARITY_STYLES[collectible.rarity]

  return (
    <div
      className={`passport-card group relative overflow-hidden rounded-2xl border-2 ${style.border} bg-gradient-to-br ${style.gradient} shadow-xl ${style.glow} ${compact ? 'max-w-xs' : 'max-w-sm'}`}
    >
      <div className="passport-shimmer pointer-events-none absolute inset-0 opacity-30" />
      <div className="absolute end-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
        {style.label}
      </div>

      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">FIFA WC 2030</p>
          <p className="font-mono text-[10px] text-white/60">{collectible.serialNumber}</p>
        </div>

        {collectible.type === 'ticket' && (collectible.teamHome || collectible.teamAway) && (
          <div className="mt-4 flex items-center justify-center gap-6">
            <span className="text-4xl drop-shadow-lg">{collectible.teamHome ?? '⚽'}</span>
            <span className="text-sm font-bold text-white/80">VS</span>
            <span className="text-4xl drop-shadow-lg">{collectible.teamAway ?? '⚽'}</span>
          </div>
        )}

        <h3 className={`mt-3 font-bold text-white ${compact ? 'text-sm' : 'text-lg'} leading-tight`}>
          {collectible.title}
        </h3>
        <p className="mt-1 text-xs text-white/70">{collectible.subtitle}</p>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-white/80">
          {collectible.stadium && (
            <div className="col-span-2 rounded-lg bg-black/25 px-2 py-1.5">
              <span className="text-white/50">Stadium · </span>{collectible.stadium}
            </div>
          )}
          <div className="rounded-lg bg-black/25 px-2 py-1.5">
            <span className="text-white/50">City · </span>{collectible.city}
          </div>
          <div className="rounded-lg bg-black/25 px-2 py-1.5">
            <span className="text-white/50">Date · </span>{collectible.date}
          </div>
          {collectible.seatNumber && (
            <div className="col-span-2 rounded-lg bg-black/25 px-2 py-1.5">
              <span className="text-white/50">Seat · </span>{collectible.seatNumber}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="rounded-xl bg-white p-2 shadow-lg">
            <QRCodeSVG value={collectible.qrPayload} size={compact ? 56 : 72} level="M" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${collectible.validated ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-white/70'}`}>
              {collectible.validated ? '✓ Validated' : 'Scan at gate'}
            </span>
            <span className="text-[10px] capitalize text-white/50">{collectible.type}</span>
          </div>
        </div>

        {!compact && (onShare || onDownload) && (
          <div className="mt-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
            {onDownload && (
              <button type="button" onClick={onDownload} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/15 py-2 text-xs font-medium text-white hover:bg-white/25">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            )}
            {onShare && (
              <button type="button" onClick={onShare} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/15 py-2 text-xs font-medium text-white hover:bg-white/25">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function downloadSouvenir(collectible: Collectible) {
  const blob = new Blob(
    [JSON.stringify({ ...collectible, souvenir: 'FIFA World Cup 2030 Digital Collectible' }, null, 2)],
    { type: 'application/json' },
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${collectible.serialNumber}.wc2030.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function shareSouvenir(collectible: Collectible) {
  const text = `🏆 My FIFA WC 2030 collectible: ${collectible.title} (${collectible.serialNumber}) — ${collectible.rarity.toUpperCase()}`
  if (navigator.share) {
    await navigator.share({ title: 'WC 2030 Fan Passport', text })
  } else {
    await navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }
}
