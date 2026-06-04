import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { kickoffVariants, kickoffItemVariants } from './motion'

interface CoachPageShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
}

export function CoachPageShell({ title, subtitle, children, actions }: CoachPageShellProps) {
  return (
    <motion.div
      variants={kickoffVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={kickoffItemVariants} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="coach-heading text-2xl font-extrabold text-white sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {actions}
      </motion.div>
      <motion.div variants={kickoffItemVariants}>{children}</motion.div>
    </motion.div>
  )
}
