import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { usePassport } from '../../context/PassportContext'
import { CollectibleCard, downloadSouvenir, shareSouvenir } from './CollectibleCard'
import type { CollectibleType, Rarity } from '../../types/passport'

const FILTERS: { type: CollectibleType | 'all'; label: string }[] = [
  { type: 'all', label: 'All' },
  { type: 'ticket', label: 'Tickets' },
  { type: 'hotel', label: 'Hotels' },
  { type: 'flight', label: 'Flights' },
  { type: 'package', label: 'Packages' },
]

const RARITIES: (Rarity | 'all')[] = ['all', 'legendary', 'epic', 'rare', 'common']

export function PassportWallet() {
  const { passport } = usePassport()
  const [typeFilter, setTypeFilter] = useState<CollectibleType | 'all'>('all')
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all')

  if (!passport) return null

  const filtered = passport.collectibles.filter((c) => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false
    if (rarityFilter !== 'all' && c.rarity !== rarityFilter) return false
    return true
  })

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Wallet className="h-5 w-5 text-[var(--wc-gold)]" /> Digital Wallet
          <span className="rounded-full bg-[var(--wc-gold)]/20 px-2.5 py-0.5 text-sm font-normal text-[var(--wc-gold)]">
            {passport.collectibles.length}
          </span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.type}
              type="button"
              onClick={() => setTypeFilter(f.type)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${typeFilter === f.type ? 'bg-[var(--wc-gold)] text-black' : 'border border-[var(--wc-border)]'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {RARITIES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRarityFilter(r)}
            className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${rarityFilter === r ? 'bg-white/10 ring-1 ring-[var(--wc-gold)]' : 'text-[var(--wc-muted)]'}`}
          >
            {r}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--wc-muted)]">
          No collectibles yet — book a ticket, hotel, flight, or package to mint your first card!
        </p>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <CollectibleCard
              key={c.id}
              collectible={c}
              onDownload={() => downloadSouvenir(c)}
              onShare={() => shareSouvenir(c)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
