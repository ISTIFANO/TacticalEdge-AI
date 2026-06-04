import { useCallback, useRef } from 'react'

export function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    el.style.setProperty('--spot-x', `${x}px`)
    el.style.setProperty('--spot-y', `${y}px`)
  }, [])

  return { ref, onMove }
}
