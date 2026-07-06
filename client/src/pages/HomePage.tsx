import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { tripsAPI } from '../services/api'
import { TripCard, TripCardSkeleton, VideoBackground } from '../components/layout'
import type { Trip } from '../types'

const CATEGORIES = ['All','Adventure','Beach','Cultural','Wildlife','Luxury','Honeymoon']

const TESTIMONIALS = [
  { name: 'Meera R.', detail: 'Ladakh Circuit', quote: 'Voya° found us a sunrise trek that isn\'t in any guidebook. That morning will stay with me forever.', rating: 5 },
  { name: 'Arjun & Priya', detail: 'Bali Soul Journey', quote: 'We\'ve done group tours before. None came close. The guide, the hotels — all flawless.', rating: 5 },
  { name: 'Kabir M.', detail: 'Patagonia Wilderness', quote: 'I was nervous about going solo. They made it feel like I was going with family. Best two weeks of my life.', rating: 5 },
]

export default function HomePage() {
  const [trips, setTrips]         = useState<Trip[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeCat, setActiveCat] = useState('All')

  useEffect(() => {
    tripsAPI.list({ limit: 50 })
      .then(r => setTrips(r.data.trips))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // "All" shows the featured picks; a category chip shows every trip in that category
  const filtered = (activeCat === 'All'
    ? trips.filter(t => t.isFeatured)
    : trips.filter(t => t.category === activeCat)
  ).slice(0, 6)

  return (
    <div className="bg-cream">
      {/* ── HERO ── */}
      <div className="relative min-h-screen overflow-hidden bg-cream">
        <VideoBackground />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom,#FAF9F6 0%,#FAF9F6 16%,transparent 42%,transparent 58%,#FAF9F6 100%)',
          zIndex: 1,
        }} />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-screen"
          style={{ paddingTop: 'calc(8rem - 75px)', paddingBottom: '8rem' }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-7">
            <div className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
            <span className="text-xs text-mist dark:text-fog tracking-[0.18em] uppercase font-medium">Curated travel for the soulful wanderer</span>
            <div className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-serif font-normal text-ink dark:text-cream max-w-5xl"
            style={{ fontFamily: '"Instrument Serif", serif', fontSize: 'clamp(3rem,8vw,6.5rem)', lineHeight: 0.95, letterSpacing: '-2.5px' }}>
            Where the <em style={{ color: '#6F6F6F', fontStyle: 'italic' }}>world opens,</em><br />
            you <em style={{ color: '#6F6F6F', fontStyle: 'italic' }}>begin.</em>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="mt-7 text-mist dark:text-fog text-base md:text-lg max-w-lg leading-relaxed">
            Voya° crafts rare journeys for curious souls — from misty mountain trails to sun-soaked coasts, handpicked with obsessive care.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <Link to="/trips" className="btn-primary">Browse journeys <ArrowRight size={15} /></Link>
            <Link to="/contact" className="text-sm text-mist dark:text-fog hover:text-ink dark:hover:text-cream transition-colors underline underline-offset-4">Talk to a planner</Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="flex items-center gap-8 mt-12 opacity-60">
            {[{ v: '19', l: 'Curated journeys' }, { v: '12', l: 'Countries' }, { v: '2026', l: 'Founded' }].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className="text-sm font-semibold text-ink dark:text-cream">{v}</div>
                <div className="text-[10px] text-mist mt-0.5">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── FEATURED TRIPS ── */}
      <section className="py-24 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
          <div>
            <p className="section-eyebrow">Handpicked for you</p>
            <h2 className="section-heading text-4xl md:text-5xl">
              Journeys that leave <em className="text-mist italic" style={{ fontFamily: '"Instrument Serif", serif' }}>a mark.</em>
            </h2>
          </div>
          <Link to="/trips" className="flex items-center gap-1.5 text-sm text-mist hover:text-ink transition-colors underline underline-offset-4">
            View all journeys <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-150 ${
                activeCat === cat
                  ? 'bg-ink text-cream border-ink dark:bg-cream dark:text-ink dark:border-cream'
                  : 'bg-cream dark:bg-ink text-mist border-black/10 dark:border-white/12 hover:border-ink dark:hover:border-cream hover:text-ink dark:hover:text-cream'
              }`}>{cat}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <TripCardSkeleton key={i} />)
            : filtered.map((trip, i) => <TripCard key={trip._id} trip={trip} index={i} />)
          }
        </div>
      </section>

      {/* ── WHY VOYA ── */}
      <section className="bg-ink py-24 px-5 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="section-eyebrow text-amber/70">The Voya° way</p>
            <h2 className="section-heading text-4xl md:text-5xl text-cream max-w-xl">
              Travel as it should always <em className="text-fog italic" style={{ fontFamily: '"Instrument Serif", serif' }}>have been.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/8">
            {[
              { n: '01', t: 'Obsessively handpicked', b: 'Every stay, guide, and route is chosen by us — not an algorithm. We visit each destination ourselves before it ever reaches you.' },
              { n: '02', t: 'Small groups, real bonds', b: 'Max 14 travelers per journey. Not a crowd — a crew. The kind of people you\'ll still message three years later.' },
              { n: '03', t: 'Transparent, always', b: 'No hidden costs. No last-minute shocks. Your itinerary, budget, and pace — agreed upfront, honored in full.' },
              { n: '04', t: 'With you on the ground', b: 'A Voya° guide is on-location — not a remote contractor, but someone who trained with us personally.' },
            ].map(({ n, t, b }) => (
              <div key={n} className="bg-ink p-8 md:p-10">
                <span className="text-[10px] text-amber/50 tracking-widest">{n}</span>
                <h3 className="mt-4 mb-3 font-serif font-normal text-xl text-cream" style={{ fontFamily: '"Instrument Serif", serif' }}>{t}</h3>
                <p className="text-xs text-fog leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="section-eyebrow">Stories from the road</p>
          <h2 className="section-heading text-4xl md:text-5xl">
            Told in their <em className="text-mist italic" style={{ fontFamily: '"Instrument Serif", serif' }}>own words.</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/8 dark:bg-white/8">
          {TESTIMONIALS.map(({ name, detail, quote, rating }) => (
            <div key={name} className="bg-cream dark:bg-[#141414] p-8">
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: rating }).map((_, i) => <Star key={i} size={12} className="fill-amber text-amber" />)}
              </div>
              <p className="font-serif font-normal text-lg text-ink dark:text-cream leading-relaxed mb-7" style={{ fontFamily: '"Instrument Serif", serif' }}>
                "{quote}"
              </p>
              <div className="border-t border-black/8 dark:border-white/10 pt-5">
                <p className="text-sm font-semibold text-ink dark:text-cream">{name}</p>
                <p className="text-xs text-mist mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-5 md:px-10 bg-surface dark:bg-[#141414]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="section-eyebrow">Ready?</p>
          <h2 className="section-heading text-4xl md:text-5xl mb-5">
            Your next great <em className="text-mist italic" style={{ fontFamily: '"Instrument Serif", serif' }}>story starts here.</em>
          </h2>
          <p className="text-sm text-mist mb-8 leading-relaxed">
            Tell us where you want to go. We'll do everything else.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/trips" className="btn-primary">Browse all journeys</Link>
            <Link to="/contact" className="btn-outline">Talk to a planner</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
