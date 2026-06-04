import { cn, formatNumber, formatPercent } from '../../lib/utils'
import { useCountUp } from '../../hooks/useCountUp'

interface StatTileProps {
  label: string
  value: unknown
  suffix?: string
  isPercent?: boolean
  sub?: string
  className?: string
}

export function StatTile({ label, value, suffix, isPercent, sub, className }: StatTileProps) {
  const num = isPercent ? Number(value) || 0 : Number(value) || 0
  const { value: animated, flashing } = useCountUp(num)
  const display = isPercent
    ? `${Math.round(animated)}%`
    : `${formatNumber(animated, isPercent ? 1 : 0)}${suffix ?? ''}`

  return (
    <div className={cn('coach-card', className)}>
      <p className="coach-heading text-xs font-semibold text-slate-500">{label}</p>
      <p className={cn('coach-stat mt-1 text-2xl font-bold text-coach-lime', flashing && 'coach-scoreboard-flash')}>
        {display}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

/** Backward-compatible wrapper for string display values */
export function StatTileRaw({ label, value, sub, className }: { label: string; value: string; sub?: string; className?: string }) {
  return (
    <div className={cn('coach-card', className)}>
      <p className="coach-heading text-xs font-semibold text-slate-500">{label}</p>
      <p className="coach-stat mt-1 text-2xl font-bold text-coach-lime">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export { formatPercent }
