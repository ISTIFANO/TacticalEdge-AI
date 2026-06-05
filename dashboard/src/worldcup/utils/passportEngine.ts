import type { Booking } from '../context/BookingContext'
import { BADGE_DEFINITIONS, DEFAULT_RARITY_CONFIG, HOST_STADIUMS } from '../data/passportData'
import { STADIUMS, TEAMS } from '../data/mockData'
import type {
  Collectible,
  CollectibleType,
  FanPassport,
  MintableBooking,
  QRValidationResult,
  Rarity,
  UnlockedBadge,
  WCNotification,
} from '../types/passport'

const COLLECTIBLE_TYPES = new Set<CollectibleType>(['ticket', 'hotel', 'flight', 'package'])

export function isMintableBooking(b: Booking): b is MintableBooking {
  return COLLECTIBLE_TYPES.has(b.type as CollectibleType)
}

function randomSegment(len: number) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function generatePassportId() {
  return `WC2030-PAS-${randomSegment(4)}-${randomSegment(4)}`
}

export function generateSerialNumber() {
  return `WC2030-${randomSegment(4)}-${randomSegment(4)}`
}

export function generateSeatNumber() {
  const section = String.fromCharCode(65 + Math.floor(Math.random() * 8))
  const row = Math.floor(Math.random() * 30) + 1
  const seat = Math.floor(Math.random() * 40) + 1
  return `${section}${row}-${seat}`
}

export function generateQRPayload(collectible: Collectible) {
  return JSON.stringify({
    v: 1,
    serial: collectible.serialNumber,
    type: collectible.type,
    title: collectible.title,
    date: collectible.date,
    passport: collectible.id,
  })
}

function parseCityCountry(details?: string, title?: string): { city: string; country: string; stadium?: string } {
  const text = `${details ?? ''} ${title ?? ''}`
  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Madrid', 'Barcelona', 'Seville', 'Lisbon', 'Porto']
  const city = cities.find((c) => text.includes(c)) ?? 'Host City'
  const country = text.includes('Morocco') || ['Casablanca', 'Rabat', 'Marrakech'].includes(city)
    ? 'Morocco'
    : text.includes('Portugal') || ['Lisbon', 'Porto'].includes(city)
      ? 'Portugal'
      : text.includes('Spain') || ['Madrid', 'Barcelona', 'Seville'].includes(city)
        ? 'Spain'
        : 'Host Nation'
  const stadium = STADIUMS.find((s) => text.includes(s.name) || text.includes(s.city))?.name
  return { city, country, stadium }
}

