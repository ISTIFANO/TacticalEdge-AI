import { useState } from 'react'
import { useMatchStore } from '../store/matchStore'
import { useTimeline, useTracking } from '../lib/api'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { TrackingPitch } from '../components/FormationPitch'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import { cn } from '../lib/utils'

export function TimelinePage() {
  const videoId = useMatchStore((s) => s.videoId())
  const { data: timeline, isLoading: lt, error } = useTimeline(videoId)
  const [frame, setFrame] = useState<number | undefined>()
  const { data: tracking } = useTracking(videoId, { frame, limit: 200 })

  if (lt) return <LoadingState />
  if (error) return <EmptyState title="Failed to load timeline" description={String(error)} />

  const maxFrame = timeline?.max_frame ?? 0
  const events = timeline?.events ?? []
  const pitchPoints = (tracking?.items ?? [])
    .filter((p) => p.center_x != null && p.center_y != null)
    .map((p) => ({ x: p.center_x!, y: p.center_y!, class_label: p.class_label, track_id: p.track_id }))

  return (
    <CoachPageShell title="Event Timeline" subtitle="Frame-based pitch view — no video required">
      <div>
        <label className="mb-1 block text-xs text-slate-500">Frame {frame ?? 0}</label>
        <input
          type="range"
          min={0}
          max={maxFrame}
          value={frame ?? 0}
          onChange={(e) => setFrame(Number(e.target.value))}
          className="w-full max-w-xl accent-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {events.map((ev, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setFrame(ev.frame)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs transition-colors',
              frame === ev.frame
                ? 'border-coach-lime bg-coach-lime/10 text-coach-lime'
                : 'border-coach-border text-slate-400 hover:border-coach-lime/40',
            )}
          >
            {ev.label} @ f{ev.frame}
          </button>
        ))}
      </div>

      {pitchPoints.length > 0 && (
        <SpotlightCard className="p-4">
          <TrackingPitch points={pitchPoints} />
        </SpotlightCard>
      )}
    </CoachPageShell>
  )
}
