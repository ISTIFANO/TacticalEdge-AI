import { useCallback, useState } from 'react'
import type { LegendPayload } from 'recharts'
import { chartPalette, chartAnimation, chartTooltipStyle } from '../../lib/chartTheme'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function useLegendToggle(_keys?: string[]) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  const toggle = useCallback((dataKey: string) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(dataKey)) next.delete(dataKey)
      else next.add(dataKey)
      return next
    })
  }, [])

  const isVisible = useCallback((key: string) => !hidden.has(key), [hidden])

  return { hidden, toggle, isVisible }
}

export function useHoverIndex() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  return {
    activeIndex,
    setActiveIndex,
    barOpacity: (index: number) => (activeIndex === null || activeIndex === index ? 1 : 0.35),
  }
}

export function useChartAnimation() {
  const reduced = useReducedMotion()
  return {
    isAnimationActive: !reduced,
    animationDuration: reduced ? 0 : chartAnimation.duration,
    animationEasing: chartAnimation.easing,
  }
}

interface TooltipPayloadItem {
  name?: string | number
  value?: number | string | readonly (string | number)[]
  color?: string
  dataKey?: string | number
  payload?: Record<string, unknown>
}

export interface RichTooltipRow {
  label: string
  value: string | number
  color?: string
}

export interface RichTooltipProps {
  active?: boolean
  payload?: unknown
  label?: string | number
  rows?: RichTooltipRow[]
}

export function RichChartTooltip({ active, payload, label, rows }: RichTooltipProps) {
  if (!active) return null
  const items = (Array.isArray(payload) ? payload : []) as TooltipPayloadItem[]
  if (!items.length && !rows?.length) return null

  const extraRows =
    rows ??
    items.map((p) => ({
      label: String(p.name ?? p.dataKey),
      value:
        typeof p.value === 'number'
          ? Number.isInteger(p.value)
            ? p.value
            : p.value.toFixed(2)
          : Array.isArray(p.value)
            ? p.value.join(', ')
            : String(p.value ?? ''),
      color: p.color,
    }))

  return (
    <div style={chartTooltipStyle.contentStyle} className="pointer-events-none min-w-[160px]">
      {label != null && label !== '' && <p style={chartTooltipStyle.labelStyle}>{String(label)}</p>}
      <div className="space-y-1">
        {extraRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              {row.color && <span className="inline-block h-2 w-2 rounded-full" style={{ background: row.color }} />}
              {row.label}
            </span>
            <span className="font-mono font-semibold text-slate-100">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ShotsTooltip({ active, payload, label }: RichTooltipProps) {
  if (!active) return null
  const items = (Array.isArray(payload) ? payload : []) as TooltipPayloadItem[]
  if (!items.length) return null
  const row = items[0]?.payload as { on?: number; off?: number; blocked?: number; xG?: number; team?: string } | undefined
  const rows: RichTooltipRow[] = [
    { label: 'xG', value: row?.xG?.toFixed(2) ?? '—', color: chartPalette.gold },
    { label: 'On target', value: row?.on ?? 0, color: chartPalette.primary },
    { label: 'Off target', value: row?.off ?? 0, color: chartPalette.danger },
    { label: 'Blocked', value: row?.blocked ?? 0, color: chartPalette.muted },
    { label: 'Total shots', value: (row?.on ?? 0) + (row?.off ?? 0) + (row?.blocked ?? 0), color: chartPalette.secondary },
  ]
  return <RichChartTooltip active={active} payload={payload} label={row?.team ?? label} rows={rows} />
}

interface MatchTrendPayload {
  opponent: string
  xG: number
  goals: number
  shots: number
  shotsOnTarget: number
  possession: number
  passAccuracy: number
  ppda: number
}

export function MatchTrendTooltip({ active, payload, label }: RichTooltipProps) {
  if (!active) return null
  const items = (Array.isArray(payload) ? payload : []) as TooltipPayloadItem[]
  if (!items.length) return null
  const row = items[0]?.payload as MatchTrendPayload | undefined
  if (!row) return null

  const rows: RichTooltipRow[] = [
    { label: 'xG', value: row.xG.toFixed(2), color: chartPalette.primary },
    { label: 'Goals', value: row.goals, color: chartPalette.gold },
    { label: 'Shots', value: row.shots, color: chartPalette.secondary },
    { label: 'On target', value: row.shotsOnTarget, color: chartPalette.teal },
    { label: 'Possession', value: `${row.possession}%`, color: chartPalette.purple },
    { label: 'Pass acc.', value: `${row.passAccuracy}%`, color: chartPalette.cyan },
    { label: 'PPDA', value: row.ppda.toFixed(1), color: chartPalette.orange },
  ]
  return <RichChartTooltip active={active} payload={payload} label={`${label} vs ${row.opponent}`} rows={rows} />
}

export function makeLegendClickHandler(toggle: (key: string) => void) {
  return (entry: LegendPayload) => {
    const key = String(entry.value ?? entry.dataKey ?? '')
    if (key) toggle(key)
  }
}

export function legendFormatter(hidden: Set<string>) {
  return (value: string) => (
    <span
      style={{
        color: hidden.has(value) ? chartPalette.muted : '#cbd5e1',
        textDecoration: hidden.has(value) ? 'line-through' : 'none',
        cursor: 'pointer',
      }}
    >
      {value}
    </span>
  )
}

export function formatChartValue(v: unknown): string | number {
  if (typeof v === 'number') return Number.isInteger(v) ? v : v.toFixed(1)
  if (v == null) return ''
  return String(v)
}
