import { useMemo, useState } from 'react'
import {
  Area,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { cn } from '../lib/utils'
import {
  CHART_SERIES_COLORS,
  chartAxis,
  chartGrid,
  chartPalette,
  chartTooltipStyle,
  teamColor,
} from '../lib/chartTheme'
import { SpotlightCard } from './coach/SpotlightCard'
import { PerformanceRadar } from './coach/PerformanceRadar'
import { HeatmapChart } from './charts/HeatmapChart'
import {
  legendFormatter,
  makeLegendClickHandler,
  MatchTrendTooltip,
  RichChartTooltip,
  ShotsTooltip,
  useChartAnimation,
  useHoverIndex,
  useLegendToggle,
  formatChartValue,
} from './charts/chartShared'
import type { MatchTrend } from '../data/chartData'

/* ─── Chart wrapper ─── */

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  height?: string
  action?: React.ReactNode
}

export function ChartCard({ title, subtitle, children, className, height = 'h-64', action }: ChartCardProps) {
  return (
    <SpotlightCard title={title} subtitle={subtitle} className={cn('p-4', className)}>
      {action && <div className="mb-3 flex justify-end">{action}</div>}
      <div className={cn(height, 'min-h-[200px]')}>{children}</div>
    </SpotlightCard>
  )
}

/* ─── Comparison bar chart ─── */

