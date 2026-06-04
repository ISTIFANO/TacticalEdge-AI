import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { kickoffVariants } from './motion'

interface CoachHeroBannerProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

export function CoachHeroBanner({ title, subtitle, children }: CoachHeroBannerProps) {
  return (
    <motion.div
      variants={kickoffVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-xl border border-coach-border bg-gradient-to-r from-coach-pitch/60 via-coach-navy to-coach-surface p-6 sm:p-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='53' viewBox='0 0 80 53'%3E%3Crect fill='none' stroke='%23AAFF45' stroke-width='1' width='80' height='53'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 53px',
        }}
      />
      <div className="relative">
        <h1 className="coach-heading text-2xl font-extrabold text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
  )
}
