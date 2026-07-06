import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { tripsAPI } from '../services/api'
import { TripCard, TripCardSkeleton } from '../components/layout'
import type { Trip } from '../types'

const CATEGORIES = ['Adventure','Beach','Cultural','Wildlife','Luxury','Spiritual','Honeymoon','Backpacking','Family','Solo']
const DIFFICULTIES = ['Easy','Moderate','Challenging','Expert']
const CONTINENTS = ['Asia','Europe','Africa','Americas','Oceania']
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'popular',    label: 'Most popular' },
  { value: 'rating',     label: 'Highest rated' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
]

export default function TripsPage() {
  const [params] = useSearchParams()
  const [trips, setTrips]   = useState<Trip[]>([])
  const [total, setTotal]   = useState(0)
  const [pages, setPages]   = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    search:     params.get('search') || '',
    category:   params.get('category') || '',
    continent:  params.get('continent') || '',
    difficulty: '',
    minPrice:   '',
    maxPrice:   '',
    sort:       'newest',
    page:       1,
  })

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    try {
      const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      const { data } = await tripsAPI.list({ ...clean, limit: 9 })
      setTrips(data.trips)
      setTotal(data.total)
      setPages(data.pages)
    } catch {}
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  const update = (key: string, value: string | number) =>
    setFilters(f => ({ ...f, [key]: value, page: key !== 'page' ? 1 : (value as number) }))

  const clearAll = () => setFilters({ search: '', category: '', continent: '', difficulty: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 })

  const activeFilterCount = [filters.category, filters.continent, filters.difficulty, filters.minPrice, filters.maxPrice].filter(Boolean).length

  return (
    <div className="pt-20 min-h-screen bg-cream dark:bg-ink">
      {/* Page header */}
      <div className="bg-ink py-16 px-5 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top,#C8853A,transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative">
          <p className="section-eyebrow text-amber/70">Explore</p>
          <h1 className="section-heading text-5xl md:text-6xl text-cream mb-2">
            All Journeys
          </h1>
          <p className="text-sm text-fog">{total > 0 ? `${total} curated trips` : 'Loading trips...'}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fog" size={15} />
            <input value={filters.search} onChange={e => update('search', e.target.value)}
              placeholder="Search destinations, countries, categories..."
              className="input-base pl-10" />
          </div>
          <select value={filters.sort} onChange={e => update('sort', e.target.value)} className="input-base md:w-52">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-ink text-cream border-ink dark:bg-cream dark:text-ink dark:border-cream'
                : 'bg-cream dark:bg-ink text-mist border-black/10 dark:border-white/12 hover:border-ink dark:hover:border-cream hover:text-ink dark:hover:text-cream'
            }`}>
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && <span className="bg-amber text-cream text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-surface dark:bg-[#141414] border border-black/5 dark:border-white/8 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mist font-medium block mb-2">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => update('category', filters.category === c ? '' : c)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                        filters.category === c ? 'bg-ink text-cream border-ink dark:bg-cream dark:text-ink dark:border-cream' : 'border-black/10 dark:border-white/12 text-mist hover:border-ink dark:hover:border-cream'
                      }`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mist font-medium block mb-2">Continent</label>
                <div className="flex flex-wrap gap-1.5">
                  {CONTINENTS.map(c => (
                    <button key={c} onClick={() => update('continent', filters.continent === c ? '' : c)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                        filters.continent === c ? 'bg-ink text-cream border-ink dark:bg-cream dark:text-ink dark:border-cream' : 'border-black/10 dark:border-white/12 text-mist hover:border-ink dark:hover:border-cream'
                      }`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mist font-medium block mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-1.5">
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => update('difficulty', filters.difficulty === d ? '' : d)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                        filters.difficulty === d ? 'bg-ink text-cream border-ink dark:bg-cream dark:text-ink dark:border-cream' : 'border-black/10 dark:border-white/12 text-mist hover:border-ink dark:hover:border-cream'
                      }`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mist font-medium block mb-2">Price Range (₹)</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => update('minPrice', e.target.value)}
                    className="input-base text-xs py-2" />
                  <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => update('maxPrice', e.target.value)}
                    className="input-base text-xs py-2" />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={clearAll} className="flex items-center gap-1.5 text-xs text-mist hover:text-ink dark:hover:text-cream transition-colors">
                <X size={13} /> Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <p className="text-xs text-mist mb-5">
          Showing <span className="font-semibold text-ink dark:text-cream">{trips.length}</span> of <span className="font-semibold text-ink dark:text-cream">{total}</span> journeys
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <TripCardSkeleton key={i} />)
            : trips.map((t, i) => <TripCard key={t._id} trip={t} index={i} />)
          }
        </div>

        {trips.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🗺️</p>
            <h3 className="text-lg font-semibold mb-2">No journeys found</h3>
            <p className="text-sm text-mist mb-5">Try adjusting your filters</p>
            <button onClick={clearAll} className="btn-primary">Clear filters</button>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {Array.from({ length: pages }).map((_, i) => (
              <button key={i} onClick={() => update('page', i + 1)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  filters.page === i + 1 ? 'bg-ink text-cream dark:bg-cream dark:text-ink' : 'border border-black/10 dark:border-white/12 text-mist hover:border-ink dark:hover:border-cream hover:text-ink dark:hover:text-cream'
                }`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
