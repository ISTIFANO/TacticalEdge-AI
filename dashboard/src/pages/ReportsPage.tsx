import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Download, Loader2 } from 'lucide-react'
import { useGenerateReports, useReports } from '../lib/api'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { AnimatedTabBar } from '../components/coach/AnimatedTabBar'
import { CoachButton } from '../components/coach/CoachButton'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
import { REPORT_TABS } from '../types/coach'

export function ReportsPage() {
  const { data, isLoading, error } = useReports()
  const generate = useGenerateReports()
  const [tab, setTab] = useState<string>('match_summary')
  const [mode, setMode] = useState<'full' | 'halftime'>('full')

  if (isLoading) return <LoadingState message="Loading reports…" />
  if (error) return <EmptyState title="Failed to load reports" description={String(error)} />

  const report = data?.reports?.[tab]
  const hasReports = Object.keys(data?.reports ?? {}).length > 0

  const downloadMd = () => {
    if (!report?.markdown) return
    const blob = new Blob([report.markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tab}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabItems = REPORT_TABS.map((t) => ({ id: t.id, label: t.label }))

  return (
    <CoachPageShell
      title="Coach Reports"
      subtitle="AI-generated tactical reports from match data"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'full' | 'halftime')}
            className="rounded-lg border border-coach-border bg-coach-surface px-3 py-1.5 text-sm focus:border-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/30"
          >
            <option value="full">Full match</option>
            <option value="halftime">Halftime brief</option>
          </select>
          <CoachButton disabled={generate.isPending} onClick={() => generate.mutate({ mode })}>
            {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
          </CoachButton>
        </div>
      }
    >
      {data?.generated_at && (
        <p className="text-xs text-slate-500">
          Last generated {new Date(data.generated_at).toLocaleString()}
          {data.model && ` · ${data.model}`}
          {data.provider && ` · ${data.provider}`}
          {data.mode && ` · ${data.mode} mode`}
        </p>
      )}

      <AnimatedTabBar tabs={tabItems} active={tab} onChange={setTab} />

      {!hasReports && !generate.isPending && (
        <EmptyState
          title="No reports yet"
          description='Click "Generate" to create coach reports using the Football Coach LLM.'
        />
      )}

      {report && (
        <SpotlightCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="coach-heading text-lg font-semibold text-white">{report.title}</h3>
            <button type="button" onClick={downloadMd} className="flex items-center gap-1 text-sm text-slate-400 hover:text-coach-lime">
              <Download className="h-4 w-4" /> Export .md
            </button>
          </div>
          <article className="prose prose-invert prose-sm max-w-none prose-headings:text-coach-lime prose-p:text-slate-300">
            <ReactMarkdown>{report.markdown}</ReactMarkdown>
          </article>
        </SpotlightCard>
      )}
    </CoachPageShell>
  )
}
