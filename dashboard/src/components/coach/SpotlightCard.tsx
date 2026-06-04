import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { useSpotlight } from '../../hooks/useSpotlight'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
}

export function SpotlightCard({ children, className, title, subtitle }: SpotlightCardProps) {
  const { ref, onMove } = useSpotlight()

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn('coach-card relative overflow-hidden', className)}
      style={{
        background: 'radial-gradient(400px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(170,255,69,0.06), transparent 40%), var(--coach-surface)',
      }}
    >
      {title && (
        <h3 className="coach-heading mb-1 text-sm font-semibold text-slate-400">{title}</h3>
      )}
      {subtitle && (
        <p className="mb-3 text-xs text-slate-500">{subtitle}</p>
      )}
      {!subtitle && title && <div className="mb-3" />}
      {children}
    </div>
  )
}
