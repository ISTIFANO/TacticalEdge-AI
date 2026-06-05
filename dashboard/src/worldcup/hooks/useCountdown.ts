import { useEffect, useState } from 'react'
import { WC_KICKOFF } from '../data/mockData'

export function useCountdown(target = WC_KICKOFF) {
  const [left, setLeft] = useState(calc(target))

  useEffect(() => {
    const id = setInterval(() => setLeft(calc(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return left
}

function calc(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  }
}
