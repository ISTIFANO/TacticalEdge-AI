import { Trophy } from 'lucide-react'
import { usePassport } from '../../context/PassportContext'

export function LeaderboardPanel() {
  const { leaderboard } = usePassport()

  return (
    <section>
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <Trophy className="h-5 w-5 text-[var(--wc-gold)]" /> Fan Leaderboard
      </h2>
      <p className="mt-1 text-sm text-[var(--wc-muted)]">Ranked by loyalty points, attendance & badges</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[var(--wc-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--wc-card)] text-xs uppercase text-[var(--wc-muted)]">
            <tr>
              <th className="px-4 py-3 text-start">#</th>
              <th className="px-4 py-3 text-start">Fan</th>
              <th className="hidden px-4 py-3 sm:table-cell">Matches</th>
              <th className="hidden px-4 py-3 md:table-cell">Badges</th>
              <th className="px-4 py-3 text-end">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr
                key={`${entry.rank}-${entry.name}`}
                className={`border-t border-[var(--wc-border)] transition ${entry.isCurrentUser ? 'bg-[var(--wc-gold)]/10' : 'hover:bg-[var(--wc-card)]'}`}
              >
                <td className="px-4 py-3 font-bold text-[var(--wc-gold)]">
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                </td>
                <td className="px-4 py-3">
                  <span className="me-2">{entry.flag}</span>
                  <span className="font-medium">{entry.name}</span>
                  {entry.isCurrentUser && (
                    <span className="ms-2 rounded bg-[var(--wc-gold)] px-1.5 py-0.5 text-[10px] font-bold text-black">YOU</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">{entry.matches}</td>
                <td className="hidden px-4 py-3 md:table-cell">{entry.badges}</td>
                <td className="px-4 py-3 text-end font-bold">{entry.points.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
