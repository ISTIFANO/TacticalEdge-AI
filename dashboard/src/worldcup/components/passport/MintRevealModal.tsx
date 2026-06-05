import { Sparkles, X } from 'lucide-react'
import { usePassport } from '../../context/PassportContext'
import { CollectibleCard } from './CollectibleCard'
import { RARITY_STYLES } from '../../data/passportData'

export function MintRevealModal() {
  const { lastMinted, clearLastMinted } = usePassport()

  if (!lastMinted) return null

  const style = RARITY_STYLES[lastMinted.rarity]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="passport-mint-reveal relative max-w-md text-center">
        <button
          type="button"
          onClick={clearLastMinted}
          className="absolute -end-2 -top-2 z-10 rounded-full bg-[var(--wc-card)] p-2 shadow-lg"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="passport-confetti pointer-events-none absolute inset-0" />

        <div className="mb-6 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 animate-pulse text-[var(--wc-gold)]" />
          <h2 className="text-2xl font-black text-white">New Collectible Minted!</h2>
          <Sparkles className="h-6 w-6 animate-pulse text-[var(--wc-gold)]" />
        </div>

        <p className={`mb-6 text-sm font-bold uppercase tracking-widest ${style.border.replace('border', 'text')}`}>
          {style.label} · +{lastMinted.rarity === 'legendary' ? 1000 : lastMinted.rarity === 'epic' ? 400 : lastMinted.rarity === 'rare' ? 150 : 50} pts
        </p>

        <div className="mx-auto flex justify-center">
          <CollectibleCard collectible={lastMinted} compact />
        </div>

        <button type="button" onClick={clearLastMinted} className="wc-btn-primary mt-8 px-8">
          Add to Wallet
        </button>
      </div>
    </div>
  )
}
