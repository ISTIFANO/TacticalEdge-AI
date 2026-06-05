import { RARITY_STYLES } from '../../data/passportData'
import { BADGE_DEFINITIONS } from '../../data/passportData'
import { usePassport } from '../../context/PassportContext'

export function BadgeShowcase() {
  const { passport } = usePassport()
  if (!passport) return null

  const unlockedIds = new Set(passport.badges.map((b) => b.id))

  return (
    <section>
      <h2 className="text-xl font-bold">Achievement Badges</h2>
      <p className="mt-1 text-sm text-[var(--wc-muted)]">
        {passport.badges.length} / {BADGE_DEFINITIONS.length} unlocked
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {BADGE_DEFINITIONS.map((def) => {
          const unlocked = passport.badges.find((b) => b.id === def.id)
          const style = RARITY_STYLES[def.rarity]
          return (
            <div
              key={def.id}
              className={`passport-badge relative overflow-hidden rounded-xl border p-4 transition ${
                unlocked
                  ? `${style.border} bg-gradient-to-br ${style.gradient} shadow-lg ${style.glow}`
                  : 'border-[var(--wc-border)] bg-[var(--wc-card)] opacity-50 grayscale'
              }`}
            >
              {unlocked && <div className="passport-shimmer pointer-events-none absolute inset-0 opacity-20" />}
              <div className="relative flex items-start gap-3">
                <span className="text-3xl">{def.icon}</span>
                <div>
                  <p className={`font-bold ${unlocked ? 'text-white' : ''}`}>{def.name}</p>
                  <p className={`mt-0.5 text-xs ${unlocked ? 'text-white/70' : 'text-[var(--wc-muted)]'}`}>{def.description}</p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${unlocked ? 'bg-black/30 text-white' : 'bg-[var(--wc-bg)] text-[var(--wc-muted)]'}`}>
                    {style.label}
                  </span>
                  {unlocked && (
                    <p className="mt-1 text-[10px] text-white/50">{unlocked.unlockedAt.slice(0, 10)}</p>
                  )}
                </div>
              </div>
              {!unlockedIds.has(def.id) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="text-2xl">🔒</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
