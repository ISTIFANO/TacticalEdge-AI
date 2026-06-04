import { useQuery } from '@tanstack/react-query'

export interface RosterPlayer {
  shirt_number: number
  name: string
  position: string
  role: string
  key_star: boolean
  image: string | null
  notes: string
}

export interface MoroccoRoster {
  team: string
  group: string
  team_color: number[]
  key_stars: {
    captain: string
    goalkeeper: string
    playmaker: string
    midfield_leader: string
    rising_stars: string[]
  }
  players: RosterPlayer[]
}

export function useMoroccoRoster() {
  return useQuery({
    queryKey: ['morocco-roster'],
    queryFn: () => fetch('/morocco-roster.json').then((r) => r.json() as Promise<MoroccoRoster>),
    staleTime: 60_000,
  })
}

export function rosterByShirt(roster: MoroccoRoster | undefined) {
  const map = new Map<number, RosterPlayer>()
  roster?.players?.forEach((p) => map.set(p.shirt_number, p))
  return map
}
