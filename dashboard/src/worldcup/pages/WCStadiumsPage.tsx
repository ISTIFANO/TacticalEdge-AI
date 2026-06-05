import { Users } from 'lucide-react'
import { STADIUMS } from '../data/mockData'

export function WCStadiumsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Stadiums</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {STADIUMS.map((s) => (
          <div key={s.id} className="wc-card overflow-hidden">
            <img src={s.image} alt="" className="h-44 w-full object-cover" />
            <div className="p-5">
              <h3 className="font-bold">{s.name}</h3>
              <p className="text-sm text-[var(--wc-muted)]">{s.city}, {s.country}</p>
              <p className="mt-3 flex items-center gap-2 text-[var(--wc-gold)]">
                <Users className="h-4 w-4" /> {s.capacity.toLocaleString()} capacity
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
