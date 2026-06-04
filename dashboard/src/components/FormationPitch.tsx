import type { LineupPlayer } from '../types/analytics'

interface FormationPitchProps {
  players?: LineupPlayer[]
  width?: number
  height?: number
  className?: string
}

const FORMATION_SLOTS: Record<string, [number, number][]> = {
  '4-4-2': [
    [0.5, 0.92],
    [0.15, 0.72], [0.38, 0.72], [0.62, 0.72], [0.85, 0.72],
    [0.15, 0.48], [0.38, 0.48], [0.62, 0.48], [0.85, 0.48],
    [0.35, 0.22], [0.65, 0.22],
  ],
  default: [
    [0.5, 0.9],
    [0.2, 0.7], [0.4, 0.7], [0.6, 0.7], [0.8, 0.7],
    [0.2, 0.45], [0.4, 0.45], [0.6, 0.45], [0.8, 0.45],
    [0.35, 0.2], [0.65, 0.2],
  ],
}

export function FormationPitch({ players = [], width = 400, height = 560, className }: FormationPitchProps) {
  const slots = FORMATION_SLOTS['4-4-2']
  const display = players.slice(0, 11)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} style={{ width: '100%', maxWidth: width }}>
      <rect x={0} y={0} width={width} height={height} fill="#166534" rx={8} />
      <rect x={20} y={20} width={width - 40} height={height - 40} fill="none" stroke="#22c55e" strokeWidth={2} opacity={0.6} />
      <line x1={width / 2} y1={20} x2={width / 2} y2={height - 20} stroke="#22c55e" strokeWidth={2} opacity={0.5} />
      <circle cx={width / 2} cy={height / 2} r={50} fill="none" stroke="#22c55e" strokeWidth={2} opacity={0.5} />
      <rect x={width * 0.25} y={20} width={width * 0.5} height={80} fill="none" stroke="#22c55e" strokeWidth={2} opacity={0.4} />
      <rect x={width * 0.25} y={height - 100} width={width * 0.5} height={80} fill="none" stroke="#22c55e" strokeWidth={2} opacity={0.4} />

      {slots.map(([nx, ny], i) => {
        const player = display[i]
        const cx = nx * width
        const cy = ny * height
        const num = player?.shirt_number ?? player?.Shirt_Number ?? i + 1
        const pos = player?.position ?? player?.Position ?? ''
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={18} fill="#0f172a" stroke="#22c55e" strokeWidth={2} />
            <text x={cx} y={cy + 5} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
              {String(num)}
            </text>
            {pos && (
              <text x={cx} y={cy + 32} textAnchor="middle" fill="#bbf7d0" fontSize={9}>
                {String(pos).slice(0, 3)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

interface TrackingPitchProps {
  points: { x: number; y: number; track_id?: number; class_label?: string }[]
  width?: number
  height?: number
}

export function TrackingPitch({ points, width = 640, height = 360 }: TrackingPitchProps) {
  const scaleX = (x: number) => (x / 1920) * (width - 40) + 20
  const scaleY = (y: number) => (y / 1080) * (height - 40) + 20

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%' }}>
      <rect x={0} y={0} width={width} height={height} fill="#166534" rx={8} />
      <rect x={10} y={10} width={width - 20} height={height - 20} fill="none" stroke="#22c55e" strokeWidth={1.5} opacity={0.5} />
      <line x1={width / 2} y1={10} x2={width / 2} y2={height - 10} stroke="#22c55e" strokeWidth={1} opacity={0.4} />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={scaleX(p.x)}
          cy={scaleY(p.y)}
          r={p.class_label === 'ball' ? 5 : 4}
          fill={p.class_label === 'ball' ? '#fff' : '#22c55e'}
          opacity={0.85}
        />
      ))}
    </svg>
  )
}
