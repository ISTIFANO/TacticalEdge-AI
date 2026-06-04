import { useState, type ReactNode, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { bootPress } from './motion'

interface CoachButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'outline' | 'gold'
  className?: string
  disabled?: boolean
}

export function CoachButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className,
  disabled,
}: CoachButtonProps) {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTimeout(() => setRipple(null), 500)
    onClick?.()
  }

  const variants = {
    primary: 'bg-coach-lime text-coach-navy hover:bg-coach-lime/90',
    outline: 'border border-coach-border bg-transparent text-slate-300 hover:border-coach-lime/50',
    gold: 'bg-coach-gold text-coach-navy hover:opacity-90',
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      {...bootPress}
      className={cn(
        'relative overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50',
        variants[variant],
        className,
      )}
    >
      {ripple && (
        <span
          className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-white/30"
          style={{ left: ripple.x, top: ripple.y }}
        />
      )}
      {children}
    </motion.button>
  )
}
