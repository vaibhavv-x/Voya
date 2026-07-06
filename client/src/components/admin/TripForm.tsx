import { useState } from 'react'
import { X, Plus, Upload, Loader2 } from 'lucide-react'
import { adminAPI, tripsAPI } from '../../services/api'
import type { Trip } from '../../types'

const CONTINENTS = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania', 'Antarctica']
const CATEGORIES = ['Adventure', 'Beach', 'Cultural', 'Wildlife', 'Luxury', 'Spiritual', 'Honeymoon', 'Backpacking', 'Family', 'Solo']
const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Expert']

interface ItineraryRow { day: number; title: string; description: string }
interface FaqRow { question: string; answer: string }
interface DepartureRow { _id?: string; date: string; seatsTotal: string; seatsBooked: number }

interface FormState {
  title: string; tagline: string; description: string
  destination: string; country: string; continent: string
  coverImage: string; images: string[]
  pricePerPerson: string; originalPrice: string; currency: string
  days: string; nights: string; category: string; difficulty: string
  tags: string; maxGroupSize: string; minGroupSize: string; departureFrom: string
  bestTimeToVisit: string; climate: string; language: string
  visaRequired: boolean; visaInfo: string
  accommodationKind: string; accommodationName: string; accommodationDetails: string
  transportTo: string; transportLocal: string
  highlights: string; included: string; excluded: string
  lat: string; lng: string
  isFeatured: boolean; isActive: boolean; soldOut: boolean
}

const EMPTY_FORM: FormState = {
  title: '', tagline: '', description: '',
  destination: '', country: '', continent: 'Asia',
  coverImage: '', images: [],
  pricePerPerson: '', originalPrice: '', currency: 'INR',
  days: '', nights: '', category: 'Cultural', difficulty: 'Easy',
  tags: '', maxGroupSize: '12', minGroupSize: '2', departureFrom: '',
  bestTimeToVisit: '', climate: '', language: '',
  visaRequired: false, visaInfo: '',
  accommodationKind: '', accommodationName: '', accommodationDetails: '',
  transportTo: '', transportLocal: '',
  highlights: '', included: '', excluded: '',
  lat: '', lng: '',
  isFeatured: false, isActive: true, soldOut: false,
}

function tripToForm(t: Trip): FormState {
  return {
    title: t.title, tagline: t.tagline, description: t.description,
    destination: t.destination, country: t.country, continent: t.continent,
    coverImage: t.coverImage, images: t.images || [],
    pricePerPerson: String(t.pricePerPerson), originalPrice: t.originalPrice ? String(t.originalPrice) : '',
    currency: t.currency || 'INR',
    days: String(t.days), nights: String(t.nights), category: t.category, difficulty: t.difficulty,
    tags: (t.tags || []).join(', '), maxGroupSize: String(t.maxGroupSize), minGroupSize: String(t.minGroupSize),
    departureFrom: t.departureFrom || '',
    bestTimeToVisit: t.bestTimeToVisit || '', climate: t.climate || '', language: t.language || '',
    visaRequired: !!t.visaRequired, visaInfo: t.visaInfo || '',
    accommodationKind: (t as any).accommodationKind || '', accommodationName: (t as any).accommodationName || '',
    accommodationDetails: (t as any).accommodationDetails || '',
    transportTo: (t as any).transportTo || '', transportLocal: (t as any).transportLocal || '',
    highlights: (t.highlights || []).join(', '), included: (t.included || []).join(', '), excluded: (t.excluded || []).join(', '),
    lat: t.location?.lat != null ? String(t.location.lat) : '', lng: t.location?.lng != null ? String(t.location.lng) : '',
    isFeatured: !!t.isFeatured, isActive: t.isActive !== false, soldOut: !!t.soldOut,
  }
}

