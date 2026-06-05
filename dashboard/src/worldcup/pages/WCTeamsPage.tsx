import { Heart } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useWCAuth } from '../context/WCAuthContext'
import { TEAMS } from '../data/mockData'

export function WCTeamsPage() {
  const { t } = useI18n()
  const { user, toggleFavorite } = useWCAuth()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t('nav.teams')}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEAMS.map((team) => {
          const fav = user?.favorites?.includes(team.id)
          return (
            <div key={team.id} className="wc-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-4xl">{team.flag}</span>
                {user?.role === 'fan' && (
                  <button type="button" onClick={() => toggleFavorite(team.id)} aria-label="Favorite">
                    <Heart className={`h-5 w-5 ${fav ? 'fill-red-500 text-red-500' : 'text-[var(--wc-muted)]'}`} />
                  </button>
                )}
              </div>
              <h3 className="mt-4 text-xl font-bold">{team.name}</h3>
              <p className="text-sm text-[var(--wc-muted)]">FIFA Rank #{team.rank} · Group {team.group}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div><dt className="text-[var(--wc-muted)]">Wins (qualifiers)</dt><dd className="font-bold">{team.wins}</dd></div>
                <div><dt className="text-[var(--wc-muted)]">Goals</dt><dd className="font-bold">{team.goals}</dd></div>
              </dl>
            </div>
          )
        })}
      </div>
    </div>
  )
}
