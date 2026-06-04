import { useState } from 'react'
import { useMatchStore } from '../store/matchStore'
import { useTracking } from '../lib/api'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { TrackingPitch } from '../components/FormationPitch'
import { AnimatedDataTable } from '../components/coach/AnimatedDataTable'
import { CoachButton } from '../components/coach/CoachButton'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import type { Column } from '../components/DataTable'
import type { TrackPoint } from '../types/analytics'

const COLUMNS: Column<TrackPoint>[] = [
  { key: 'frame', label: 'Frame', sortable: true },
  { key: 'class_label', label: 'Class' },
  { key: 'track_id', label: 'Track ID', sortable: true },
  { key: 'center_x', label: 'X', align: 'right' },
  { key: 'center_y', label: 'Y', align: 'right' },
]

export function TrackingExplorerPage() {
  const videoId = useMatchStore((s) => s.videoId())
  const [frame, setFrame] = useState<number | undefined>()
  const [classFilter, setClassFilter] = useState<string>('')
  const [offset, setOffset] = useState(0)
  const limit = 100

  const { data, isLoading, error } = useTracking(videoId, {
    frame,
    classLabel: classFilter || undefined,
    limit,
    offset,
  })

  if (isLoading && !data) return <LoadingState message="Loading tracking data…" />
  if (error) return <EmptyState title="Failed to load tracking" description={String(error)} />

  const maxFrame = data?.max_frame ?? 0
  const pitchPoints = (data?.items ?? [])
    .filter((p) => p.center_x != null && p.center_y != null)
    .map((p) => ({ x: p.center_x!, y: p.center_y!, track_id: p.track_id, class_label: p.class_label }))

  return (
    <CoachPageShell
      title="Tracking Explorer"
      subtitle={`${data?.total ?? 0} tracks · max frame ${maxFrame}`}
    >
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Frame</label>
          <input
            type="range"
            min={0}
            max={maxFrame}
            value={frame ?? 0}
            onChange={(e) => { setFrame(Number(e.target.value)); setOffset(0) }}
            className="w-64 accent-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/50"
          />
          <input
            type="number"
            min={0}
            max={maxFrame}
            value={frame ?? ''}
            placeholder="All frames"
            onChange={(e) => { setFrame(e.target.value ? Number(e.target.value) : undefined); setOffset(0) }}
            className="ml-2 w-24 rounded border border-coach-border bg-coach-surface px-2 py-1 text-sm focus:border-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Class</label>
          <select
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setOffset(0) }}
            className="rounded-lg border border-coach-border bg-coach-surface px-3 py-1.5 text-sm focus:border-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/30"
          >            <option value="">All</option>
            <option value="player">Player</option>
            <option value="ball">Ball</option>
          </select>
        </div>
      </div>

      {pitchPoints.length > 0 && (
        <SpotlightCard className="p-4">
          <TrackingPitch points={pitchPoints} />
        </SpotlightCard>
      )}

      <AnimatedDataTable data={data?.items ?? []} columns={COLUMNS} keyField="track_id" />

      <div className="flex items-center justify-between">
        <CoachButton variant="outline" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
          Previous
        </CoachButton>
        <span className="text-sm text-slate-500">
          {offset + 1}–{Math.min(offset + limit, data?.total ?? 0)} of {data?.total ?? 0}
        </span>
        <CoachButton variant="outline" disabled={offset + limit >= (data?.total ?? 0)} onClick={() => setOffset(offset + limit)}>
          Next
        </CoachButton>
      </div>
    </CoachPageShell>
  )
}