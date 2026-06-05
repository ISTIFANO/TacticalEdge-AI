import { createContext, useContext, useState, type ReactNode } from 'react'
import type { PayMethod } from '../components/PiPayment'

export interface Booking {
  id: string
  type: 'hotel' | 'flight' | 'ticket' | 'package' | 'donation'
  title: string
  date: string
  price: number
  paymentMethod: PayMethod
  piAmount?: number
  status: 'confirmed' | 'pending'
  details?: string
}

export interface Donation {
  id: string
  target: string
  targetType: 'team' | 'coach'
  amount: number
  paymentMethod: PayMethod
  piAmount?: number
  date: string
}

interface BookingContextValue {
  bookings: Booking[]
  donations: Donation[]
  addBooking: (b: Omit<Booking, 'id' | 'status'>) => void
  addDonation: (d: Omit<Donation, 'id' | 'date'>) => void
}

const BookingContext = createContext<BookingContextValue | null>(null)
const BK_KEY = 'wc2030_bookings'
const DN_KEY = 'wc2030_donations'

function loadBookings(): Booking[] {
  try {
    const raw = JSON.parse(localStorage.getItem(BK_KEY) || '[]') as Booking[]
    return raw.map((b) => ({
      ...b,
      paymentMethod: (b.paymentMethod as string) === 'usd' ? 'edh' : (b.paymentMethod ?? 'edh'),
    }))
  } catch {
    return []
  }
}

function loadDonations(): Donation[] {
  try {
    return JSON.parse(localStorage.getItem(DN_KEY) || '[]')
  } catch {
    return []
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(loadBookings)
  const [donations, setDonations] = useState<Donation[]>(loadDonations)

  const addBooking = (b: Omit<Booking, 'id' | 'status'>) => {
    const nb: Booking = { ...b, id: `BK-${Date.now()}`, status: 'confirmed' }
    const next = [...bookings, nb]
    setBookings(next)
    localStorage.setItem(BK_KEY, JSON.stringify(next))
  }

  const addDonation = (d: Omit<Donation, 'id' | 'date'>) => {
    const nd: Donation = { ...d, id: `DN-${Date.now()}`, date: new Date().toISOString().slice(0, 10) }
    const next = [...donations, nd]
    setDonations(next)
    localStorage.setItem(DN_KEY, JSON.stringify(next))
  }

  return (
    <BookingContext.Provider value={{ bookings, donations, addBooking, addDonation }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookings requires BookingProvider')
  return ctx
}
