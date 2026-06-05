import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Upload, Link2, Play } from 'lucide-react'
import {
  usePipelineStatus,
  useStartPipelineFromUrls,
  useUploadVideos,
} from '../lib/api'
import { LoadingState } from '../components/LoadingState'
import { CoachButton } from '../components/coach/CoachButton'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
const MODES = [
  { id: 'full', label: 'Full match', desc: 'Complete analysis (~1h CPU)' },
  { id: 'halftime', label: 'Halftime', desc: 'First half only + brief report' },
  { id: 'live_lite', label: 'Live Lite', desc: 'Smaller batches, live CSV updates' },
] as const

export function UploadPage() {
  const { data: status, refetch } = usePipelineStatus()
  const upload = useUploadVideos()
  const startUrls = useStartPipelineFromUrls()

  const [teamFile, setTeamFile] = useState<File | null>(null)
  const [oppFile, setOppFile] = useState<File | null>(null)
  const [teamUrl, setTeamUrl] = useState('')
  const [oppUrl, setOppUrl] = useState('')
  const [mode, setMode] = useState<'full' | 'halftime' | 'live_lite'>('full')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const busy = upload.isPending || startUrls.isPending || status?.pipeline_running

  const onUploadAndRun = async () => {
    setError(null)
    setMessage(null)
    if (!teamFile || !oppFile) {
      setError('Select both video files (your team + opponent).')
      return
    }
    try {
      await upload.mutateAsync({ teamFile, opponentFile: oppFile, mode })
      setMessage('Upload complete — pipeline started. Open Live Monitor for progress.')
      refetch()
    } catch (e) {
      setError(String(e))
    }
  }

  const onUrlRun = async () => {
    setError(null)
    setMessage(null)
    if (!teamUrl.trim() || !oppUrl.trim()) {
      setError('Enter both video URLs (direct link or Google Drive).')
      return
    }
    try {
      await startUrls.mutateAsync({
        teamUrl: teamUrl.trim(),
        opponentUrl: oppUrl.trim(),
        mode,
      })
      setMessage('Videos downloading — pipeline will start automatically.')
      refetch()
    } catch (e) {
      setError(String(e))
    }
  }

  if (!status) return <LoadingState message="Loading pipeline status…" />

  return (
    <CoachPageShell
      title="Analyze Videos"
      subtitle="Upload match videos or paste URLs — runs full CV, recommendations, and coach reports"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            status.team_video_ready ? 'border-coach-lime/40 bg-coach-lime/5 text-coach-lime' : 'border-coach-border text-slate-400'
          }`}
        >
          Your team video: {status.team_video_ready ? 'Ready' : 'Missing'}
        </div>
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            status.opponent_video_ready ? 'border-coach-lime/40 bg-coach-lime/5 text-coach-lime' : 'border-coach-border text-slate-400'
          }`}
        >
          Opponent video: {status.opponent_video_ready ? 'Ready' : 'Missing'}
        </div>
      </div>

      {status.pipeline_running && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          Pipeline running —{' '}
          <Link to="/app/live" className="font-medium text-coach-lime underline">
            view progress
          </Link>
        </div>
      )}

      <SpotlightCard className="space-y-4 p-6">        <div className="flex items-center gap-2 text-white">
          <Upload className="h-5 w-5 text-coach-lime" />
          <h3 className="coach-heading font-semibold">Upload from computer</h3>
        </div>        <p className="text-xs text-slate-500">1080p+ broadcast / eagle-eye footage recommended (.mp4)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">Your team match</span>
            <input
              type="file"
              accept="video/*,.mp4,.mov,.avi,.mkv"
              onChange={(e) => setTeamFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-coach-lime file:px-3 file:py-1.5 file:text-coach-navy"            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">Opponent match</span>
            <input
              type="file"
              accept="video/*,.mp4,.mov,.avi,.mkv"
              onChange={(e) => setOppFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-coach-lime file:px-3 file:py-1.5 file:text-coach-navy"            />
          </label>
        </div>
        <CoachButton disabled={busy} onClick={onUploadAndRun}>
          {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Upload &amp; run analysis
        </CoachButton>
      </SpotlightCard>

      <SpotlightCard className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-white">
          <Link2 className="h-5 w-5 text-coach-lime" />
          <h3 className="coach-heading font-semibold">Or paste video URLs</h3>
        </div>        <p className="text-xs text-slate-500">Direct .mp4 link or Google Drive share URL</p>
        <input
          type="url"
          placeholder="Your team video URL"
          value={teamUrl}
          onChange={(e) => setTeamUrl(e.target.value)}
          className="w-full rounded-lg border border-coach-border bg-coach-navy px-3 py-2 text-sm text-white focus:border-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/30"        />
        <input
          type="url"
          placeholder="Opponent video URL"
          value={oppUrl}
          onChange={(e) => setOppUrl(e.target.value)}
          className="w-full rounded-lg border border-coach-border bg-coach-navy px-3 py-2 text-sm text-white focus:border-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/30"        />
        <CoachButton variant="outline" disabled={busy} onClick={onUrlRun}>
          {startUrls.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Download URLs &amp; run analysis
        </CoachButton>
      </SpotlightCard>

      <SpotlightCard className="p-6">
        <h3 className="coach-heading mb-3 font-semibold text-white">Pipeline mode</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                mode === m.id ? 'border-coach-lime bg-coach-lime/10 text-white' : 'border-coach-border text-slate-400'
              }`}
            >
              <p className="font-medium">{m.label}</p>
              <p className="mt-1 text-xs opacity-80">{m.desc}</p>
            </button>
          ))}
        </div>
      </SpotlightCard>

      {message && (
        <div className="rounded-lg border border-coach-lime/30 bg-coach-lime/10 px-4 py-3 text-sm text-coach-lime">{message}</div>
      )}
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      )}

      {status.ready_to_run && !status.pipeline_running && (
        <p className="text-xs text-slate-500">
          Videos already on server — use Upload or URLs above to replace them and start a new run.
        </p>
      )}
    </CoachPageShell>
  )
}