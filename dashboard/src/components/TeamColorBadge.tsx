import { cn } from '../lib/utils'
import type { TeamColor } from '../types/analytics'

interface TeamColorBadgeProps {
  color?: TeamColor | null
  className?: string
}

export function TeamColorBadge({ color, className }: TeamColorBadgeProps) {
  if (!color) {
    return <span className={cn('inline-block h-4 w-4 rounded-full bg-slate-600', className)} />
  }
  return (
    <span
      className={cn('inline-block h-4 w-4 rounded-full ring-2 ring-white/20', className)}
      style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
      title={`RGB(${color.r}, ${color.g}, ${color.b})`}
    />
  )
}
