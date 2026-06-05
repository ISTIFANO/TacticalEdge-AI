import { useEffect, useState } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { chartAxis, chartPalette, chartTooltipStyle } from '../../lib/chartTheme'

interface PerformanceRadarProps {
  data: { metric: string; value: number }[]
  height?: number
  compareLabel?: string
}

export function PerformanceRadar({ data, height = 256, compareLabel }: PerformanceRadarProps) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(reduced)

  useEffect(() => {
    if (reduced) {
      setMounted(true)
      return
    }
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [reduced])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
        <PolarGrid stroke={chartPalette.grid} strokeOpacity={0.45} />
        <PolarAngleAxis dataKey="metric" tick={{ ...chartAxis.tick, fontSize: 10 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: chartPalette.muted, fontSize: 9 }} tickCount={5} axisLine={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const row = payload[0].payload as { metric: string; value: number }
            return (
              <div style={chartTooltipStyle.contentStyle}>
                <p style={chartTooltipStyle.labelStyle}>{compareLabel ? `${compareLabel} — ${row.metric}` : row.metric}</p>
                <p className="font-mono text-sm font-bold text-coach-lime">{row.value}/100</p>
              </div>
            )
          }}
        />
        <Radar
          name={compareLabel ?? 'Performance'}
          dataKey="value"
          stroke={chartPalette.primary}
          fill={chartPalette.primary}
          fillOpacity={mounted ? 0.32 : 0}
          strokeWidth={2}
          isAnimationActive={!reduced}
          animationDuration={1200}
          animationEasing="ease-out"
          dot={{ r: 3, fill: chartPalette.gold, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: chartPalette.gold, stroke: chartPalette.primary, strokeWidth: 2 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