function parseTeams(title: string): { home?: string; away?: string } {
  const vsMatch = title.match(/(.+?)\s+vs\s+(.+?)(?:\s*\(|$)/i)
  if (!vsMatch) return {}
  const homeName = vsMatch[1].trim()
  const awayName = vsMatch[2].trim()
  const home = TEAMS.find((t) => homeName.includes(t.name))?.flag
  const away = TEAMS.find((t) => awayName.includes(t.name))?.flag
  return { home, away }
}

export function determineRarity(booking: MintableBooking, config = DEFAULT_RARITY_CONFIG): Rarity {
  const text = `${booking.title} ${booking.details ?? ''}`
  if (booking.type === 'ticket') {
    if (config.ticketLegendaryKeywords.some((k) => text.includes(k))) return 'legendary'
    if (config.ticketEpicKeywords.some((k) => text.includes(k))) return 'epic'
    return 'rare'
  }
  if (booking.type === 'package') {
    if (text.includes('Ultimate') || text.includes('VIP')) return 'legendary'
    return 'epic'
  }
  if (booking.type === 'hotel') {
    if (text.includes('5★') || text.includes('5-star') || booking.price >= 400) return 'rare'
    return 'common'
  }
  return 'common'
}

export function mintCollectible(booking: MintableBooking, config = DEFAULT_RARITY_CONFIG): Collectible {
  const rarity = determineRarity(booking, config)
  const { city, country, stadium } = parseCityCountry(booking.details, booking.title)
  const teams = booking.type === 'ticket' ? parseTeams(booking.title) : {}

  const collectible: Collectible = {
    id: `COL-${Date.now()}-${randomSegment(3)}`,
    bookingId: booking.id,
    type: booking.type,
    rarity,
    serialNumber: generateSerialNumber(),
    title: booking.title,
    subtitle: booking.type === 'ticket' ? (stadium ?? 'Official Match Ticket') : booking.type.toUpperCase(),
    stadium: booking.type === 'ticket' ? stadium : undefined,
    city,
    country,
    date: booking.date,
    seatNumber: booking.type === 'ticket' ? generateSeatNumber() : undefined,
    teamHome: teams.home,
    teamAway: teams.away,
    image: booking.type === 'ticket'
      ? 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400'
      : undefined,
    mintedAt: new Date().toISOString(),
    validated: false,
    qrPayload: '',
  }
  collectible.qrPayload = generateQRPayload(collectible)
  return collectible
}

export function createEmptyPassport(email: string): FanPassport {
  return {
    passportId: generatePassportId(),
    userEmail: email,
    loyaltyPoints: 0,
    collectibles: [],
    badges: [],
    visitedCities: [],
    visitedStadiums: [],
    matchCount: 0,
    mintProcessedBookings: [],
  }
}

function unlockBadge(id: string): UnlockedBadge | null {
  const def = BADGE_DEFINITIONS.find((b) => b.id === id)
  if (!def) return null
  return { ...def, unlockedAt: new Date().toISOString() }
}

export function evaluateBadges(passport: FanPassport): UnlockedBadge[] {
  const unlocked = new Map(passport.badges.map((b) => [b.id, b]))
  const newBadges: UnlockedBadge[] = []

  const add = (id: string) => {
    if (unlocked.has(id) || newBadges.some((b) => b.id === id)) return
    const b = unlockBadge(id)
    if (b) newBadges.push(b)
  }

  const tickets = passport.collectibles.filter((c) => c.type === 'ticket')
  const hotels = passport.collectibles.filter((c) => c.type === 'hotel')
  const packages = passport.collectibles.filter((c) => c.type === 'package')

  if (tickets.length >= 1) add('first_ticket')
  if (passport.matchCount >= 3) add('match_3')
  if (passport.matchCount >= 5) add('match_5')
  if (tickets.some((t) => t.title.includes('Final'))) add('final_attendee')
  if (passport.visitedStadiums.length >= 1) add('stadium_1')
  if (passport.visitedStadiums.length >= 3) add('stadium_3')
  if (HOST_STADIUMS.every((s) => passport.visitedStadiums.includes(s))) add('stadium_all')
  if (packages.length >= 1) add('trip_complete')

  const hotelCountries = new Set(hotels.map((h) => h.country))
  if (hotelCountries.has('Morocco') && hotelCountries.has('Spain') && hotelCountries.has('Portugal')) add('tri_nation')

  if (passport.loyaltyPoints >= 500) add('loyalty_500')
  if (passport.loyaltyPoints >= 2000) add('loyalty_2000')
  if (passport.collectibles.length >= 10) add('collector_10')

  return newBadges
}

export function applyCollectibleToPassport(
  passport: FanPassport,
  collectible: Collectible,
  config = DEFAULT_RARITY_CONFIG,
): FanPassport {
  const visitedCities = [...new Set([...passport.visitedCities, collectible.city])]
  const visitedStadiums = collectible.stadium
    ? [...new Set([...passport.visitedStadiums, collectible.stadium])]
    : passport.visitedStadiums
  const matchCount = collectible.type === 'ticket' ? passport.matchCount + 1 : passport.matchCount
  const points = config.pointsByRarity[collectible.rarity]

  const next: FanPassport = {
    ...passport,
    loyaltyPoints: passport.loyaltyPoints + points,
    collectibles: [...passport.collectibles, collectible],
    visitedCities,
    visitedStadiums,
    matchCount,
  }
  const newBadges = evaluateBadges(next)
  return { ...next, badges: [...next.badges, ...newBadges] }
}

export function validateQR(payload: string, passport: FanPassport): QRValidationResult {
  try {
    const data = JSON.parse(payload) as { serial?: string }
    const found = passport.collectibles.find((c) => c.serialNumber === data.serial)
    if (!found) {
      return { valid: false, message: 'Collectible not found in system' }
    }
    if (found.validated) {
      return { valid: true, collectible: found, message: 'Already validated — entry permitted' }
    }
    return { valid: true, collectible: found, message: 'Valid ticket — welcome to the stadium!' }
  } catch {
    return { valid: false, message: 'Invalid QR code format' }
  }
}

export function markValidated(passport: FanPassport, serial: string): FanPassport {
  return {
    ...passport,
    collectibles: passport.collectibles.map((c) =>
      c.serialNumber === serial ? { ...c, validated: true } : c,
    ),
  }
}

export function buildNotifications(passport: FanPassport, bookings: Booking[]): WCNotification[] {
  const notes: WCNotification[] = []
  const now = Date.now()

  for (const b of bookings) {
    if (b.type === 'donation') continue
    const eventTime = new Date(b.date).getTime()
    const daysUntil = Math.ceil((eventTime - now) / (1000 * 60 * 60 * 24))
    if (daysUntil < 0 || daysUntil > 14) continue

    const typeMap = { ticket: 'match', hotel: 'hotel', flight: 'flight', package: 'reward' } as const
    notes.push({
      id: `N-${b.id}`,
      type: typeMap[b.type as keyof typeof typeMap] ?? 'reward',
      title: b.type === 'ticket' ? 'Upcoming Match' : b.type === 'hotel' ? 'Hotel Check-in' : b.type === 'flight' ? 'Flight Departure' : 'Trip Reminder',
      message: `${b.title} — ${daysUntil === 0 ? 'Today!' : `In ${daysUntil} day(s)`}`,
      date: b.date,
      read: false,
    })
  }

  for (const badge of passport.badges.slice(-3)) {
    notes.push({
      id: `N-badge-${badge.id}`,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `${badge.icon} ${badge.name} — ${badge.description}`,
      date: badge.unlockedAt.slice(0, 10),
      read: true,
    })
  }

  if (passport.matchCount >= 3) {
    notes.push({
      id: 'N-reward-multi',
      type: 'reward',
      title: 'Multi-Match Reward',
      message: 'You unlocked a 15% discount on your next hotel booking!',
      date: new Date().toISOString().slice(0, 10),
      read: false,
    })
  }

  return notes.sort((a, b) => b.date.localeCompare(a.date))
}

export function computeLeaderboard(
  userName: string,
  userCountry: string,
  passport: FanPassport,
  demo: Omit<import('../types/passport').LeaderboardEntry, 'rank' | 'isCurrentUser'>[],
) {
  const userFlag = userCountry === 'Morocco' ? '🇲🇦' : userCountry === 'Spain' ? '🇪🇸' : userCountry === 'Portugal' ? '🇵🇹' : '🌍'
  const userEntry = {
    name: userName.split(' ')[0] + ' ' + (userName.split(' ')[1]?.[0] ?? '') + '.',
    country: userCountry,
    flag: userFlag,
    points: passport.loyaltyPoints,
    matches: passport.matchCount,
    badges: passport.badges.length,
    isCurrentUser: true,
  }

  const all = [...demo.map((d) => ({ ...d, isCurrentUser: false })), userEntry]
    .sort((a, b) => b.points - a.points)
    .map((e, i) => ({ ...e, rank: i + 1 }))

  return all
}