export function ComparisonBarChart({
  data,
  keys,
  labels,
  sort = false,
}: {
  data: Record<string, unknown>[]
  keys: [string, string]
  labels: [string, string]
  sort?: boolean
}) {
  const anim = useChartAnimation()
  const { toggle, isVisible, hidden } = useLegendToggle(labels)
  const { setActiveIndex, barOpacity } = useHoverIndex()

  const sorted = useMemo(() => {
    if (!sort) return data
    return [...data].sort(
      (a, b) => Number(b[keys[0]] ?? 0) + Number(b[keys[1]] ?? 0) - (Number(a[keys[0]] ?? 0) + Number(a[keys[1]] ?? 0)),
    )
  }, [data, keys, sort])

  const colors = [CHART_SERIES_COLORS[0], CHART_SERIES_COLORS[1]]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sorted} margin={{ top: 12, right: 12, left: 4, bottom: 4 }} barGap={4}>
        <CartesianGrid {...chartGrid} />
        <XAxis dataKey="metric" tick={chartAxis.tick} axisLine={{ stroke: chartPalette.grid }} tickLine={false} />
        <YAxis tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <Tooltip
          content={({ active, payload, label }) => (
            <RichChartTooltip
              active={active}
              payload={payload}
              label={String(label)}
              rows={payload?.map((p, i) => ({
                label: labels[i] ?? String(p.name),
                value: typeof p.value === 'number' ? (Number.isInteger(p.value) ? p.value : p.value.toFixed(2)) : String(p.value),
                color: colors[i],
              }))}
            />
          )}
          cursor={chartTooltipStyle.cursor}
        />
        <Legend onClick={makeLegendClickHandler(toggle)} formatter={legendFormatter(hidden)} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        {keys.map((key, ki) =>
          isVisible(labels[ki]) ? (
            <Bar
              key={key}
              dataKey={key}
              name={labels[ki]}
              fill={colors[ki]}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
              {...anim}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {sorted.map((_, idx) => (
                <Cell key={idx} fillOpacity={barOpacity(idx)} className="transition-all duration-200" />
              ))}
              <LabelList dataKey={key} position="top" fill="#94a3b8" fontSize={10} formatter={formatChartValue} />
            </Bar>
          ) : null,
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── Simple horizontal bar (sorted, colored dots) ─── */

export function SimpleBarChart({
  data,
  dataKey,
  nameKey = 'name',
  sort = true,
  showLabels = true,
}: {
  data: Record<string, unknown>[]
  dataKey: string
  nameKey?: string
  sort?: boolean
  showLabels?: boolean
}) {
  const anim = useChartAnimation()
  const { setActiveIndex, barOpacity } = useHoverIndex()

  const sorted = useMemo(() => {
    const arr = [...data]
    if (sort) arr.sort((a, b) => Number(b[dataKey] ?? 0) - Number(a[dataKey] ?? 0))
    return arr
  }, [data, dataKey, sort])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: showLabels ? 40 : 16, left: 4, bottom: 4 }}>
        <CartesianGrid {...chartGrid} horizontal={false} />
        <XAxis type="number" tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey={nameKey} tick={chartAxis.tick} width={88} axisLine={false} tickLine={false} />
        <Tooltip
          content={({ active, payload, label }) => (
            <RichChartTooltip
              active={active}
              payload={payload}
              label={String(label)}
            />
          )}
          cursor={{ fill: 'rgba(170,255,69,0.06)' }}
        />
        <Bar
          dataKey={dataKey}
          radius={[0, 4, 4, 0]}
          maxBarSize={22}
          {...anim}
          onMouseEnter={(_, idx) => setActiveIndex(idx)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {sorted.map((entry, idx) => (
            <Cell
              key={idx}
              fill={(entry.color as string) ?? CHART_SERIES_COLORS[0]}
              fillOpacity={barOpacity(idx)}
              className="transition-all duration-200 hover:brightness-110"
            />
          ))}
          {showLabels && (
            <LabelList dataKey={dataKey} position="right" fill="#94a3b8" fontSize={10} />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── Donut ─── */

export function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  const anim = useChartAnimation()
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="52%"
          outerRadius="78%"
          paddingAngle={3}
          {...anim}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]} className="transition-opacity duration-200 hover:opacity-80" />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p = payload[0]
            const pct = total > 0 ? ((Number(p.value) / total) * 100).toFixed(1) : '0'
            return (
              <RichChartTooltip
                active={active}
                payload={payload}
                label={String(p.name)}
                rows={[
                  { label: 'Count', value: Number(p.value), color: p.color },
                  { label: 'Share', value: `${pct}%`, color: chartPalette.gold },
                ]}
              />
            )
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#e2e8f0" fontSize={14} fontWeight={700}>
          {total}
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}

/* ─── Distance / trend line with area + brush ─── */

export function DistanceLineChart({ data }: { data: Record<string, unknown>[] }) {
  const anim = useChartAnimation()
  const reduced = anim.animationDuration === 0

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: reduced ? 4 : 28 }}>
        <defs>
          <linearGradient id="distanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartPalette.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={chartPalette.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...chartGrid} />
        <XAxis dataKey="name" tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <YAxis tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <Tooltip content={<RichChartTooltip />} cursor={{ stroke: chartPalette.primary, strokeOpacity: 0.3 }} />
        <Area type="monotone" dataKey="distance" stroke="none" fill="url(#distanceGrad)" isAnimationActive={anim.isAnimationActive} animationDuration={anim.animationDuration} />
        <Line
          type="monotone"
          dataKey="distance"
          stroke={chartPalette.primary}
          strokeWidth={2.5}
          dot={{ fill: chartPalette.primary, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: chartPalette.gold, stroke: chartPalette.primary, strokeWidth: 2 }}
          {...anim}
        />
        {!reduced && (
          <Brush dataKey="name" height={22} stroke={chartPalette.primary} fill={chartPalette.surface} travellerWidth={8} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ─── Match trend (xG, goals, etc.) with brush zoom ─── */

export function MatchTrendChart({ data }: { data: MatchTrend[] }) {
  const anim = useChartAnimation()
  const { toggle, isVisible, hidden } = useLegendToggle(['xG', 'Goals'])
  const reduced = anim.animationDuration === 0

  const series = [
    { key: 'xG', label: 'xG', color: chartPalette.primary },
    { key: 'goals', label: 'Goals', color: chartPalette.gold },
  ] as const

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: reduced ? 4 : 28 }}>
        <defs>
          <linearGradient id="xgArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartPalette.primary} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartPalette.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...chartGrid} />
        <XAxis dataKey="match" tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <YAxis tick={chartAxis.tick} domain={[0, 'auto']} axisLine={false} tickLine={false} />
        <Tooltip content={<MatchTrendTooltip />} />
        <Legend onClick={makeLegendClickHandler(toggle)} formatter={legendFormatter(hidden)} wrapperStyle={{ fontSize: 11 }} />
        {isVisible('xG') && (
          <>
            <Area type="monotone" dataKey="xG" stroke="none" fill="url(#xgArea)" isAnimationActive={anim.isAnimationActive} animationDuration={anim.animationDuration} />
            <Line type="monotone" dataKey="xG" name="xG" stroke={series[0].color} strokeWidth={2.5} dot={{ r: 3, fill: series[0].color }} activeDot={{ r: 5 }} {...anim} />
          </>
        )}
        {isVisible('Goals') && (
          <Line type="monotone" dataKey="goals" name="Goals" stroke={series[1].color} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 4, fill: series[1].color }} {...anim} />
        )}
        {!reduced && <Brush dataKey="match" height={22} stroke={chartPalette.primary} fill={chartPalette.surface} />}
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ─── Form cumulative points ─── */

