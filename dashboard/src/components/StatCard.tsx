import { StatTile } from './coach/StatTile'

interface StatCardProps {
  label: string
  value: unknown
  suffix?: string
  isPercent?: boolean
  sub?: string
  className?: string
}

/** Backward-compatible wrapper — delegates to coach StatTile */
export function StatCard(props: StatCardProps) {
  return <StatTile {...props} />
}
