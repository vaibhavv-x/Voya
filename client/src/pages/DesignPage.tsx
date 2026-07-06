import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Sparkles, ArrowRight, Check } from 'lucide-react'
import { assistantAPI, contactAPI } from '../services/api'

interface Plan {
  title: string
  intro: string
  matchedTrip?: { slug: string; title: string; pricePerPerson: number } | null
  days: { day: number; title: string; description: string }[]
  estimatePerPerson: number
  tips: string[]
}

const MONTHS = ['Flexible', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const INTERESTS = ['Beaches', 'Mountains', 'Culture', 'Food', 'Adventure', 'Wildlife', 'Wellness', 'Nightlife', 'Photography', 'Offbeat', 'Luxury', 'Budget']
const BUDGETS = [
  { label: 'Under ₹30k', val: '30000' },
  { label: '₹30k–₹60k', val: '60000' },
  { label: '₹60k–₹1L', val: '100000' },
  { label: '₹1L+', val: '150000' },
]

export default function DesignPage() {
  const [form, setForm] = useState({ destination: '', days: '7', budget: '60000', month: 'Flexible', groupSize: '2' })
  const [interests, setInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [error, setError] = useState('')

  // Lead capture
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [quoteSent, setQuoteSent] = useState(false)

  const toggleInterest = (i: string) =>
    setInterests(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setPlan(null); setQuoteSent(false); setQuoteOpen(false)
    try {
      const { data } = await assistantAPI.design({
        destination: form.destination,
        days: Number(form.days),
        budget: form.budget === 'Flexible' ? '' : form.budget,
        month: form.month === 'Flexible' ? '' : form.month,
        interests,
        groupSize: Number(form.groupSize),
      })
      setPlan(data.plan)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const requestQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plan) return
    const planText = `AI-designed plan: ${plan.title}\n\n` +
      plan.days.map(d => `Day ${d.day}: ${d.title} — ${d.description}`).join('\n') +
      `\n\nEstimated ₹${plan.estimatePerPerson.toLocaleString('en-IN')}/person. Preferences: ${form.destination}, ${form.days} days, ${form.month}, ${interests.join(', ')}, group of ${form.groupSize}.`
    try {
      await contactAPI.send({
        name: contact.name, email: contact.email, phone: contact.phone,
        subject: `Custom trip design: ${plan.title}`,
        message: planText,
        tripTypes: ['Custom itinerary'],
      })
      setQuoteSent(true)
    } catch { setError('Could not send your request. Please try again.') }
  }

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <Helmet>
        <title>AI Trip Designer — Voya°</title>
        <meta name="description" content="Describe your dream trip and our AI designs a bespoke day-by-day itinerary in seconds." />
      </Helmet>

      {/* Header */}
      <div className="bg-ink py-16 px-5 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top,#C8853A,transparent_60%)]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 bg-white/10 rounded-full px-4 py-1.5">
            <Sparkles size={14} className="text-amber" />
            <span className="text-xs text-cream tracking-widest uppercase">AI Trip Designer</span>
          </div>
          <h1 className="font-serif font-normal text-4xl md:text-5xl text-cream leading-tight"
            style={{ fontFamily: '"Instrument Serif", serif', letterSpacing: '-1px' }}>
            Describe your dream trip.<br /><em className="text-fog italic">We'll design it in seconds.</em>
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 md:px-10 py-12">
        {/* Form */}
        <form onSubmit={generate} className="bg-surface rounded-2xl p-6 md:p-8 border border-black/6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Where do you want to go?</label>
              <input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                placeholder="e.g. Southeast Asia beaches, the Himalayas, somewhere new…" className="input-base" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Trip length (days)</label>
              <input type="number" min={2} max={30} value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))} className="input-base" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Group size</label>
              <input type="number" min={1} max={20} value={form.groupSize} onChange={e => setForm(f => ({ ...f, groupSize: e.target.value }))} className="input-base" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Budget / person</label>
              <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="input-base">
                <option value="Flexible">Flexible</option>
                {BUDGETS.map(b => <option key={b.val} value={b.val}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-mist block mb-1.5">Preferred month</label>
              <select value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} className="input-base">
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-mist block mb-2">What are you into?</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button key={i} type="button" onClick={() => toggleInterest(i)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    interests.includes(i) ? 'bg-ink text-cream border-ink' : 'border-black/10 text-mist hover:border-ink'
                  }`}>{i}</button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
            {loading ? 'Designing your trip…' : <><Sparkles size={15} /> Design my trip</>}
          </button>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-amber/30 border-t-amber rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-mist">Our AI is crafting your bespoke itinerary…</p>
          </div>
        )}

        {/* Result */}
        {plan && !loading && (
          <div className="mt-10">
            <h2 className="font-serif text-3xl text-ink mb-2" style={{ fontFamily: '"Instrument Serif", serif' }}>{plan.title}</h2>
            <p className="text-sm text-mist leading-relaxed mb-6">{plan.intro}</p>

            <div className="flex flex-wrap gap-3 mb-8">
              <span className="text-sm bg-surface px-4 py-2 rounded-xl border border-black/6">Est. <span className="font-semibold text-ink">₹{plan.estimatePerPerson.toLocaleString('en-IN')}</span>/person</span>
              {plan.matchedTrip && (
                <Link to={`/trips/${plan.matchedTrip.slug}`} className="text-sm bg-amber/10 text-amber px-4 py-2 rounded-xl hover:bg-amber/20 transition-colors flex items-center gap-1.5">
                  Closest Voya trip: {plan.matchedTrip.title} <ArrowRight size={13} />
                </Link>
              )}
            </div>

            {/* Days */}
            <div className="space-y-4 mb-8">
              {plan.days.map(d => (
                <div key={d.day} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber font-semibold text-sm">{d.day}</div>
                  <div className="flex-1 pb-4 border-b border-black/5 last:border-0">
                    <h3 className="font-medium text-ink mb-1">Day {d.day}: {d.title}</h3>
                    <p className="text-xs text-mist leading-relaxed">{d.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            {plan.tips?.length > 0 && (
              <div className="bg-surface rounded-2xl p-5 border border-black/6 mb-8">
                <h4 className="text-xs uppercase tracking-widest text-mist font-medium mb-3">Planner's tips</h4>
                <ul className="space-y-2">
                  {plan.tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-mist"><Check size={12} className="text-amber mt-0.5 flex-shrink-0" />{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lead capture */}
            <div className="bg-ink rounded-2xl p-7 text-center">
              {quoteSent ? (
                <div>
                  <div className="text-3xl mb-2">✅</div>
                  <h3 className="font-serif text-2xl text-cream mb-1" style={{ fontFamily: '"Instrument Serif", serif' }}>Request sent!</h3>
                  <p className="text-sm text-fog">A Voya planner will turn this into a real, bookable quote within 24 hours.</p>
                </div>
              ) : quoteOpen ? (
                <form onSubmit={requestQuote} className="max-w-md mx-auto text-left space-y-2">
                  <p className="text-sm text-cream text-center mb-3">Where should we send your custom quote?</p>
                  <input required value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} placeholder="Your name" className="input-base bg-white/5 border-white/12 text-cream placeholder-fog" />
                  <input required type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} placeholder="Email" className="input-base bg-white/5 border-white/12 text-cream placeholder-fog" />
                  <input value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} placeholder="Phone (optional)" className="input-base bg-white/5 border-white/12 text-cream placeholder-fog" />
                  <button type="submit" className="w-full bg-amber text-cream text-sm font-medium py-3 rounded-full hover:bg-amber/90 transition-colors mt-1">Send my request</button>
                </form>
              ) : (
                <>
                  <h3 className="font-serif text-2xl text-cream mb-2" style={{ fontFamily: '"Instrument Serif", serif' }}>Love this plan?</h3>
                  <p className="text-sm text-fog mb-5">Get it turned into a real, bookable quote by a Voya planner.</p>
                  <button onClick={() => setQuoteOpen(true)} className="bg-amber text-cream text-sm font-medium px-6 py-3 rounded-full hover:bg-amber/90 transition-colors">Request this as a quote</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
