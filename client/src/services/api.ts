import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // Generous timeout so a Render free-tier cold start (~30–50s) doesn't abort requests
  timeout: 60000,
})

// Attach JWT
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('voya_user')
  if (stored) {
    try {
      const { token } = JSON.parse(stored)
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {}
  }
  return config
})

// ── Auth ──
export const authAPI = {
  register: (d: { name: string; email: string; password: string; phone?: string; ref?: string }) => api.post('/auth/register', d),
  verifyOtp: (d: { email: string; otp: string }) => api.post('/auth/verify-otp', d),
  resendOtp: (d: { email: string }) => api.post('/auth/resend-otp', d),
  login:    (d: { email: string; password: string }) => api.post('/auth/login', d),
  me:       () => api.get('/auth/me'),
  update:   (d: object) => api.put('/auth/profile', d),
  changePassword: (d: object) => api.put('/auth/password', d),
  referral: () => api.get('/auth/referral'),
}

// ── Trips ──
export const tripsAPI = {
  list:    (params?: object) => api.get('/trips', { params }),
  bySlug:  (slug: string)    => api.get(`/trips/${slug}`),
  byId:    (id: string)      => api.get(`/trips/id/${id}`),
  related: (slug: string)    => api.get(`/trips/${slug}/related`),
  create:  (d: object)       => api.post('/trips', d),
  update:  (id: string, d: object) => api.put(`/trips/${id}`, d),
  remove:  (id: string)      => api.delete(`/trips/${id}`),
  seed:    ()                => api.get('/seed'),
}

// ── Bookings ──
export const bookingsAPI = {
  create:  (d: object) => api.post('/bookings', d),
  mine:    ()          => api.get('/bookings/my'),
  byId:    (id: string) => api.get(`/bookings/${id}`),
  cancel:  (id: string, reason?: string) => api.put(`/bookings/${id}/cancel`, { reason }),
  pay:     (id: string, d: object) => api.put(`/bookings/${id}/payment`, d),
  all:     (params?: object) => api.get('/bookings/admin/all', { params }),
  updateStatus: (id: string, bookingStatus: string) => api.put(`/bookings/${id}/status`, { bookingStatus }),
  createOrder:   (id: string) => api.post(`/bookings/${id}/create-order`),
  verifyPayment: (id: string, d: object) => api.post(`/bookings/${id}/verify-payment`, d),
  upiIntent:     (id: string) => api.get(`/bookings/${id}/upi-intent`),
  upiClaim:      (id: string, upiRef?: string) => api.post(`/bookings/${id}/upi-claim`, { upiRef }),
  split:         (id: string) => api.get(`/bookings/${id}/split`),
  splitClaim:    (id: string) => api.post(`/bookings/${id}/split-claim`),
}

// ── Reviews ──
export const reviewsAPI = {
  forTrip: (tripId: string) => api.get(`/reviews/trip/${tripId}`),
  create:  (d: object)      => api.post('/reviews', d),
  remove:  (id: string)     => api.delete(`/reviews/${id}`),
}

// ── Wishlist ──
export const wishlistAPI = {
  get:    () => api.get('/wishlist'),
  toggle: (tripId: string) => api.post(`/wishlist/${tripId}`),
}

// ── Misc ──
export const contactAPI  = { send: (d: object) => api.post('/contact', d) }
export const newsletterAPI = { subscribe: (email: string) => api.post('/newsletter', { email }) }
export const adminAPI    = {
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
  leads: () => api.get('/admin/leads'),
  updateLead: (id: string, status: string) => api.put(`/admin/leads/${id}`, { status }),
  upload: (file: File) => {
    const form = new FormData()
    form.append('image', file)
    return api.post('/admin/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ── AI Assistant ──
export const assistantAPI = {
  chat: (message: string, history: { role: 'user' | 'assistant'; content: string }[]) =>
    api.post('/assistant/chat', { message, history }),
  design: (prefs: object) => api.post('/assistant/design', prefs),
}

// ── Coupons ──
export const couponsAPI = {
  validate: (code: string) => api.get(`/coupons/validate/${code}`),
  list:     () => api.get('/coupons'),
  create:   (d: { code: string; percentOff: number; expiresAt: string }) => api.post('/coupons', d),
  update:   (id: string, d: object) => api.put(`/coupons/${id}`, d),
}

export default api
