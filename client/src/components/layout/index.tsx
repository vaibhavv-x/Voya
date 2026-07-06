import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Heart, User, LogOut, BookOpen, ChevronDown, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { newsletterAPI } from '../../services/api'
import type { Trip } from '../../types'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4'

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout }              = useAuth()
  const navigate                      = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const NAV = [
    { to: '/',            label: 'Home' },
    { to: '/trips',       label: 'Journeys' },
    { to: '/design',      label: 'Design Trip' },
    { to: '/destinations',label: 'Destinations' },
    { to: '/journal',     label: 'Journal' },
    { to: '/about',       label: 'About' },
    { to: '/contact',     label: 'Contact' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3 bg-cream/90 dark:bg-ink/90 backdrop-blur-xl shadow-sm shadow-black/5 dark:shadow-black/40' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-baseline gap-0.5 group">
          <span className="font-serif text-[30px] leading-none tracking-tight text-ink dark:text-cream" style={{ fontFamily: '"Instrument Serif", serif', WebkitTextStroke: '0.6px currentColor' }}>Voya</span>
          <sup className="text-sm font-sans font-semibold text-amber -ml-0.5">°</sup>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
              `text-sm transition-colors duration-200 ${isActive ? 'text-ink dark:text-cream font-medium' : 'text-mist hover:text-ink dark:hover:text-cream'}`
            }>{label}</NavLink>
          ))}
          {user && (
            <NavLink to="/dashboard/bookings" className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm transition-colors duration-200 ${isActive ? 'text-ink dark:text-cream font-medium' : 'text-mist hover:text-ink dark:hover:text-cream'}`
            }>
              <BookOpen size={14} /> My Bookings
            </NavLink>
          )}
        </div>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-mist hover:text-ink dark:hover:text-cream transition-colors">
                <div className="w-7 h-7 rounded-full bg-amber/20 flex items-center justify-center text-amber font-semibold text-xs">
                  {user.name[0].toUpperCase()}
                </div>
                {user.name.split(' ')[0]}
                <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-48 bg-cream dark:bg-[#171717] border border-black/8 dark:border-white/10 rounded-2xl shadow-xl py-2 z-50">
                  <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:text-ink dark:hover:text-cream hover:bg-surface dark:hover:bg-white/5 transition-colors">
                    <User size={14} /> Dashboard
                  </Link>
                  <Link to="/dashboard/bookings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:text-ink dark:hover:text-cream hover:bg-surface dark:hover:bg-white/5 transition-colors">
                    <BookOpen size={14} /> My Bookings
                  </Link>
                  <Link to="/dashboard/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:text-ink dark:hover:text-cream hover:bg-surface dark:hover:bg-white/5 transition-colors">
                    <Heart size={14} /> Wishlist
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber hover:bg-surface dark:hover:bg-white/5 transition-colors">
                      ⚡ Admin
                    </Link>
                  )}
                  <hr className="my-1 border-black/6 dark:border-white/10" />
                  <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm text-mist hover:text-ink dark:hover:text-cream transition-colors">Sign in</Link>
              <Link to="/register" className="btn-primary text-xs py-2 px-5">Start exploring</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(o => !o)} className="md:hidden text-ink p-1">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-cream dark:bg-ink border-t border-black/5 dark:border-white/10 px-5 py-5 flex flex-col gap-4">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `text-sm ${isActive ? 'text-ink dark:text-cream font-medium' : 'text-mist'}`}>
              {label}
            </NavLink>
          ))}
          {user ? (
            <>
              <hr className="border-black/6 dark:border-white/10" />
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-2.5 text-sm ${isActive ? 'text-ink dark:text-cream font-medium' : 'text-mist'}`}>
                <User size={15} /> Dashboard
              </NavLink>
              <NavLink to="/dashboard/bookings" onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-2.5 text-sm ${isActive ? 'text-ink dark:text-cream font-medium' : 'text-mist'}`}>
                <BookOpen size={15} /> My Bookings
              </NavLink>
              <NavLink to="/dashboard/wishlist" onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-2.5 text-sm ${isActive ? 'text-ink dark:text-cream font-medium' : 'text-mist'}`}>
                <Heart size={15} /> Wishlist
              </NavLink>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 text-sm text-amber">⚡ Admin</Link>
              )}
              <button onClick={() => { logout(); setMobileOpen(false) }} className="flex items-center gap-2.5 text-sm text-red-500 text-left">
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm justify-center mt-1">Start exploring</Link>
          )}
        </div>
      )}
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
export function Footer() {
  const [email, setEmail] = useState('')
  const [subbed, setSubbed] = useState(false)

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    try { await newsletterAPI.subscribe(email) } catch {}
    setSubbed(true)
  }

  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-baseline gap-0.5 mb-4">
              <span className="font-serif text-2xl text-cream" style={{ fontFamily: '"Instrument Serif", serif' }}>Voya</span>
              <sup className="text-[10px] text-amber font-sans">°</sup>
            </div>
            <p className="text-xs text-fog leading-relaxed max-w-[200px]">
              Curated travel for the soulful wanderer. Based in Gurugram. Journeys worldwide.
            </p>
            <div className="flex gap-2 mt-6">
              {['IG', 'YT', 'TW', 'LI'].map(s => (
                <div key={s} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-fog hover:border-amber hover:text-amber cursor-pointer transition-colors">{s}</div>
              ))}
            </div>
          </div>
          {[
            { title: 'Explore', links: [['All Journeys', '/trips'], ['Destinations', '/destinations'], ['Group Trips', '/trips?category=Adventure'], ['Honeymoon', '/trips?category=Honeymoon']] },
            { title: 'Company', links: [['About Us', '/about'], ['How We Work', '/about'], ['Journal', '/journal'], ['Contact', '/contact']] },
            { title: 'Legal', links: [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Cancellation', '/cancellation']] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-[10px] text-amber/70 uppercase tracking-widest mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-xs text-fog hover:text-cream transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter strip */}
        <div className="border-t border-white/8 pt-10 pb-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <p className="text-sm font-medium text-cream">Stay in the loop</p>
            <p className="text-xs text-fog mt-0.5">New journeys, travel stories, and exclusive early access.</p>
          </div>
          {subbed ? (
            <p className="text-sm text-amber">✓ You're subscribed. Welcome to Voya°.</p>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
                placeholder="your@email.com"
                className="flex-1 md:w-56 text-sm px-4 py-2.5 rounded-full bg-white/8 border border-white/12 text-cream placeholder-fog focus:outline-none focus:border-amber transition-colors" />
              <button type="submit" className="bg-amber text-cream text-sm font-medium px-5 py-2.5 rounded-full hover:bg-amber/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row justify-between gap-3">
          <p className="text-[10px] text-fog">© 2026 Voya° Travel. All rights reserved.</p>
          <Link to="/" className="text-[10px] text-amber/60 hover:text-amber flex items-center gap-1 transition-colors">
            Back to top <ArrowRight size={10} className="-rotate-90" />
          </Link>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIP CARD
// ─────────────────────────────────────────────────────────────────────────────
export function TripCard({ trip }: { trip: Trip; index?: number }) {
  const discount = trip.originalPrice
    ? Math.round((1 - trip.pricePerPerson / trip.originalPrice) * 100)
    : 0

  return (
    <Link to={`/trips/${trip.slug}`} className="group block">
      <div className="card hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-black/8">
        {/* Image */}
        <div className="relative overflow-hidden h-56">
          <img src={trip.coverImage} alt={trip.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
          <span className="absolute top-3 left-3 text-[10px] font-medium bg-cream/95 dark:bg-ink/90 text-ink dark:text-cream px-2.5 py-1 rounded-full">
            {trip.category}
          </span>
          {discount > 0 && (
            <span className="absolute top-3 right-3 text-[10px] font-semibold bg-amber text-cream px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <p className="text-cream/60 text-[10px] font-sans">{trip.destination}</p>
              <h3 className="text-cream font-serif text-xl leading-tight" style={{ fontFamily: '"Instrument Serif", serif' }}>
                {trip.title}
              </h3>
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="p-4">
          <p className="text-xs text-mist leading-relaxed line-clamp-2 mb-4">{trip.tagline}</p>
          <div className="flex items-center gap-3 text-[10px] text-mist mb-3">
            <span>{trip.days}D / {trip.nights}N</span>
            <span>·</span>
            <span>Max {trip.maxGroupSize}</span>
            <span>·</span>
            <span className={`font-medium ${trip.difficulty === 'Easy' ? 'text-green-600' : trip.difficulty === 'Challenging' ? 'text-red-500' : 'text-amber'}`}>
              {trip.difficulty}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/8">
            <div>
              <span className="text-lg font-semibold text-ink dark:text-cream">
                ₹{trip.pricePerPerson.toLocaleString('en-IN')}
              </span>
              {trip.originalPrice && (
                <span className="text-xs text-fog line-through ml-1.5">
                  ₹{trip.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <p className="text-[10px] text-mist">per person</p>
            </div>
            {trip.reviewCount > 0 ? (
              <div className="flex items-center gap-1 text-amber">
                <span className="text-xs">★</span>
                <span className="text-sm font-semibold text-ink dark:text-cream">{trip.rating}</span>
                <span className="text-[10px] text-mist">({trip.reviewCount})</span>
              </div>
            ) : (
              <span className="text-[10px] text-mist border border-black/10 dark:border-white/15 rounded-full px-2 py-0.5">New</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────
export function TripCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-56 rounded-t-2xl rounded-b-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-8 w-1/3 rounded mt-4" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO HERO
// ─────────────────────────────────────────────────────────────────────────────
const FADE = 0.5
export function VideoBackground() {
  const ref = useRef<HTMLVideoElement>(null)
  const raf = useRef<number>(0)

  useEffect(() => {
    const v = ref.current; if (!v) return
    const tick = () => {
      const { currentTime: t, duration: d, style } = v
      if (!d) { raf.current = requestAnimationFrame(tick); return }
      if (t < FADE) style.opacity = String(t / FADE)
      else if (t > d - FADE) style.opacity = String((d - t) / FADE)
      else style.opacity = '1'
      raf.current = requestAnimationFrame(tick)
    }
    const onEnded = () => {
      v.style.opacity = '0'
      setTimeout(() => { v.currentTime = 0; v.play().catch(() => {}) }, 100)
    }
    v.addEventListener('ended', onEnded)
    v.play().catch(() => {})
    raf.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf.current); v.removeEventListener('ended', onEnded) }
  }, [])

  return (
    <div className="absolute left-0 right-0 bottom-0" style={{ top: '300px', zIndex: 0 }}>
      <video ref={ref} src={VIDEO_URL} muted playsInline preload="auto"
        className="w-full h-full object-cover" style={{ opacity: 0 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-transparent to-cream pointer-events-none" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTE
// ─────────────────────────────────────────────────────────────────────────────
export function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/login', { replace: true })
      else if (adminOnly && user.role !== 'admin') navigate('/', { replace: true })
    }
  }, [user, loading, adminOnly, navigate])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-amber/30 border-t-amber rounded-full animate-spin" /></div>
  return <>{children}</>
}
