import type { Booking } from '../context/BookingContext'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type CollectibleType = 'ticket' | 'hotel' | 'flight' | 'package'

export interface Collectible {
  id: string
  bookingId: string
  type: CollectibleType
  rarity: Rarity
  serialNumber: string
  title: string
  subtitle: string
  stadium?: string
  city: string
  country: string
  date: string
  seatNumber?: string
  teamHome?: string
  teamAway?: string
  qrPayload: string
  image?: string
  mintedAt: string
  validated: boolean
}

export interface BadgeDefinition {
  id: string
  name: string
  description: string
  rarity: Rarity
  icon: string
  category: 'match' | 'stadium' | 'travel' | 'special'
}

export interface UnlockedBadge extends BadgeDefinition {
  unlockedAt: string
}

export interface FanPassport {
  passportId: string
  userEmail: string
  loyaltyPoints: number
  collectibles: Collectible[]
  badges: UnlockedBadge[]
  visitedCities: string[]
  visitedStadiums: string[]
  matchCount: number
  mintProcessedBookings: string[]
}

export interface WCNotification {
  id: string
  type: 'match' | 'hotel' | 'flight' | 'achievement' | 'reward'
  title: string
  message: string
  date: string
  read: boolean
}

export interface LeaderboardEntry {
  rank: number
  name: string
  country: string
  flag: string
  points: number
  matches: number
  badges: number
  isCurrentUser?: boolean
}

export interface RarityConfig {
  ticketLegendaryKeywords: string[]
  ticketEpicKeywords: string[]
  hotelRareMinStars: number
  pointsByRarity: Record<Rarity, number>
}

export interface QRValidationResult {
  valid: boolean
  collectible?: Collectible
  message: string
}

export type MintableBooking = Booking & { type: CollectibleType }
