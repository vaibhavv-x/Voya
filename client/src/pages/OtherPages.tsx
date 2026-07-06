import { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, BookOpen, Heart, LogOut,
  MapPin, Clock, CheckCircle, Send,
  TrendingUp, Package, Users, DollarSign, Tag, Mail, Gift, Copy
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { bookingsAPI, wishlistAPI, authAPI, tripsAPI, adminAPI, couponsAPI, contactAPI } from '../services/api'
import { TripCard } from '../components/layout'
import TripForm from '../components/admin/TripForm'
import type { Booking, Trip } from '../types'

// Build a wa.me link (prepends India country code for bare 10-digit numbers)
function waLink(phone: string, text: string) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  const full = digits.length === 10 ? '91' + digits : digits
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`
}

// ─────────────────────────────────────────────────────────────────────────────
// USER DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-amber/10 text-amber',
  confirmed: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-500',
  completed: 'bg-blue-50 text-blue-600',
}
const PAYMENT_COLOR: Record<string, string> = {
  pending:  'bg-amber/10 text-amber',
  paid:     'bg-green-50 text-green-600',
  failed:   'bg-red-50 text-red-500',
  refunded: 'bg-blue-50 text-blue-600',
}

export function DashboardPage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'overview' | 'bookings' | 'wishlist' | 'refer' | 'profile'>('overview')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [wishlist, setWishlist] = useState<Trip[]>([])
  const [loading, setLoading]  = useState(true)
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [referral, setReferral] = useState<{ referralCode: string; walletCredit: number; referredCount: number; bonus: number } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    Promise.all([bookingsAPI.mine(), wishlistAPI.get()])
      .then(([b, w]) => { setBookings(b.data.bookings); setWishlist(w.data.wishlist) })
      .catch(() => {})
      .finally(() => setLoading(false))
    authAPI.referral().then(r => setReferral(r.data)).catch(() => {})
  }, [user])

  const referralLink = referral ? `${window.location.origin}/register?ref=${referral.referralCode}` : ''
  const copyReferral = () => { navigator.clipboard.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await authAPI.update(profileForm)
      updateUser(profileForm)
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch {}
    finally { setSaving(false) }
  }

  const upcoming = bookings.filter(b => b.bookingStatus !== 'cancelled' && new Date(b.travelDate) >= new Date())

  const TABS = [
    { id: 'overview',  label: 'Overview',      Icon: TrendingUp },
    { id: 'bookings',  label: 'Bookings',      Icon: BookOpen },
    { id: 'wishlist',  label: 'Wishlist',      Icon: Heart },
    { id: 'refer',     label: 'Refer & Earn',  Icon: Gift },
    { id: 'profile',   label: 'Profile',       Icon: User },
  ] as const

  return (
    <div className="min-h-screen bg-surface pt-20">
      {/* Header band (sits below the fixed site navbar so nav text stays readable) */}
      <div className="bg-ink px-5 md:px-10 pt-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.22em] text-amber/70 mb-2.5">Your account</p>
          <h1 className="font-serif font-normal text-cream leading-none" style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(2.5rem,6vw,4rem)', letterSpacing: '-1.5px' }}>
            Hello, <em className="text-fog italic">{user?.name?.split(' ')[0] || 'traveller'}.</em>
          </h1>
        </div>
      </div>

      {/* Content pulled up over the band */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 -mt-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-cream border border-black/6 rounded-2xl p-5 sticky top-24">
              <div className="text-center pb-5 border-b border-black/6 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber to-amber/70 flex items-center justify-center text-cream text-2xl font-semibold mx-auto mb-3 shadow-lg shadow-amber/20">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <p className="font-medium text-ink text-sm">{user?.name}</p>
                <p className="text-xs text-mist mt-0.5 truncate">{user?.email}</p>
              </div>
              <nav className="space-y-1">
                {TABS.map(({ id, label, Icon }) => (
                  <button key={id} onClick={() => setTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      tab === id ? 'bg-ink text-cream shadow-sm' : 'text-mist hover:text-ink hover:bg-surface'
                    }`}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
                <button onClick={() => { logout(); navigate('/') }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors mt-2">
                  <LogOut size={15} /> Sign out
                </button>
              </nav>
            </div>
          </aside>

          {/* Mobile: profile header + horizontal tabs */}
          <div className="lg:hidden">
            <div className="bg-cream border border-black/6 rounded-2xl p-4 mb-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber to-amber/70 flex items-center justify-center text-cream text-lg font-semibold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm truncate">{user?.name}</p>
                <p className="text-xs text-mist truncate">{user?.email}</p>
              </div>
              <button onClick={() => { logout(); navigate('/') }} className="text-red-500 p-2 flex-shrink-0"><LogOut size={16} /></button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
              {TABS.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
                    tab === id ? 'bg-ink text-cream border-ink' : 'bg-cream text-mist border-black/10'
                  }`}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">

            {/* Overview */}
            {tab === 'overview' && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-mist mb-4">At a glance</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {[
                    { label: 'Total Bookings', val: bookings.length, icon: '🗓️', tint: 'bg-amber/10' },
                    { label: 'Upcoming Trips', val: upcoming.length, icon: '✈️', tint: 'bg-blue-50' },
                    { label: 'Wishlisted',     val: wishlist.length, icon: '❤️', tint: 'bg-red-50' },
                    { label: 'Countries',      val: new Set(bookings.map(b => b.trip?.country)).size, icon: '🌍', tint: 'bg-green-50' },
                  ].map(({ label, val, icon, tint }) => (
                    <div key={label} className="bg-cream border border-black/6 rounded-2xl p-4 sm:p-5 hover:shadow-md hover:shadow-black/5 transition-shadow">
                      <div className={`w-9 h-9 rounded-xl ${tint} flex items-center justify-center text-lg mb-3`}>{icon}</div>
                      <div className="font-serif text-2xl sm:text-3xl text-ink leading-none">{val}</div>
                      <div className="text-[11px] sm:text-xs text-mist mt-1.5">{label}</div>
                    </div>
                  ))}
                </div>
                {/* Recent bookings */}
                <div className="bg-cream dark:bg-[#141414] border border-black/6 dark:border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-medium text-ink dark:text-cream">Recent bookings</h2>
                    <button onClick={() => setTab('bookings')} className="text-xs text-amber hover:underline">View all</button>
                  </div>
                  {loading ? (
                    <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-mist mb-4">No bookings yet.</p>
                      <Link to="/trips" className="btn-primary text-sm py-2">Explore journeys</Link>
                    </div>
                  ) : bookings.slice(0, 4).map(b => (
                    <div key={b._id} className="flex items-center gap-4 py-3 border-b border-black/5 dark:border-white/8 last:border-0">
                      <img src={b.trip?.coverImage} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink dark:text-cream truncate">{b.trip?.title}</p>
                        <p className="text-xs text-mist flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-ink dark:text-cream">₹{b.totalAmount?.toLocaleString('en-IN')}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[b.bookingStatus]}`}>
                          {b.bookingStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings */}
            {tab === 'bookings' && (
              <div>
                <h1 className="font-serif text-3xl text-ink dark:text-cream mb-6" style={{ fontFamily: '"Instrument Serif", serif' }}>My Bookings</h1>
                {loading ? (
                  <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
                ) : bookings.length === 0 ? (
                  <div className="bg-cream dark:bg-[#141414] border border-black/6 dark:border-white/10 rounded-2xl p-16 text-center">
                    <p className="text-4xl mb-4">✈️</p>
                    <p className="font-medium text-ink dark:text-cream mb-2">No bookings yet</p>
                    <p className="text-sm text-mist mb-6">Your next adventure awaits.</p>
                    <Link to="/trips" className="btn-primary">Browse journeys</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map(b => (
                      <div key={b._id} className="bg-cream dark:bg-[#141414] border border-black/6 dark:border-white/10 rounded-2xl p-5">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img src={b.trip?.coverImage} alt="" className="w-full sm:w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <h3 className="font-medium text-ink dark:text-cream">{b.trip?.title}</h3>
                                <p className="text-xs text-mist flex items-center gap-1 mt-0.5">
                                  <MapPin size={10} className="text-amber" /> {b.trip?.destination}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[b.bookingStatus]}`}>
                                  {b.bookingStatus}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PAYMENT_COLOR[b.paymentStatus] || PAYMENT_COLOR.pending}`}>
                                  {b.paymentStatus || 'pending'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-mist mt-3">
                              <span className="flex items-center gap-1"><Clock size={10} className="text-amber" />{new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              <span>{b.groupSize} traveler{b.groupSize > 1 ? 's' : ''}</span>
                              <span className="font-medium text-ink dark:text-cream">₹{b.totalAmount?.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-fog">Booking ID: {b.bookingId}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            {tab === 'wishlist' && (
              <div>
                <h1 className="font-serif text-3xl text-ink dark:text-cream mb-6" style={{ fontFamily: '"Instrument Serif", serif' }}>Wishlist</h1>
                {wishlist.length === 0 ? (
                  <div className="bg-cream dark:bg-[#141414] border border-black/6 dark:border-white/10 rounded-2xl p-16 text-center">
                    <p className="text-4xl mb-4">❤️</p>
                    <p className="font-medium text-ink dark:text-cream mb-2">Nothing saved yet</p>
                    <p className="text-sm text-mist mb-6">Tap the heart on any journey to save it here.</p>
                    <Link to="/trips" className="btn-primary">Explore journeys</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {wishlist.map((t, i) => <TripCard key={t._id} trip={t} index={i} />)}
                  </div>
                )}
              </div>
            )}

            {/* Refer & Earn */}
            {tab === 'refer' && (
              <div>
                <h1 className="font-serif text-3xl text-ink dark:text-cream mb-6" style={{ fontFamily: '"Instrument Serif", serif' }}>Refer &amp; Earn</h1>

                {/* Wallet balance */}
                <div className="bg-ink rounded-2xl p-6 mb-5 text-cream flex items-center justify-between">
                  <div>
                    <p className="text-xs text-fog uppercase tracking-widest mb-1">Your travel credit</p>
                    <p className="font-serif text-4xl" style={{ fontFamily: '"Instrument Serif", serif' }}>₹{(referral?.walletCredit || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-fog mt-1">Use it at checkout on any journey.</p>
                  </div>
                  <Gift size={40} className="text-amber" />
                </div>

                <div className="bg-cream dark:bg-[#141414] border border-black/6 dark:border-white/10 rounded-2xl p-6">
                  <p className="text-sm text-ink dark:text-cream font-medium mb-1">Give ₹{referral?.bonus?.toLocaleString('en-IN') || '1,000'}, get ₹{referral?.bonus?.toLocaleString('en-IN') || '1,000'}</p>
                  <p className="text-xs text-mist mb-5">Share your link. When a friend signs up and books their first trip, they get ₹{referral?.bonus?.toLocaleString('en-IN') || '1,000'} off — and you get ₹{referral?.bonus?.toLocaleString('en-IN') || '1,000'} credit too.</p>

                  <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Your referral link</label>
                  <div className="flex gap-2 mb-4">
                    <input readOnly value={referralLink} className="input-base text-xs flex-1" />
                    <button onClick={copyReferral} className="btn-primary text-xs px-4 whitespace-nowrap">
                      {copied ? <><CheckCircle size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface dark:bg-white/5 rounded-xl p-4 text-center">
                      <p className="font-serif text-2xl text-ink dark:text-cream" style={{ fontFamily: '"Instrument Serif", serif' }}>{referral?.referredCount ?? 0}</p>
                      <p className="text-[10px] text-mist mt-0.5">Friends referred</p>
                    </div>
                    <div className="bg-surface dark:bg-white/5 rounded-xl p-4 text-center">
                      <p className="font-serif text-2xl text-amber" style={{ fontFamily: '"Instrument Serif", serif' }}>{referral?.referralCode || '—'}</p>
                      <p className="text-[10px] text-mist mt-0.5">Your code</p>
                    </div>
                  </div>

                  {referral?.referralCode && (
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Join me on Voya° and get ₹${referral.bonus} off your first trip! ${referralLink}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-medium py-3 rounded-full hover:bg-[#25D366]/90 transition-colors">
                      Share on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Profile */}
            {tab === 'profile' && (
              <div>
                <h1 className="font-serif text-3xl text-ink dark:text-cream mb-6" style={{ fontFamily: '"Instrument Serif", serif' }}>Edit Profile</h1>
                <div className="bg-cream dark:bg-[#141414] border border-black/6 dark:border-white/10 rounded-2xl p-7 max-w-lg">
                  <form onSubmit={saveProfile} className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Full name</label>
                      <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                        className="input-base" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Email</label>
                      <input value={user?.email} disabled className="input-base bg-surface dark:bg-white/5 text-fog cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Phone</label>
                      <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98765 43210" className="input-base" />
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                      {saved ? <><CheckCircle size={15} /> Saved!</> : saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function AboutPage() {
  const FOUNDER = {
    name: 'Vaibhav Chhabra',
    role: 'Founder',
    bio: [
      "I started Voya° because I was tired of travel that felt copy-pasted — the same hotels, the same monuments, the same forgettable itineraries. I wanted to build a travel company around the moments that actually stay with you.",
      "Every journey on Voya° is put together with obsessive care: real routes, honest pricing, and people you can reach at 2am. Based in Gurugram, building for curious travellers everywhere.",
    ],
  }

  const TIMELINE = [
    { year: '2019', title: 'Founded in Mumbai', desc: 'Started as a 3-person boutique planning service from a tiny Bandra apartment.' },
    { year: '2020', title: 'First 100 Travelers', desc: 'Despite the world stopping, we curated 100 domestic journeys that changed how people travel inside India.' },
    { year: '2022', title: 'Went International', desc: 'Launched Southeast Asia and Europe circuits. 500+ travelers in the first year.' },
    { year: '2023', title: '5,000 Journeys', desc: 'Crossed 5,000 travelers across 40 destinations. Launched the group trip format.' },
    { year: '2025', title: 'Full Platform Launch', desc: 'Voya° becomes a full-stack travel platform — book, plan, and connect all in one place.' },
    { year: '2026', title: 'Now', desc: '8,000+ travelers, 60+ destinations, and a team that lives for the next great journey.' },
  ]

  return (
    <div className="pt-20 min-h-screen bg-cream dark:bg-ink">
      {/* Hero */}
      <div className="relative py-24 bg-ink overflow-hidden px-5 md:px-10">
        <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400" alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="section-eyebrow text-amber/70">Our story</p>
          <h1 className="font-serif font-normal text-4xl sm:text-5xl md:text-6xl text-cream leading-tight mb-5"
            style={{ fontFamily: '"Instrument Serif", serif', letterSpacing: '-2px' }}>
            Built by travelers,<br /><em className="text-fog italic">for travelers.</em>
          </h1>
          <p className="text-sm text-fog leading-relaxed max-w-xl mx-auto">
            Voya° was born from frustration with generic itineraries and copy-paste tour packages. We set out to build something different — deeply personal, obsessively curated, and completely transparent.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-amber">
        {[['8,000+','Travelers'], ['60+','Destinations'], ['4.9★','Rating'], ['2026','Founded']].map(([v, l]) => (
          <div key={l} className="text-center py-8 border-r border-cream/20 last:border-0">
            <div className="font-serif text-3xl text-cream font-normal" style={{ fontFamily: '"Instrument Serif", serif' }}>{v}</div>
            <div className="text-xs text-cream/70 mt-1 uppercase tracking-widest">{l}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <p className="section-eyebrow">Why we exist</p>
            <h2 className="section-heading text-4xl md:text-5xl mb-6">
              Travel should change you.<br /><em className="text-mist italic" style={{ fontFamily: '"Instrument Serif", serif' }}>Not just your coordinates.</em>
            </h2>
            <p className="text-sm text-mist leading-relaxed mb-4">
              We started Voya° because we kept coming home from trips feeling like we'd only skimmed the surface. The best hotels, sure. The must-see monuments, of course. But none of the moments that actually matter — the conversations with strangers, the wrong turns that led somewhere extraordinary, the food that doesn't appear on any list.
            </p>
            <p className="text-sm text-mist leading-relaxed">
              So we rebuilt travel from first principles. Every Voya° journey is handcrafted by someone who has been there, eaten there, got lost there. No templates. No copy-paste. Just obsessive care.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
              'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400',
              'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
            ].map((img, i) => (
              <img key={i} src={img} alt="" className={`rounded-2xl object-cover w-full ${i % 2 === 1 ? 'mt-5' : ''} h-44`} loading="lazy" />
            ))}
          </div>
        </div>

        {/* Founder */}
        <div className="mb-24">
          <p className="section-eyebrow">The people</p>
          <h2 className="section-heading text-4xl mb-10">
            The person behind <em className="text-mist italic" style={{ fontFamily: '"Instrument Serif", serif' }}>every journey.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 lg:gap-12 items-center bg-surface dark:bg-white/5 border border-black/6 dark:border-white/8 rounded-3xl p-6 md:p-10">
            <div className="rounded-2xl overflow-hidden aspect-square w-full max-w-[320px] mx-auto md:mx-0">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber/80 to-amber/50 text-cream font-serif text-6xl" style={{ fontFamily: '"Instrument Serif", serif' }}>
                {FOUNDER.name[0]}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-3xl text-ink dark:text-cream leading-tight" style={{ fontFamily: '"Instrument Serif", serif' }}>{FOUNDER.name}</h3>
              <p className="text-sm text-amber mb-5 mt-1">{FOUNDER.role}</p>
              {FOUNDER.bio.map((p, i) => (
                <p key={i} className="text-sm text-mist leading-relaxed mb-3 last:mb-0">{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p className="section-eyebrow">Our journey</p>
          <h2 className="section-heading text-4xl mb-10">
            How we got <em className="text-mist italic" style={{ fontFamily: '"Instrument Serif", serif' }}>here.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TIMELINE.map((item, i) => (
              <div key={i} className="bg-surface dark:bg-white/5 rounded-2xl p-6 border border-black/5 dark:border-white/8">
                <p className="text-xs text-amber font-medium tracking-widest mb-2">{item.year}</p>
                <h3 className="font-medium text-ink dark:text-cream mb-1">{item.title}</h3>
                <p className="text-xs text-mist leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', subject: '', message: '', tripTypes: [] as string[] })
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const TRIP_TYPES = ['Group trip','Custom itinerary','Honeymoon','Solo travel','Family trip','Corporate retreat']
  const FAQS = [
    { q: 'How far in advance should I book?', a: '4–8 weeks for most trips; 3–6 months for peak season destinations like Ladakh (June–Sept) and Maldives (Dec–Feb).' },
    { q: 'Can I customise any package?', a: 'Every trip is customisable — hotel category, room type, activities, dietary needs, pace. Just tell us what you want.' },
    { q: 'What is the cancellation policy?', a: 'Free cancellation within 48h of booking. 30+ days before travel: full refund. 15–29 days: 50% refund. Under 15 days: no refund, but free rescheduling.' },
    { q: 'Is travel insurance included?', a: 'Not by default, but strongly recommended. We partner with top insurers and can add a policy to any booking.' },
    { q: 'Do you handle visa applications?', a: 'We assist with documentation and guidance. We don\'t apply on your behalf but we make the process as easy as possible.' },
  ]

  const toggleTripType = (t: string) =>
    setForm(f => ({ ...f, tripTypes: f.tripTypes.includes(t) ? f.tripTypes.filter(x => x !== t) : [...f.tripTypes, t] }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      await contactAPI.send(form)
      setSent(true)
    } catch {
      alert('Something went wrong. Please try again or email hello@voya.travel.')
    } finally { setLoading(false) }
  }

  return (
    <div className="pt-20 min-h-screen bg-cream dark:bg-ink">
      {/* Header */}
      <div className="bg-ink py-20 px-5 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top_right,#C8853A,transparent_60%)]" />
        <div className="relative z-10 max-w-3xl">
          <p className="section-eyebrow text-amber/70">Get in touch</p>
          <h1 className="font-serif font-normal text-5xl md:text-6xl text-cream leading-tight"
            style={{ fontFamily: '"Instrument Serif", serif', letterSpacing: '-2px' }}>
            Let's plan your <em className="text-fog italic">next story.</em>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {/* Contact info */}
          <div>
            <div className="space-y-5 mb-8">
              {[
                { label: 'Email', val: 'hello@voya.travel' },
                { label: 'WhatsApp', val: '+91 85060 00066' },
                { label: 'Office', val: 'Sector 4, Gurugram, Haryana 122001' },
                { label: 'Hours', val: 'Mon–Sat, 9am–8pm IST' },
              ].map(({ label, val }) => (
                <div key={label} className="flex gap-4">
                  <span className="text-[10px] uppercase tracking-widest text-mist font-medium w-16 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-ink dark:text-cream">{val}</span>
                </div>
              ))}
            </div>

            {/* Google Map — office location */}
            <div className="rounded-2xl overflow-hidden h-48 border border-black/6 dark:border-white/10">
              <iframe
                title="Voya° office location"
                src="https://www.google.com/maps?q=Sector%204%2C%20Gurugram%2C%20Haryana%20122001&output=embed"
                width="100%" height="100%" style={{ border: 0 }}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle size={28} className="text-green-500" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-2xl text-ink dark:text-cream" style={{ fontFamily: '"Instrument Serif", serif' }}>We've got you.</h3>
                <p className="text-sm text-mist">Expect a personal reply within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name" className="input-base" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com" className="input-base" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210" className="input-base" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-base">
                      <option value="">Select a topic</option>
                      <option>Trip enquiry</option>
                      <option>Custom itinerary</option>
                      <option>Booking support</option>
                      <option>Partnership</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">What are you dreaming of? *</label>
                  <textarea required rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us where you want to go, when, how many people, any specific wishes..."
                    className="input-base resize-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-mist block mb-2.5">I'm interested in</label>
                  <div className="flex flex-wrap gap-2">
                    {TRIP_TYPES.map(t => (
                      <button key={t} type="button" onClick={() => toggleTripType(t)}
                        className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all ${
                          form.tripTypes.includes(t) ? 'bg-ink text-cream border-ink' : 'border-black/10 dark:border-white/12 text-mist hover:border-ink hover:text-ink dark:hover:text-cream'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary py-3.5 px-10 disabled:opacity-50">
                  <Send size={14} /> {loading ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <p className="section-eyebrow text-center">Questions</p>
          <h2 className="section-heading text-4xl text-center mb-10">
            Frequently asked <em className="text-mist italic" style={{ fontFamily: '"Instrument Serif", serif' }}>questions.</em>
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-black/6 dark:border-white/10 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-surface dark:hover:bg-white/5 transition-colors">
                  <span className="text-sm font-medium text-ink dark:text-cream pr-4">{faq.q}</span>
                  <span className="text-mist flex-shrink-0 text-lg">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-5 text-xs text-mist leading-relaxed border-t border-black/5 dark:border-white/8 pt-4">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export function AdminPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [allTrips, setAllTrips] = useState<Trip[]>([])
  const [tab, setTab] = useState<'dashboard' | 'trips' | 'bookings' | 'coupons' | 'enquiries'>('dashboard')
  const [expandedB, setExpandedB] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [tripForm, setTripForm] = useState<{ open: boolean; trip?: Trip }>({ open: false })
  const [coupons, setCoupons] = useState<any[]>([])
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'percent', value: '10', expiresAt: '' })
  const [couponSaving, setCouponSaving] = useState(false)
  const [adminBookings, setAdminBookings] = useState<any[]>([])
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all')
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [leads, setLeads] = useState<any[]>([])

  const refreshTrips = () => tripsAPI.list({ limit: 50 }).then(r => setAllTrips(r.data.trips)).catch(() => {})
  const refreshCoupons = () => couponsAPI.list().then(r => setCoupons(r.data.coupons)).catch(() => {})
  const refreshLeads = () => adminAPI.leads().then(r => setLeads(r.data.leads)).catch(() => {})
  const setLeadStatus = async (id: string, status: string) => { await adminAPI.updateLead(id, status); refreshLeads() }
  const refreshBookings = (status: string) => {
    setBookingsLoading(true)
    bookingsAPI.all(status === 'all' ? {} : { status })
      .then(r => setAdminBookings(r.data.bookings))
      .catch(() => {})
      .finally(() => setBookingsLoading(false))
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    adminAPI.stats().then(r => { setStats(r.data.stats); setRecentBookings(r.data.recentBookings) }).catch(() => {})
    refreshTrips()
    refreshCoupons()
  }, [user])

  useEffect(() => {
    if (tab === 'bookings') refreshBookings(bookingFilter)
    if (tab === 'enquiries') refreshLeads()
  }, [tab, bookingFilter])

  const setBookingStatus = async (id: string, status: string) => {
    try {
      const { data } = await bookingsAPI.updateStatus(id, status)
      if (status === 'confirmed') {
        setToast(data?.emailed ? '✓ Confirmed — the traveller has been emailed.' : '✓ Confirmed. (Email not sent — check EMAIL settings.)')
      } else if (status === 'cancelled') {
        setToast('Booking cancelled — seats released.')
      }
      setTimeout(() => setToast(''), 4000)
    } catch {
      setToast('Something went wrong. Please try again.')
      setTimeout(() => setToast(''), 4000)
    }
    refreshBookings(bookingFilter)
  }

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setCouponSaving(true)
    try {
      const payload: any = { code: couponForm.code, expiresAt: couponForm.expiresAt }
      if (couponForm.discountType === 'flat') payload.flatOff = Number(couponForm.value)
      else payload.percentOff = Number(couponForm.value)
      await couponsAPI.create(payload)
      setCouponForm({ code: '', discountType: 'percent', value: '10', expiresAt: '' })
      refreshCoupons()
    } catch (e: any) { alert(e.response?.data?.message || 'Failed to create coupon') }
    finally { setCouponSaving(false) }
  }

  const toggleCoupon = async (c: any) => {
    await couponsAPI.update(c._id, { active: !c.active })
    refreshCoupons()
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await tripsAPI.seed()
      const r = await tripsAPI.list({ limit: 50 })
      setAllTrips(r.data.trips)
      alert('✓ Database seeded with 6 sample trips!')
    } catch (e: any) { alert('Seed failed: ' + e.message) }
    finally { setSeeding(false) }
  }

  const ADMIN_TABS = [
    { id: 'dashboard', label: 'Dashboard', Icon: TrendingUp },
    { id: 'trips',     label: 'Trips',     Icon: Package },
    { id: 'bookings',  label: 'Bookings',  Icon: BookOpen },
    { id: 'coupons',   label: 'Coupons',   Icon: Tag },
    { id: 'enquiries', label: 'Enquiries', Icon: Mail },
  ] as const

  return (
    <div className="min-h-screen bg-ink text-cream lg:flex">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-cream text-ink text-sm font-medium px-5 py-3 rounded-full shadow-2xl">
          {toast}
        </div>
      )}
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 border-r border-white/8 flex-col">
        <div className="p-5 border-b border-white/8">
          <div className="flex items-baseline gap-0.5">
            <span className="font-serif text-xl text-cream" style={{ fontFamily: '"Instrument Serif", serif' }}>Voya</span>
            <sup className="text-[9px] text-amber font-sans">°</sup>
            <span className="text-xs text-fog ml-2">Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                tab === id ? 'bg-white/10 text-cream' : 'text-fog hover:text-cream hover:bg-white/5'
              }`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/8">
          <p className="text-xs text-fog mb-3">{user?.name}</p>
          <Link to="/" className="text-xs text-amber/60 hover:text-amber transition-colors">← Back to site</Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 lg:overflow-auto">
        <header className="px-4 sm:px-6 lg:px-8 py-4 border-b border-white/8 sticky top-0 bg-ink z-20">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {/* Brand on mobile, page title on desktop */}
              <div className="lg:hidden flex items-baseline gap-0.5">
                <span className="font-serif text-lg text-cream" style={{ fontFamily: '"Instrument Serif", serif' }}>Voya</span>
                <sup className="text-[8px] text-amber font-sans">°</sup>
                <span className="text-[11px] text-fog ml-1.5">Admin</span>
              </div>
              <h1 className="font-medium capitalize hidden lg:block">{tab}</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/" className="lg:hidden text-[11px] text-amber/60 hover:text-amber transition-colors">← Site</Link>
              <button onClick={handleSeed} disabled={seeding}
                className="text-[11px] sm:text-xs bg-amber/20 text-amber px-3 sm:px-4 py-2 rounded-full hover:bg-amber/30 transition-colors disabled:opacity-50 whitespace-nowrap">
                {seeding ? 'Seeding…' : '🌱 Seed data'}
              </button>
            </div>
          </div>
          {/* Mobile horizontal tabs */}
          <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-1 px-1">
            {ADMIN_TABS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all flex-shrink-0 ${
                  tab === id ? 'bg-white/12 text-cream border-white/20' : 'text-fog border-white/10'
                }`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Dashboard */}
          {tab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[
                  { label: 'Total Revenue', val: stats ? `₹${stats.totalRevenue?.toLocaleString('en-IN')}` : '—', Icon: DollarSign, tint: 'bg-amber/15 text-amber',      ring: 'from-amber/10' },
                  { label: 'Bookings',      val: stats?.totalBookings ?? '—', Icon: BookOpen, tint: 'bg-blue-500/15 text-blue-400',   ring: 'from-blue-500/10' },
                  { label: 'Users',         val: stats?.totalUsers   ?? '—', Icon: Users,    tint: 'bg-green-500/15 text-green-400', ring: 'from-green-500/10' },
                  { label: 'Active Trips',  val: stats?.totalTrips   ?? '—', Icon: Package,  tint: 'bg-purple-500/15 text-purple-400', ring: 'from-purple-500/10' },
                ].map(({ label, val, Icon, tint, ring }) => (
                  <div key={label} className={`relative bg-gradient-to-br ${ring} to-transparent bg-white/5 border border-white/8 rounded-2xl p-4 sm:p-5 overflow-hidden`}>
                    <div className={`w-9 h-9 rounded-xl ${tint} flex items-center justify-center mb-3`}>
                      <Icon size={17} />
                    </div>
                    <div className="font-serif text-2xl sm:text-3xl text-cream leading-none" style={{ fontFamily: '"Instrument Serif", serif' }}>{val}</div>
                    <div className="text-[11px] sm:text-xs text-fog mt-1.5 uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-sm">Recent bookings</h2>
                  <button onClick={() => setTab('bookings')} className="text-[11px] text-amber/70 hover:text-amber transition-colors">View all →</button>
                </div>
                <div className="space-y-1">
                  {recentBookings.length === 0 ? (
                    <p className="text-xs text-fog py-6 text-center">No bookings yet. Seed data and create test bookings.</p>
                  ) : recentBookings.map((b: any) => (
                    <div key={b._id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-amber/15 text-amber flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {b.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-cream truncate">{b.trip?.title}</p>
                        <p className="text-xs text-fog truncate">{b.user?.name} · {b.user?.email}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLOR[b.bookingStatus]}`}>{b.bookingStatus}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trips */}
          {tab === 'trips' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-fog">{allTrips.length} trips in database</p>
                <button onClick={() => setTripForm({ open: true })}
                  className="text-xs bg-amber text-cream px-4 py-2 rounded-full hover:bg-amber/90 transition-colors">
                  + New trip
                </button>
              </div>
              <div className="bg-white/5 border border-white/8 rounded-2xl overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Trip', 'Category', 'Price', 'Rating', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-fog">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allTrips.map(t => (
                      <tr key={t._id} className="hover:bg-white/3 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={t.coverImage} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                            <div>
                              <p className="text-sm text-cream font-medium">{t.title}</p>
                              <p className="text-xs text-fog">{t.destination}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className="text-[10px] bg-amber/15 text-amber px-2 py-0.5 rounded-full">{t.category}</span></td>
                        <td className="px-5 py-4 text-sm text-cream">₹{t.pricePerPerson?.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4 text-sm text-amber">★ {t.rating}</td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${t.isActive !== false ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                            {t.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={async () => {
                            const { data } = await tripsAPI.byId(t._id)
                            setTripForm({ open: true, trip: data.trip })
                          }} className="text-xs text-amber hover:underline">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tripForm.open && (
            <TripForm
              trip={tripForm.trip}
              onClose={() => setTripForm({ open: false })}
              onSaved={() => { setTripForm({ open: false }); refreshTrips() }}
            />
          )}

          {/* Coupons */}
          {tab === 'coupons' && (
            <div>
              <form onSubmit={createCoupon} className="bg-white/5 border border-white/8 rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-fog block mb-1.5">Code</label>
                  <input required value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="SUMMER25" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-cream placeholder-fog/50 focus:outline-none focus:border-amber w-40" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-fog block mb-1.5">Type</label>
                  <select value={couponForm.discountType} onChange={e => setCouponForm(f => ({ ...f, discountType: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-amber">
                    <option value="percent">% off</option>
                    <option value="flat">₹ off</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-fog block mb-1.5">{couponForm.discountType === 'flat' ? '₹ amount' : '% value'}</label>
                  <input required type="number" min={1} value={couponForm.value} onChange={e => setCouponForm(f => ({ ...f, value: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-cream w-28 focus:outline-none focus:border-amber" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-fog block mb-1.5">Expires</label>
                  <input required type="date" value={couponForm.expiresAt} onChange={e => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-cream focus:outline-none focus:border-amber" />
                </div>
                <button type="submit" disabled={couponSaving} className="bg-amber text-cream text-sm px-5 py-2.5 rounded-xl hover:bg-amber/90 transition-colors disabled:opacity-50">
                  {couponSaving ? 'Creating...' : '+ Create coupon'}
                </button>
              </form>

              <div className="bg-white/5 border border-white/8 rounded-2xl overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Code', 'Discount', 'Expires', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-fog">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {coupons.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-xs text-fog">No coupons yet. Create one above.</td></tr>
                    ) : coupons.map(c => {
                      const expired = new Date(c.expiresAt) < new Date()
                      return (
                        <tr key={c._id} className="hover:bg-white/3 transition-colors">
                          <td className="px-5 py-4 text-sm text-cream font-medium">{c.code}</td>
                          <td className="px-5 py-4 text-sm text-amber">{c.flatOff > 0 ? `₹${c.flatOff.toLocaleString('en-IN')}` : `${c.percentOff}%`}</td>
                          <td className="px-5 py-4 text-xs text-fog">{new Date(c.expiresAt).toLocaleDateString('en-IN')}</td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.active && !expired ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                              {expired ? 'Expired' : c.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button onClick={() => toggleCoupon(c)} className="text-xs text-amber hover:underline">
                              {c.active ? 'Disable' : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings */}
          {tab === 'bookings' && (
            <div>
              <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar -mx-1 px-1">
                {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map(s => (
                  <button key={s} onClick={() => setBookingFilter(s)}
                    className={`text-xs px-4 py-2 rounded-full capitalize transition-colors whitespace-nowrap flex-shrink-0 ${
                      bookingFilter === s ? 'bg-amber text-cream' : 'bg-white/5 text-fog hover:bg-white/10'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>

              {bookingsLoading ? (
                <p className="text-xs text-fog">Loading...</p>
              ) : adminBookings.length === 0 ? (
                <div className="bg-white/5 border border-white/8 rounded-2xl p-8 text-center">
                  <p className="text-fog text-sm">No bookings found for this filter.</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/8 rounded-2xl overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-white/8">
                        {['Booking', 'Trip', 'Guest', 'Amount', 'Payment', 'Status', ''].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-fog">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {adminBookings.map(b => {
                        const isOpen = expandedB === b._id
                        const hasReq = !!(b.specialRequests && b.specialRequests.trim())
                        return (
                        <Fragment key={b._id}>
                        <tr className="hover:bg-white/3 transition-colors">
                          <td className="px-5 py-4 text-xs text-fog">{b.bookingId}</td>
                          <td className="px-5 py-4 text-sm text-cream">
                            <span className="flex items-center gap-2">
                              {b.trip?.title}
                              {hasReq && <span title="Has a special request" className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-cream">{b.user?.name}</p>
                            <p className="text-xs text-fog">{b.user?.email}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-cream">₹{b.totalAmount?.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.paymentStatus === 'paid' ? 'bg-green-900/40 text-green-400' : 'bg-amber/15 text-amber'}`}>
                              {b.paymentStatus}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLOR[b.bookingStatus]}`}>{b.bookingStatus}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2.5 items-center">
                              <button onClick={() => setExpandedB(isOpen ? null : b._id)} className="text-[10px] text-fog hover:text-cream underline">{isOpen ? 'Hide' : 'Details'}</button>
                              {b.bookingStatus !== 'confirmed' && (
                                <button onClick={() => setBookingStatus(b._id, 'confirmed')} className="text-[10px] text-green-400 hover:underline">Confirm</button>
                              )}
                              {b.bookingStatus !== 'cancelled' && (
                                <button onClick={() => setBookingStatus(b._id, 'cancelled')} className="text-[10px] text-red-400 hover:underline">Cancel</button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-white/[0.03]">
                            <td colSpan={7} className="px-5 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {/* Special request — highlighted */}
                                <div className={`rounded-xl p-3 border ${hasReq ? 'bg-amber/10 border-amber/25' : 'bg-white/5 border-white/8'}`}>
                                  <p className="text-[10px] uppercase tracking-widest text-amber mb-1.5">Special request</p>
                                  <p className={hasReq ? 'text-cream leading-relaxed' : 'text-fog italic'}>{hasReq ? b.specialRequests : 'None'}</p>
                                </div>
                                {/* Trip / logistics */}
                                <div className="rounded-xl p-3 bg-white/5 border border-white/8 space-y-1">
                                  <div className="flex justify-between"><span className="text-fog">Travel date</span><span className="text-cream">{b.travelDate ? new Date(b.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></div>
                                  <div className="flex justify-between"><span className="text-fog">Travellers</span><span className="text-cream">{b.groupSize}</span></div>
                                  <div className="flex justify-between"><span className="text-fog">Phone</span><span className="text-cream">{b.contactPhone || b.user?.phone || '—'}</span></div>
                                  {b.couponCode && <div className="flex justify-between"><span className="text-fog">Coupon</span><span className="text-amber">{b.couponCode}</span></div>}
                                </div>
                                {/* Traveller names */}
                                {b.travelers?.length > 0 && (
                                  <div className="rounded-xl p-3 bg-white/5 border border-white/8 md:col-span-2">
                                    <p className="text-[10px] uppercase tracking-widest text-fog mb-1.5">Travellers</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {b.travelers.map((t: any, i: number) => (
                                        <span key={i} className="bg-white/8 text-cream px-2.5 py-1 rounded-full">{t.name}{t.age ? ` · ${t.age}` : ''}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Reply / respond to the traveller */}
                                {(() => {
                                  const name = (b.contactName || b.user?.name || 'there').split(' ')[0]
                                  const trip = b.trip?.title || 'your Voya° journey'
                                  const phone = b.contactPhone || b.user?.phone || ''
                                  const email = b.contactEmail || b.user?.email || ''
                                  const intro = `Hi ${name}, thanks for booking ${trip} with Voya°!`
                                  const reqLine = hasReq ? ` About your request — "${b.specialRequests}" — ` : ' '
                                  const body = `${intro}${reqLine}`
                                  const subject = `Your Voya° booking ${b.bookingId} — ${trip}`
                                  return (
                                    <div className="md:col-span-2 flex flex-wrap items-center gap-2 pt-1">
                                      <span className="text-[10px] uppercase tracking-widest text-fog mr-1">Reply to traveller</span>
                                      {email && (
                                        <a href={`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                                          className="inline-flex items-center gap-1.5 text-xs bg-white/8 hover:bg-white/12 text-cream px-3 py-1.5 rounded-full transition-colors">
                                          <Mail size={12} /> Email
                                        </a>
                                      )}
                                      {phone && (
                                        <a href={waLink(phone, body)} target="_blank" rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 px-3 py-1.5 rounded-full transition-colors">
                                          <Send size={12} /> WhatsApp
                                        </a>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            </td>
                          </tr>
                        )}
                        </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Enquiries */}
          {tab === 'enquiries' && (
            <div>
              {leads.length === 0 ? (
                <div className="bg-white/5 border border-white/8 rounded-2xl p-8 text-center">
                  <p className="text-fog text-sm">No enquiries yet. Submissions from the Contact page appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.map(l => (
                    <div key={l._id} className="bg-white/5 border border-white/8 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm text-cream font-medium">{l.name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              l.status === 'new' ? 'bg-amber/15 text-amber' : l.status === 'contacted' ? 'bg-blue-900/40 text-blue-400' : 'bg-green-900/40 text-green-400'
                            }`}>{l.status}</span>
                          </div>
                          <p className="text-xs text-fog mt-0.5">{l.email}{l.phone ? ` · ${l.phone}` : ''}</p>
                          {l.subject && <p className="text-xs text-amber mt-2">{l.subject}</p>}
                          {l.message && <p className="text-sm text-cream/80 mt-1 leading-relaxed">{l.message}</p>}
                          {l.tripTypes?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {l.tripTypes.map((t: string) => <span key={t} className="text-[10px] bg-white/5 text-fog px-2 py-0.5 rounded-full">{t}</span>)}
                            </div>
                          )}
                          <p className="text-[10px] text-fog/60 mt-2">{new Date(l.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          {l.status !== 'contacted' && <button onClick={() => setLeadStatus(l._id, 'contacted')} className="text-[10px] text-blue-400 hover:underline">Mark contacted</button>}
                          {l.status !== 'closed' && <button onClick={() => setLeadStatus(l._id, 'closed')} className="text-[10px] text-green-400 hover:underline">Mark closed</button>}
                          {l.status !== 'new' && <button onClick={() => setLeadStatus(l._id, 'new')} className="text-[10px] text-fog hover:underline">Reopen</button>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DESTINATIONS PAGE
// ─────────────────────────────────────────────────────────────────────────────
// Short, clean labels for the destination rows (keyed by trip slug)
const DEST_SHORT: Record<string, string> = {
  'ultimate-iceland-expedition': 'Iceland',
  'masai-mara-great-migration-safari': 'Masai Mara',
  'andaman-island-escape': 'Andaman',
  'meghalaya-caves-and-waterfalls': 'Meghalaya',
  'mauritius-honeymoon-bliss': 'Mauritius',
  'vietnam-highlights-expedition': 'Vietnam',
  'thailand-islands-and-bangkok': 'Thailand',
  'kerala-backwaters-and-hills': 'Kerala',
  'kashmir-paradise-retreat': 'Kashmir',
  'bali-soul-journey': 'Bali',
  'ladakh-high-altitude-circuit': 'Ladakh',
  'maldives-stillwater-retreat': 'Maldives',
  'kyoto-tokyo-cultural-immersion': 'Japan',
  'santorini-athens-escape': 'Santorini',
  'ranthambore-tiger-trails': 'Ranthambore',
  'rajasthan-royal-heritage-circuit': 'Rajasthan',
  'sri-lanka-hills-and-coast': 'Sri Lanka',
  'spiti-valley-backpacking-circuit': 'Spiti Valley',
  'enchanting-georgia': 'Georgia',
}

export function DestinationsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    tripsAPI.list({ limit: 50 })
      .then(r => setTrips(r.data.trips))
      .catch(() => {})
  }, [])

  // Every trip becomes a destination row — always in sync with the catalogue
  const DESTS = trips.map(t => ({
    name: DEST_SHORT[t.slug] || t.country || t.destination,
    country: t.country,
    img: t.coverImage,
    tag: t.category,
    slug: t.slug,
  }))

  return (
    <div className="pt-20 min-h-screen bg-cream dark:bg-ink">
      <div className="bg-ink py-16 sm:py-20 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <p className="section-eyebrow text-amber/70">Explore the world</p>
          <h1 className="font-serif font-normal text-4xl sm:text-5xl md:text-6xl text-cream leading-tight"
            style={{ fontFamily: '"Instrument Serif", serif', letterSpacing: '-2px' }}>
            Our <em className="text-fog italic">destinations.</em>
          </h1>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-14">
        <div className="flex items-end justify-between mb-8">
          <p className="text-sm text-mist max-w-md leading-relaxed">
            {DESTS.length} worlds, one obsession. <span className="hidden md:inline">Hover to explore — click any to see its journeys.</span>
          </p>
        </div>

        {/* Desktop: vertical accordion — hovered row grows, the rest slide down */}
        <div className="hidden md:flex flex-col gap-3" onMouseLeave={() => setActive(null)}>
          {DESTS.map((d, i) => {
            const isActive = active === i
            return (
              <Link key={d.slug} to={`/trips/${d.slug}`}
                onMouseEnter={() => setActive(i)}
                style={{ height: isActive ? 360 : 84 }}
                className="relative rounded-2xl md:rounded-3xl overflow-hidden w-full flex-shrink-0 group transition-[height] duration-500 ease-out cursor-pointer">
                <img src={d.img} alt={d.name} loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" />
                {/* Gradient from the left so the label reads on every panel */}
                <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/35 to-ink/5" />

                {/* Content — left-aligned, vertically centred */}
                <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[10px] font-medium bg-cream/90 text-ink px-2.5 py-1 rounded-full whitespace-nowrap">{d.tag}</span>
                    <p className="text-cream/70 text-xs uppercase tracking-widest">{d.country}</p>
                  </div>
                  <h3 className={`font-serif text-cream leading-none whitespace-nowrap transition-all duration-500 ${isActive ? 'text-4xl md:text-5xl' : 'text-2xl'}`} style={{ fontFamily: '"Instrument Serif", serif' }}>{d.name}</h3>
                  {/* Explore CTA — reveals when this row is expanded */}
                  <span className={`inline-flex w-fit items-center gap-1.5 text-sm text-cream border border-cream/30 rounded-full px-4 backdrop-blur-sm whitespace-nowrap overflow-hidden transition-all duration-500 ${isActive ? 'opacity-100 max-h-10 mt-4 py-1.5' : 'opacity-0 max-h-0 mt-0 py-0 border-transparent'}`}>Explore journeys →</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DESTS.map((d) => (
            <Link key={d.slug} to={`/trips/${d.slug}`} className="group block">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] relative">
                <img src={d.img} alt={d.name} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-medium bg-cream/90 text-ink px-2.5 py-1 rounded-full">{d.tag}</span>
                <div className="absolute bottom-4 left-4">
                  <p className="text-cream/60 text-xs">{d.country}</p>
                  <h3 className="font-serif text-2xl text-cream font-normal" style={{ fontFamily: '"Instrument Serif", serif' }}>{d.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 404
// ─────────────────────────────────────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream dark:bg-ink px-4 text-center pt-20">
      <p className="text-6xl mb-4">🗺️</p>
      <h1 className="font-serif text-6xl font-normal text-ink dark:text-cream mb-2" style={{ fontFamily: '"Instrument Serif", serif' }}>404</h1>
      <p className="text-mist mb-8">This page doesn't exist on our map.</p>
      <div className="flex gap-4">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/trips" className="btn-outline">Browse journeys</Link>
      </div>
    </div>
  )
}
