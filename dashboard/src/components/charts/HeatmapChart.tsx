import { useMemo } from 'react'
import { heatmapScale } from '../../lib/chartTheme'

interface HeatmapChartProps {
  grid: number[][]
  className?: string
  showPitch?: boolean
}

function interpolateColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const idx = clamped * (heatmapScale.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, heatmapScale.length - 1)
  const f = idx - lo
  if (lo === hi) return heatmapScale[lo]

  const parse = (hex: string) => {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
  }
  const [r1, g1, b1] = parse(heatmapScale[lo])
  const [r2, g2, b2] = parse(heatmapScale[hi])
  const r = Math.round(r1 + (r2 - r1) * f)
  const g = Math.round(g1 + (g2 - g1) * f)
  const b = Math.round(b1 + (b2 - b1) * f)
  return `rgb(${r},${g},${b})`
}

export function HeatmapChart({ grid, className = '', showPitch = true }: HeatmapChartProps) {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0

  const circles = useMemo(() => {
    const out: { cx: number; cy: number; r: number; color: string; opacity: number }[] = []
    const cellW = 100 / cols
    const cellH = 100 / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = grid[r][c]
        if (v < 0.05) continue
        out.push({
          cx: c * cellW + cellW / 2,
          cy: r * cellH + cellH / 2,
          r: Math.max(cellW, cellH) * 0.85,
          color: interpolateColor(v),
          opacity: 0.55 + v * 0.4,
        })
      }
    }
    return out
  }, [grid, rows, cols])

  return (
    <div className={`relative h-full w-full ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full rounded-lg">
        <defs>
          <filter id="heatmap-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" />
          </filter>
        </defs>

        {showPitch && (
          <>
            <rect width="100" height="100" fill="#0a3d1f" rx="2" />
            <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
            <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.12)" strokeWidth="0.35" />
            <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.35" />
            <rect x="2" y="28" width="16" height="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
            <rect x="82" y="28" width="16" height="44" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
          </>
        )}

        <g filter="url(#heatmap-blur)">
          {circles.map((c, i) => (
            <circle
              key={i}
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill={c.color}
              opacity={c.opacity}
              className="transition-opacity duration-300"
            />
          ))}
        </g>
      </svg>

      <div className="absolute bottom-2 end-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[9px] text-slate-400">
        <span>Low</span>
        <div className="flex h-2 w-16 overflow-hidden rounded-sm">
          {heatmapScale.map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  )
}
