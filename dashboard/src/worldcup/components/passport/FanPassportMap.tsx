import { MAP_POINTS } from '../../data/mockData'
import { usePassport } from '../../context/PassportContext'

export function FanPassportMap() {
  const { passport } = usePassport()
  if (!passport) return null

  const visitedCitySet = new Set(passport.visitedCities.map((c) => c.toLowerCase()))
  const visitedStadiumSet = new Set(passport.visitedStadiums.map((s) => s.toLowerCase()))

  return (
    <section>
      <h2 className="text-xl font-bold">Journey Map</h2>
      <p className="mt-1 text-sm text-[var(--wc-muted)]">
        {passport.visitedCities.length} cities · {passport.visitedStadiums.length} stadiums visited
      </p>
      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--wc-border)] bg-gradient-to-br from-[#0a1628] to-[#1a2a1a]">
        <svg viewBox="0 0 100 80" className="h-full w-full opacity-30">
          <ellipse cx="35" cy="55" rx="18" ry="22" fill="#C5A572" opacity="0.15" />
          <ellipse cx="50" cy="45" rx="14" ry="18" fill="#C5A572" opacity="0.15" />
          <ellipse cx="22" cy="50" rx="10" ry="14" fill="#C5A572" opacity="0.15" />
        </svg>

        {MAP_POINTS.filter((p) => p.type === 'stadium' || p.type === 'hotel' || p.type === 'airport').map((point) => {
          const isCityVisited = visitedCitySet.has(point.city.toLowerCase())
          const isStadiumVisited = point.type === 'stadium' && visitedStadiumSet.has(point.name.toLowerCase())
          const visited = isCityVisited || isStadiumVisited

          return (
            <div
              key={point.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                  visited
                    ? 'passport-map-pulse bg-[var(--wc-gold)] shadow-lg shadow-[var(--wc-gold)]/40'
                    : 'bg-white/10 text-white/40'
                }`}
                title={`${point.name} — ${point.city}`}
              >
                {point.type === 'stadium' ? '🏟️' : point.type === 'airport' ? '✈️' : '🏨'}
              </div>
              {visited && (
                <span className="absolute -bottom-5 start-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-medium text-[var(--wc-gold)]">
                  {point.city}
                </span>
              )}
            </div>
          )
        })}

        <div className="absolute bottom-3 start-3 flex gap-4 text-[10px] text-white/60">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--wc-gold)]" /> Visited</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white/20" /> Not yet</span>
        </div>
      </div>
    </section>
  )
}
