import { motion } from 'framer-motion'
import { lineupRowVariants } from './motion'

export type FormResult = 'W' | 'D' | 'L'

const styles: Record<FormResult, string> = {
  W: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  D: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  L: 'bg-red-500/20 text-red-400 border-red-500/40',
}

export function FormStrip({ results, label }: { results: FormResult[]; label?: string }) {
  return (
    <div>
      {label && <p className="coach-heading mb-2 text-xs text-slate-500">{label}</p>}
      <div className="flex gap-2">
        {results.map((r, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={lineupRowVariants}
            initial="hidden"
            animate="visible"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${styles[r]}`}
          >
            {r}
          </motion.span>
        ))}
      </div>
    </div>
  )
}