function ImageUploadField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const { data } = await adminAPI.upload(file)
      onChange(data.url)
    } catch (e: any) {
      alert(e.response?.data?.message || 'Upload failed')
    } finally { setUploading(false) }
  }
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">{label}</label>
      <div className="flex items-center gap-3 mb-2">
        {value && <img src={value} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}
        <label className="flex-1 cursor-pointer">
          <div className="input-base flex items-center gap-2 text-xs text-mist justify-center py-2.5">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}
          </div>
          <input type="file" accept="image/*" className="hidden" disabled={uploading}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      </div>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="or paste an image URL directly" className="input-base text-xs py-2" />
    </div>
  )
}

export default function TripForm({ trip, onClose, onSaved }: { trip?: Trip; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<FormState>(trip ? tripToForm(trip) : EMPTY_FORM)
  const [itinerary, setItinerary] = useState<ItineraryRow[]>(
    trip?.itinerary?.map(d => ({ day: d.day, title: d.title, description: d.description })) || []
  )
  const [faqs, setFaqs] = useState<FaqRow[]>(trip?.faqs || [])
  const [departures, setDepartures] = useState<DepartureRow[]>(
    (trip?.departures || []).map(d => ({ _id: d._id, date: d.date.slice(0, 10), seatsTotal: String(d.seatsTotal), seatsBooked: d.seatsBooked }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => setForm(f => ({ ...f, [key]: val }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const payload = {
        title: form.title, tagline: form.tagline, description: form.description,
        destination: form.destination, country: form.country, continent: form.continent,
        coverImage: form.coverImage, images: form.images,
        pricePerPerson: Number(form.pricePerPerson), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        currency: form.currency,
        days: Number(form.days), nights: Number(form.nights), category: form.category, difficulty: form.difficulty,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        maxGroupSize: Number(form.maxGroupSize), minGroupSize: Number(form.minGroupSize),
        departureFrom: form.departureFrom,
        bestTimeToVisit: form.bestTimeToVisit, climate: form.climate, language: form.language,
        visaRequired: form.visaRequired, visaInfo: form.visaInfo,
        accommodationKind: form.accommodationKind, accommodationName: form.accommodationName,
        accommodationDetails: form.accommodationDetails,
        transportTo: form.transportTo, transportLocal: form.transportLocal,
        highlights: form.highlights.split(',').map(s => s.trim()).filter(Boolean),
        included: form.included.split(',').map(s => s.trim()).filter(Boolean),
        excluded: form.excluded.split(',').map(s => s.trim()).filter(Boolean),
        location: form.lat && form.lng ? { lat: Number(form.lat), lng: Number(form.lng) } : undefined,
        isFeatured: form.isFeatured, isActive: form.isActive, soldOut: form.soldOut,
        itinerary: itinerary.map(row => ({
          day: row.day, title: row.title, description: row.description,
          activities: [], meals: { breakfast: false, lunch: false, dinner: false },
        })),
        faqs,
        departures: departures.filter(d => d.date).map(d => ({
          ...(d._id ? { _id: d._id } : {}),
          date: d.date,
          seatsTotal: Number(d.seatsTotal) || 14,
          seatsBooked: d.seatsBooked || 0, // preserve existing bookings
        })),
      }
      if (trip) await tripsAPI.update(trip._id, payload)
      else await tripsAPI.create(payload)
      onSaved()
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save trip')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-cream rounded-2xl w-full max-w-3xl p-7 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-mist hover:text-ink transition-colors">
          <X size={18} />
        </button>
        <h2 className="font-serif text-2xl mb-6" style={{ fontFamily: '"Instrument Serif", serif' }}>
          {trip ? 'Edit trip' : 'New trip'}
        </h2>

        <form onSubmit={submit} className="space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Title" className="input-base col-span-2" />
            <input required value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Tagline" className="input-base col-span-2" />
            <textarea required value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description" rows={3} className="input-base col-span-2 resize-none" />
            <input required value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="Destination" className="input-base" />
            <input required value={form.country} onChange={e => set('country', e.target.value)} placeholder="Country" className="input-base" />
            <select value={form.continent} onChange={e => set('continent', e.target.value)} className="input-base">
              {CONTINENTS.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input-base">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} className="input-base">
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Tags (comma separated)" className="input-base" />
          </div>

          {/* Media */}
          <div className="grid grid-cols-2 gap-3">
            <ImageUploadField label="Cover image" value={form.coverImage} onChange={url => set('coverImage', url)} />
            <ImageUploadField label="Gallery image" value={form.images[0] || ''} onChange={url => set('images', [url, ...form.images.slice(1)])} />
          </div>

          {/* Pricing & logistics */}
          <div className="grid grid-cols-3 gap-3">
            <input required type="number" value={form.pricePerPerson} onChange={e => set('pricePerPerson', e.target.value)} placeholder="Price per person" className="input-base" />
            <input type="number" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} placeholder="Original price" className="input-base" />
            <input value={form.currency} onChange={e => set('currency', e.target.value)} placeholder="Currency" className="input-base" />
            <input required type="number" value={form.days} onChange={e => set('days', e.target.value)} placeholder="Days" className="input-base" />
            <input required type="number" value={form.nights} onChange={e => set('nights', e.target.value)} placeholder="Nights" className="input-base" />
            <input value={form.departureFrom} onChange={e => set('departureFrom', e.target.value)} placeholder="Departure from" className="input-base" />
            <input type="number" value={form.minGroupSize} onChange={e => set('minGroupSize', e.target.value)} placeholder="Min group size" className="input-base" />
            <input type="number" value={form.maxGroupSize} onChange={e => set('maxGroupSize', e.target.value)} placeholder="Max group size" className="input-base" />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <input value={form.bestTimeToVisit} onChange={e => set('bestTimeToVisit', e.target.value)} placeholder="Best time to visit" className="input-base" />
            <input value={form.climate} onChange={e => set('climate', e.target.value)} placeholder="Climate" className="input-base" />
            <input value={form.language} onChange={e => set('language', e.target.value)} placeholder="Language" className="input-base" />
            <label className="flex items-center gap-2 text-sm text-mist">
              <input type="checkbox" checked={form.visaRequired} onChange={e => set('visaRequired', e.target.checked)} /> Visa required
            </label>
            {form.visaRequired && (
              <textarea value={form.visaInfo} onChange={e => set('visaInfo', e.target.value)} placeholder="Visa info" rows={2} className="input-base col-span-2 resize-none" />
            )}
            <input value={form.accommodationKind} onChange={e => set('accommodationKind', e.target.value)} placeholder="Accommodation kind" className="input-base" />
            <input value={form.accommodationName} onChange={e => set('accommodationName', e.target.value)} placeholder="Accommodation name" className="input-base" />
            <textarea value={form.accommodationDetails} onChange={e => set('accommodationDetails', e.target.value)} placeholder="Accommodation details" rows={2} className="input-base col-span-2 resize-none" />
            <input value={form.transportTo} onChange={e => set('transportTo', e.target.value)} placeholder="Transport to destination" className="input-base" />
            <input value={form.transportLocal} onChange={e => set('transportLocal', e.target.value)} placeholder="Local transport" className="input-base" />
            <input value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="Latitude" className="input-base" />
            <input value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="Longitude" className="input-base" />
          </div>

          {/* Lists */}
          <div className="space-y-3">
            <input value={form.highlights} onChange={e => set('highlights', e.target.value)} placeholder="Highlights (comma separated)" className="input-base" />
            <input value={form.included} onChange={e => set('included', e.target.value)} placeholder="Included (comma separated)" className="input-base" />
            <input value={form.excluded} onChange={e => set('excluded', e.target.value)} placeholder="Excluded (comma separated)" className="input-base" />
          </div>

          {/* Itinerary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-widest text-mist">Itinerary</label>
              <button type="button" onClick={() => setItinerary(rows => [...rows, { day: rows.length + 1, title: '', description: '' }])}
                className="text-[10px] text-amber hover:underline flex items-center gap-1"><Plus size={10} /> Add day</button>
            </div>
            <div className="space-y-2">
              {itinerary.map((row, i) => (
                <div key={i} className="bg-surface rounded-xl p-3 flex gap-2 items-start">
                  <span className="text-xs text-mist mt-2.5 w-10 flex-shrink-0">Day {row.day}</span>
                  <div className="flex-1 space-y-1.5">
                    <input value={row.title} onChange={e => setItinerary(rs => rs.map((r, j) => j === i ? { ...r, title: e.target.value } : r))}
                      placeholder="Day title" className="input-base text-xs py-2" />
                    <textarea value={row.description} onChange={e => setItinerary(rs => rs.map((r, j) => j === i ? { ...r, description: e.target.value } : r))}
                      placeholder="Day description" rows={2} className="input-base text-xs resize-none" />
                  </div>
                  <button type="button" onClick={() => setItinerary(rs => rs.filter((_, j) => j !== i))} className="text-fog hover:text-red-400 mt-2"><X size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-widest text-mist">FAQs</label>
              <button type="button" onClick={() => setFaqs(rows => [...rows, { question: '', answer: '' }])}
                className="text-[10px] text-amber hover:underline flex items-center gap-1"><Plus size={10} /> Add FAQ</button>
            </div>
            <div className="space-y-2">
              {faqs.map((row, i) => (
                <div key={i} className="bg-surface rounded-xl p-3 flex gap-2 items-start">
                  <div className="flex-1 space-y-1.5">
                    <input value={row.question} onChange={e => setFaqs(rs => rs.map((r, j) => j === i ? { ...r, question: e.target.value } : r))}
                      placeholder="Question" className="input-base text-xs py-2" />
                    <textarea value={row.answer} onChange={e => setFaqs(rs => rs.map((r, j) => j === i ? { ...r, answer: e.target.value } : r))}
                      placeholder="Answer" rows={2} className="input-base text-xs resize-none" />
                  </div>
                  <button type="button" onClick={() => setFaqs(rs => rs.filter((_, j) => j !== i))} className="text-fog hover:text-red-400 mt-2"><X size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Departures */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-widest text-mist">Departure dates &amp; seats</label>
              <button type="button" onClick={() => setDepartures(rows => [...rows, { date: '', seatsTotal: '14', seatsBooked: 0 }])}
                className="text-[10px] text-amber hover:underline flex items-center gap-1"><Plus size={10} /> Add departure</button>
            </div>
            <p className="text-[10px] text-mist mb-2">Leave empty to allow any travel date. Add dates to run fixed departures with limited seats.</p>
            <div className="space-y-2">
              {departures.map((row, i) => (
                <div key={i} className="bg-surface rounded-xl p-3 flex gap-2 items-center">
                  <input type="date" value={row.date} onChange={e => setDepartures(rs => rs.map((r, j) => j === i ? { ...r, date: e.target.value } : r))}
                    className="input-base text-xs py-2 flex-1" />
                  <input type="number" min={1} value={row.seatsTotal} onChange={e => setDepartures(rs => rs.map((r, j) => j === i ? { ...r, seatsTotal: e.target.value } : r))}
                    placeholder="Seats" className="input-base text-xs py-2 w-20" />
                  <span className="text-[10px] text-mist w-16 flex-shrink-0">{row.seatsBooked} booked</span>
                  <button type="button" onClick={() => setDepartures(rs => rs.filter((_, j) => j !== i))} className="text-fog hover:text-red-400"><X size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-sm text-mist">
              <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-mist">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} /> Active
            </label>
            <label className="flex items-center gap-2 text-sm text-mist">
              <input type="checkbox" checked={form.soldOut} onChange={e => set('soldOut', e.target.checked)} /> Sold out
            </label>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2 border-t border-black/6">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving...' : trip ? 'Save changes' : 'Create trip'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm text-mist hover:text-ink transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
