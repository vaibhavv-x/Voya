export interface Trip {
  _id: string
  title: string
  slug: string
  tagline: string
  description: string
  destination: string
  country: string
  continent: string
  coverImage: string
  images: string[]
  pricePerPerson: number
  originalPrice?: number
  currency: string
  days: number
  nights: number
  category: string
  difficulty: string
  tags: string[]
  maxGroupSize: number
  minGroupSize: number
  departureFrom?: string
  bestTimeToVisit?: string
  climate?: string
  language?: string
  visaRequired?: boolean
  visaInfo?: string
  itinerary: ItineraryDay[]
  included: string[]
  excluded: string[]
  highlights: string[]
  accommodation?: { type: string; name: string; details: string }
  transport?: { toDestination: string; local: string }
  location?: { lat: number; lng: number }
  departures?: Departure[]
  faqs: FAQ[]
  rating: number
  reviewCount: number
  isFeatured: boolean
  isActive?: boolean
  soldOut: boolean
  startDates?: string[]
  createdAt: string
}

export interface Departure {
  _id: string
  date: string
  seatsTotal: number
  seatsBooked: number
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean }
  accommodation?: string
  image?: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'user' | 'admin'
  wishlist?: string[]
}

export interface Booking {
  _id: string
  bookingId: string
  trip: Trip
  travelDate: string
  groupSize: number
  travelers: Traveler[]
  pricePerPerson: number
  subtotal: number
  taxes: number
  totalAmount: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  specialRequests?: string
  createdAt: string
}

export interface Traveler {
  name: string
  age: number
  gender?: string
}

export interface Review {
  _id: string
  user: { _id: string; name: string; avatar?: string }
  rating: number
  title: string
  body: string
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}
