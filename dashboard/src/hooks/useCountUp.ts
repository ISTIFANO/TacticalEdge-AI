import { useEffect, useState } from 'react'
import { coachMotion } from '../lib/coachTheme'
import { useReducedMotion } from './useReducedMotion'

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function useCountUp(target: number, duration = coachMotion.countUpDuration) {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(reduced ? target : 0)
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    if (reduced) {
      setValue(target)
      return
    }
    let start: number | null = null
    let raf: number
    const from = 0
    const step = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setValue(from + (target - from) * easeOutCubic(progress))
      if (progress < 1) raf = requestAnimationFrame(step)
      else {
        setFlashing(true)
        setTimeout(() => setFlashing(false), 400)
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduced])

  return { value, flashing }
}
