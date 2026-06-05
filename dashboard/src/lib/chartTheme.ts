import { coachColors } from './coachTheme'

/** Sports analytics palette — deep navy base with vibrant metric accents */
export const chartPalette = {
  primary: coachColors.electricLime,
  secondary: '#3b82f6',
  gold: coachColors.trophyGold,
  danger: '#ef4444',
  purple: '#a855f7',
  cyan: '#06b6d4',
  orange: '#f97316',
  teal: '#14b8a6',
  navy: coachColors.stadiumNavy,
  muted: coachColors.textMuted,
  grid: coachColors.borderPitch,
  surface: coachColors.surfaceCard,
  teams: {
    morocco: '#C1272D',
    brazil: '#FFDF00',
    spain: '#AA151B',
    portugal: '#006600',
    france: '#0055A4',
    argentina: '#75AADB',
  },
} as const

export const CHART_SERIES_COLORS = [
  chartPalette.primary,
  chartPalette.secondary,
  chartPalette.gold,
  chartPalette.danger,
  chartPalette.purple,
  chartPalette.cyan,
  chartPalette.orange,
  chartPalette.teal,
] as const

export const chartAxis = {
  tick: { fill: chartPalette.muted, fontSize: 11, fontFamily: 'Inter, system-ui, sans-serif' },
  label: { fill: '#cbd5e1', fontSize: 11, fontWeight: 500 },
} as const

export const chartGrid = {
  strokeDasharray: '4 4',
  stroke: chartPalette.grid,
  strokeOpacity: 0.35,
  vertical: false,
} as const

export const chartTooltipStyle = {
  contentStyle: {
    background: chartPalette.surface,
    border: `1px solid ${chartPalette.grid}`,
    borderRadius: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
    padding: '10px 14px',
  },
  labelStyle: { color: '#e2e8f0', fontWeight: 600, marginBottom: 4, fontSize: 12 },
  itemStyle: { color: '#94a3b8', fontSize: 11, padding: '2px 0' },
  cursor: { fill: 'rgba(170, 255, 69, 0.08)', stroke: chartPalette.primary, strokeOpacity: 0.3 },
} as const

export const chartAnimation = {
  duration: 900,
  easing: 'ease-out' as const,
  lineDuration: 1200,
} as const

/** Perceptually uniform heatmap scale: cool → warm */
export const heatmapScale = ['#0d1b2a', '#1e3a5f', '#2563eb', '#22c55e', '#eab308', '#f97316', '#ef4444'] as const

export function teamColor(name: string): string {
  const key = name.toLowerCase().split(' ')[0]
  const map: Record<string, string> = chartPalette.teams
  return map[key] ?? CHART_SERIES_COLORS[Math.abs(name.length) % CHART_SERIES_COLORS.length]
}
