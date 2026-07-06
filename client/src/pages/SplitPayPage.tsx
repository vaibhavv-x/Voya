import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Users, Check } from 'lucide-react'
import { bookingsAPI } from '../services/api'

interface Split {
  bookingId: string
  tripTitle: string
  destination: string
  coverImage: string
  groupSize: number
  perHead: number
  totalAmount: number
  sharesPaid: number
  complete: boolean
  upiId: string
  upiLink: string
  travelers: string[]
}

export default function SplitPayPage() {
  const { id } = useParams<{ id: string }>()
  const [split, setSplit] = useState<Split | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    if (!id) return
    bookingsAPI.split(id)
      .then(r => setSplit(r.data))
      .catch(e => setError(e.response?.data?.message || 'This split-payment link is invalid.'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [id])

  const claim = async () => {
    if (!id) return
    setClaiming(true)
    try {
      const { data } = await bookingsAPI.splitClaim(id)
      setSplit(s => s ? { ...s, sharesPaid: data.sharesPaid, complete: data.complete } : s)
    } catch { /* ignore */ }
    finally { setClaiming(false) }
  }

  if (loading) return (
    <div className="pt-32 min-h-screen bg-cream flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
    </div>
  )

  if (error || !split) return (
    <div className="pt-32 min-h-screen bg-cream text-center px-4">
      <p className="text-4xl mb-4">🔗</p>
      <h1 className="font-serif text-3xl text-ink mb-3" style={{ fontFamily: '"Instrument Serif", serif' }}>{error || 'Link not found'}</h1>
      <Link to="/trips" className="btn-primary">Browse journeys</Link>
    </div>
  )

  const pct = Math.round((split.sharesPaid / split.groupSize) * 100)

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <Helmet><title>Pay your share — Voya°</title></Helmet>
      <div className="max-w-lg mx-auto px-5 py-12">
        <div className="bg-cream border border-black/8 rounded-2xl overflow-hidden shadow-lg shadow-black/5">
          <div className="h-40 relative">
            <img src={split.coverImage} alt={split.tripTitle} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-cream">
              <p className="text-[10px] uppercase tracking-widest opacity-80">Group booking · {split.bookingId}</p>
              <h1 className="font-serif text-2xl leading-tight" style={{ fontFamily: '"Instrument Serif", serif' }}>{split.tripTitle}</h1>
            </div>
          </div>

          <div className="p-6">
            {split.complete ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="font-medium text-ink mb-1">All shares paid!</h2>
                <p className="text-xs text-mist">Every traveller has paid. The organiser will confirm your group booking shortly.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-mist mb-4">
                  <Users size={15} className="text-amber" /> Split across {split.groupSize} travellers
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-mist mb-1.5">
                    <span>{split.sharesPaid} of {split.groupSize} paid</span><span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden">
                    <div className="h-full bg-amber transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-xs text-mist">Your share</p>
                  <p className="text-3xl font-semibold text-ink">₹{split.perHead.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-mist mt-0.5">of ₹{split.totalAmount.toLocaleString('en-IN')} total</p>
                </div>

                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(split.upiLink)}`}
                  alt="UPI QR code" className="w-44 h-44 mx-auto rounded-xl border border-black/8 bg-white p-2" />
                <p className="text-xs text-mist text-center mt-3">Scan to pay <span className="font-medium text-ink">{split.upiId}</span> via any UPI app</p>

                <a href={split.upiLink} className="btn-primary text-sm py-3 justify-center w-full mt-4">Open UPI app to pay ₹{split.perHead.toLocaleString('en-IN')}</a>
                <button onClick={claim} disabled={claiming}
                  className="w-full mt-2 text-sm text-ink border border-black/15 rounded-full py-3 hover:border-ink transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  <Check size={14} /> {claiming ? 'Recording…' : "I've paid my share"}
                </button>
                <p className="text-[10px] text-mist text-center mt-3">Share this link with your group — everyone pays their own share.</p>
              </>
            )}

            {split.travelers?.length > 0 && (
              <div className="mt-5 pt-4 border-t border-black/6">
                <p className="text-[10px] uppercase tracking-widest text-mist mb-2">Travellers</p>
                <div className="flex flex-wrap gap-1.5">
                  {split.travelers.map((t, i) => (
                    <span key={i} className="text-xs bg-surface px-2.5 py-1 rounded-full text-mist">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
