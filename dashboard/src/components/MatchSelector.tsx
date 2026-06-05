import { useMatchStore } from '../store/matchStore'
import type { MatchMode } from '../types/analytics'
import { cn } from '../lib/utils'

const OPTIONS: { value: MatchMode; label: string }[] = [
  { value: '1', label: 'Match 1 — My Team' },
  { value: '2', label: 'Match 2 — Opponent' },
  { value: 'both', label: 'Compare Both' },
]

export function MatchSelector({ className }: { className?: string }) {
  const { matchMode, setMatchMode } = useMatchStore()

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setMatchMode(opt.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            matchMode === opt.value
              ? 'bg-pitch text-navy'
              : 'bg-navy-lighter text-slate-300 hover:bg-slate-600',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
