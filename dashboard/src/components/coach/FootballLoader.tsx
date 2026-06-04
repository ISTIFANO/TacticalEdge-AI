import { cn } from '../../lib/utils'

export function FootballLoader({ message = 'Loading analytics…', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16', className)}>
      <svg className="coach-ball-loader h-10 w-10" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#1a3a2a" stroke="#AAFF45" strokeWidth="1.5" />
        <path d="M16 4 L20 12 L16 16 L12 12 Z" fill="#AAFF45" opacity="0.8" />
        <path d="M16 16 L24 14 L28 20 L22 24 L16 22 Z" fill="#AAFF45" opacity="0.5" />
        <path d="M16 16 L8 14 L4 20 L10 24 L16 22 Z" fill="#AAFF45" opacity="0.5" />
      </svg>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  )
}

export function FootballSkeleton({ className }: { className?: string }) {
  return <div className={cn('coach-skeleton h-32 rounded-xl', className)} />
}
