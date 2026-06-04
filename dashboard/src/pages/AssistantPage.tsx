import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { sendChat, useAssistantMeta } from '../lib/api'
import { useMatchStore } from '../store/matchStore'
import { AnimatedTabBar } from '../components/coach/AnimatedTabBar'
import { CoachButton } from '../components/coach/CoachButton'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const CONTEXT_TABS = ['match', 'opponent', 'both', 'training', 'tactical'].map((c) => ({
  id: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}))

export function AssistantPage() {
  const videoId = useMatchStore((s) => s.videoId())
  const { data: meta } = useAssistantMeta()
  const [context, setContext] = useState('match')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const res = await sendChat(text, context, videoId)
      setMessages((m) => [...m, { role: 'assistant', text: res.reply }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: `Error: ${e}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <CoachPageShell title="Coach Assistant" subtitle="Ask tactical questions grounded in your match data">
      <AnimatedTabBar tabs={CONTEXT_TABS} active={context} onChange={setContext} />

      <SpotlightCard className="flex h-[calc(100vh-14rem)] flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <p className="text-sm text-slate-500">Try a suggested prompt below or ask your own question.</p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                m.role === 'user' ? 'ml-auto bg-coach-lime/20 text-slate-200' : 'bg-coach-navy text-slate-300'
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Coach is thinking…
            </div>
          )}
        </div>

        <div className="border-t border-coach-border p-3">
          <div className="mb-2 flex flex-wrap gap-2">
            {(meta?.suggested_prompts ?? []).slice(0, 3).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="rounded-full border border-coach-border px-3 py-0.5 text-xs text-slate-400 hover:border-coach-lime hover:text-coach-lime"
              >
                {p.slice(0, 48)}…
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the coach…"
              className="flex-1 rounded-lg border border-coach-border bg-coach-navy px-3 py-2 text-sm text-white focus:border-coach-lime focus:outline-none focus:ring-2 focus:ring-coach-lime/30"
            />
            <CoachButton type="submit" disabled={loading}>
              <Send className="h-4 w-4" />
            </CoachButton>
          </form>
        </div>
      </SpotlightCard>
    </CoachPageShell>
  )
}
