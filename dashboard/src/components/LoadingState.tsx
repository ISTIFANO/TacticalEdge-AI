import { FootballLoader } from './coach/FootballLoader'

export function LoadingState({ message = 'Loading analytics…', className }: { message?: string; className?: string }) {
  return <FootballLoader message={message} className={className} />
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-coach-border bg-coach-surface/50 py-16 text-center">
      <p className="text-lg font-medium text-slate-300">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
    </div>
  )
}