export function FormLineChart({ form, labels }: { form: ('W' | 'D' | 'L')[]; labels?: string[] }) {
  const anim = useChartAnimation()
  let pts = 0
  const data = form.map((r, i) => {
    pts += r === 'W' ? 3 : r === 'D' ? 1 : 0
    return { match: labels?.[i] ?? `M${i + 1}`, result: r, points: pts }
  })

  const resultColor = (r: string) => (r === 'W' ? chartPalette.primary : r === 'D' ? chartPalette.muted : chartPalette.danger)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid {...chartGrid} />
        <XAxis dataKey="match" tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <YAxis tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const row = payload[0].payload as { result: string; points: number }
            return (
              <RichChartTooltip
                active={active}
                payload={payload}
                label={String(label)}
                rows={[
                  { label: 'Result', value: row.result, color: resultColor(row.result) },
                  { label: 'Cumulative pts', value: row.points, color: chartPalette.gold },
                ]}
              />
            )
          }}
        />
        <Line
          type="monotone"
          dataKey="points"
          stroke={chartPalette.primary}
          strokeWidth={2.5}
          dot={(props) => {
            const { cx, cy, payload } = props as { cx: number; cy: number; payload: { result: string } }
            return <circle cx={cx} cy={cy} r={5} fill={resultColor(payload.result)} stroke="#0d1b2a" strokeWidth={1.5} />
          }}
          {...anim}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/* ─── League table bar (points) ─── */

export function LeaguePointsChart({ data }: { data: { team: string; pts: number; rank: number }[] }) {
  const anim = useChartAnimation()
  const { setActiveIndex, barOpacity } = useHoverIndex()
  const sorted = [...data].sort((a, b) => b.pts - a.pts)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 36, left: 4, bottom: 4 }}>
        <CartesianGrid {...chartGrid} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="team" tick={chartAxis.tick} width={72} axisLine={false} tickLine={false} />
        <Tooltip
          content={({ active, payload, label }) => (
            <RichChartTooltip active={active} payload={payload} label={String(label)} rows={[{ label: 'Points', value: Number(payload?.[0]?.value ?? 0), color: teamColor(String(label)) }]} />
          )}
        />
        <Bar dataKey="pts" radius={[0, 4, 4, 0]} maxBarSize={18} {...anim} onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)}>
          {sorted.map((d, i) => (
            <Cell key={d.team} fill={teamColor(d.team)} fillOpacity={barOpacity(i)} className="transition-all duration-200" />
          ))}
          <LabelList dataKey="pts" position="right" fill="#94a3b8" fontSize={10} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── xG vs Goals scatter ─── */

