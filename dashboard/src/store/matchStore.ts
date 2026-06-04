import { create } from 'zustand'
import type { MatchMode } from '../types/analytics'

interface MatchStore {
  matchMode: MatchMode
  setMatchMode: (mode: MatchMode) => void
  videoId: () => 1 | 2
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  matchMode: '1',
  setMatchMode: (mode) => set({ matchMode: mode }),
  videoId: () => (get().matchMode === '2' ? 2 : 1),
}))