export function XgGoalsScatter({ data }: { data: { team: string; xG: number; goals: number }[] }) {
  const anim = useChartAnimation()
  const maxVal = Math.max(...data.flatMap((d) => [d.xG, d.goals])) * 1.1

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid {...chartGrid} />
        <XAxis type="number" dataKey="xG" name="xG" domain={[0, maxVal]} tick={chartAxis.tick} axisLine={false} tickLine={false} label={{ value: 'Expected Goals (xG)', ...chartAxis.label, position: 'insideBottom', offset: -2 }} />
        <YAxis type="number" dataKey="goals" name="Goals" domain={[0, maxVal]} tick={chartAxis.tick} axisLine={false} tickLine={false} label={{ value: 'Actual Goals', ...chartAxis.label, angle: -90, position: 'insideLeft' }} />
        <ZAxis range={[80, 80]} />
        <ReferenceLine segment={[{ x: 0, y: 0 }, { x: maxVal, y: maxVal }]} stroke={chartPalette.muted} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'xG = Goals', fill: chartPalette.muted, fontSize: 10 }} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as { team: string; xG: number; goals: number }
            const diff = p.goals - p.xG
            return (
              <RichChartTooltip
                active={active}
                payload={payload}
                label={p.team}
                rows={[
                  { label: 'xG', value: p.xG.toFixed(1), color: chartPalette.primary },
                  { label: 'Goals', value: p.goals, color: chartPalette.gold },
                  { label: 'Over/Under', value: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}`, color: diff >= 0 ? chartPalette.primary : chartPalette.danger },
                ]}
              />
            )
          }}
        />
        <Scatter
          data={data}
          {...anim}
          shape={(props) => {
            const { cx, cy, payload } = props as { cx: number; cy: number; payload: { team: string } }
            if (cx == null || cy == null) return null
            return (
              <circle
                cx={cx}
                cy={cy}
                r={7}
                fill={teamColor(payload.team)}
                fillOpacity={0.88}
                stroke="#0d1b2a"
                strokeWidth={1.5}
                className="transition-all duration-200"
              />
            )
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

/* ─── Player radar ─── */

export function PlayerRadarChart({ data }: { data: { subject: string; value: number; fullMark: number }[] }) {
  const radarData = data.map((d) => ({ metric: d.subject, value: d.value }))
  return <PerformanceRadar data={radarData} height={256} />
}

export function TeamRadarChart({ data, teams }: { data: { metric: string; value: number }[]; teams?: string[] }) {
  return <PerformanceRadar data={data} height={280} compareLabel={teams?.[0]} />
}

/* ─── Scatter distance/speed ─── */

export function ScatterDistanceSpeed({ data }: { data: { distance: number; speed: number; name: string }[] }) {
  const anim = useChartAnimation()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid {...chartGrid} />
        <XAxis type="number" dataKey="distance" name="Distance" tick={chartAxis.tick} axisLine={false} tickLine={false} unit=" m" />
        <YAxis type="number" dataKey="speed" name="Speed" tick={chartAxis.tick} axisLine={false} tickLine={false} unit=" km/h" />
        <ZAxis range={[70, 70]} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const p = payload[0].payload as { name: string; distance: number; speed: number }
            return (
              <RichChartTooltip
                active={active}
                payload={payload}
                label={p.name}
                rows={[
                  { label: 'Distance', value: `${p.distance.toLocaleString()} m`, color: chartPalette.primary },
                  { label: 'Top speed', value: `${p.speed} km/h`, color: chartPalette.gold },
                ]}
              />
            )
          }}
          cursor={{ strokeDasharray: '4 4', stroke: chartPalette.primary, strokeOpacity: 0.4 }}
        />
        <Scatter data={data} fill={chartPalette.primary} {...anim} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

/* ─── Shots stacked bar ─── */

export function ShotsBarChart({ data }: { data: { team: string; on: number; off: number; blocked?: number; xG?: number; color?: string }[] }) {
  const anim = useChartAnimation()
  const { toggle, isVisible, hidden } = useLegendToggle(['On Target', 'Off Target', 'Blocked'])
  const keys = [
    { key: 'on', label: 'On Target', color: chartPalette.primary },
    { key: 'off', label: 'Off Target', color: chartPalette.danger },
    { key: 'blocked', label: 'Blocked', color: chartPalette.muted },
  ] as const

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid {...chartGrid} />
        <XAxis dataKey="team" tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <YAxis tick={chartAxis.tick} axisLine={false} tickLine={false} />
        <Tooltip content={<ShotsTooltip />} />
        <Legend onClick={makeLegendClickHandler(toggle)} formatter={legendFormatter(hidden)} wrapperStyle={{ fontSize: 11 }} />
        {keys.map(({ key, label, color }) =>
          isVisible(label) ? (
            <Bar key={key} dataKey={key} name={label} stackId="shots" fill={color} maxBarSize={48} {...anim} className="transition-opacity duration-200" />
          ) : null,
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── Touch heatmap with player selector ─── */

export function TouchHeatmapChart({
  profiles,
  getGrid,
}: {
  profiles: { id: string; name: string }[]
  getGrid: (id: string) => number[][]
}) {
  const [selected, setSelected] = useState(profiles[0]?.id ?? '')

  return (
    <div className="flex h-full flex-col gap-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="self-end rounded-lg border border-coach-border bg-coach-surface px-3 py-1.5 text-xs text-slate-300"
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <div className="min-h-0 flex-1">
        <HeatmapChart grid={getGrid(selected)} />
      </div>
    </div>
  )
}

/* Re-export heatmap for direct use */
export { HeatmapChart } from './charts/HeatmapChart'
