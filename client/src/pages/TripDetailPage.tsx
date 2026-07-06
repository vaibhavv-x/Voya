import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Check, X, ChevronDown, ChevronUp, MapPin, Clock, Users, Zap, Heart } from 'lucide-react'
import { tripsAPI, bookingsAPI, reviewsAPI, wishlistAPI, couponsAPI, contactAPI, authAPI } from '../services/api'
import { TripCard } from '../components/layout'
import TripMap from '../components/ui/TripMap'
import { useAuth } from '../context/AuthContext'
import type { Trip, Review } from '../types'

export default function TripDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [trip, setTrip]         = useState<Trip | null>(null)
  const [related, setRelated]   = useState<Trip[]>([])
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'details' | 'reviews'>('overview')
  const [openFaq, setOpenFaq]   = useState<number | null>(null)
  const [wishlisted, setWishlisted] = useState(false)

  // Booking form
  const [travelDate, setTravelDate]   = useState('')
  const [departureId, setDepartureId] = useState('')
  const [travelers, setTravelers]     = useState([{ name: '', age: '', gender: 'Male' }])
  const [specialReq, setSpecialReq]   = useState('')
  const [booking, setBooking]         = useState(false)
  const [booked, setBooked]           = useState(false)
  const [bookingErr, setBookingErr]   = useState('')
  const [createdBooking, setCreatedBooking] = useState<{ _id: string; totalAmount: number; bookingId: string } | null>(null)
  const [paymentStatus, setPaymentStatus]   = useState<'idle' | 'processing' | 'paid' | 'failed'>('idle')
  const [payMethod, setPayMethod]           = useState<'choose' | 'upi' | 'razorpay'>('choose')
  const [upiInfo, setUpiInfo]               = useState<{ upiId: string; amount: number; upiLink: string; bookingId: string } | null>(null)
  const [upiClaimed, setUpiClaimed]         = useState(false)

  // Coupon
  const [couponInput, setCouponInput]   = useState('')
  const [coupon, setCoupon]             = useState<{ code: string; percentOff: number; flatOff: number } | null>(null)
  const [couponErr, setCouponErr]       = useState('')
  const [couponChecking, setCouponChecking] = useState(false)

  // Wallet credit
  const [walletCredit, setWalletCredit] = useState(0)
  const [useCredit, setUseCredit]       = useState(false)

  // Review form
  const [rvRating, setRvRating] = useState(5)
  const [rvTitle, setRvTitle]   = useState('')
  const [rvBody, setRvBody]     = useState('')
  const [rvLoading, setRvLoading] = useState(false)

  // Trip enquiry
  const [enqOpen, setEnqOpen]   = useState(false)
  const [enq, setEnq]           = useState({ name: user?.name || '', email: user?.email || '', phone: '', message: '' })
  const [enqSent, setEnqSent]   = useState(false)
  const [enqLoading, setEnqLoading] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      tripsAPI.bySlug(slug),
      tripsAPI.related(slug),
    ]).then(([tripRes, relRes]) => {
      setTrip(tripRes.data.trip)
      setRelated(relRes.data.trips)
      reviewsAPI.forTrip(tripRes.data.trip._id).then(r => setReviews(r.data.reviews))
      // Check wishlist
      if (user) setWishlisted(user.wishlist?.includes(tripRes.data.trip._id) || false)
    }).catch(() => navigate('/trips'))
    .finally(() => setLoading(false))
    if (user) authAPI.referral().then(r => setWalletCredit(r.data.walletCredit || 0)).catch(() => {})
  }, [slug])

  const addTraveler = () => setTravelers(t => [...t, { name: '', age: '', gender: 'Male' }])
  const removeTraveler = (i: number) => setTravelers(t => t.filter((_, idx) => idx !== i))
  const updateTraveler = (i: number, key: string, val: string) =>
    setTravelers(t => t.map((tr, idx) => idx === i ? { ...tr, [key]: val } : tr))

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponChecking(true); setCouponErr('')
    try {
      const { data } = await couponsAPI.validate(couponInput.trim())
      setCoupon({ code: data.code, percentOff: data.percentOff || 0, flatOff: data.flatOff || 0 })
    } catch (e: any) {
      setCoupon(null)
      setCouponErr(e.response?.data?.message || 'Invalid coupon code')
    } finally { setCouponChecking(false) }
  }

  const handleBook = async () => {
    if (!user) return navigate('/login')
    const hasDeps = (trip?.departures?.length || 0) > 0
    if (hasDeps && !departureId) return setBookingErr('Please choose a departure date')
    if (!hasDeps && !travelDate) return setBookingErr('Please select a travel date')
    if (travelers.some(t => !t.name || !t.age)) return setBookingErr('Please fill all traveler details')
    setBooking(true); setBookingErr('')
    try {
      const { data } = await bookingsAPI.create({
        tripId: trip!._id,
        travelDate: hasDeps ? undefined : travelDate,
        departureId: hasDeps ? departureId : undefined,
        travelers: travelers.map(t => ({ name: t.name, age: Number(t.age), gender: t.gender })),
        specialRequests: specialReq,
        couponCode: coupon?.code,
        useCredit,
      })
      setCreatedBooking(data.booking)
      setBooked(true)
      setPayMethod('choose')
    } catch (e: any) {
      setBookingErr(e.response?.data?.message || 'Booking failed. Please try again.')
    } finally { setBooking(false) }
  }

  const startUpi = async (bk: { _id: string }) => {
    try {
      const { data } = await bookingsAPI.upiIntent(bk._id)
      setUpiInfo(data)
      setPayMethod('upi')
    } catch (e: any) {
      alert(e.response?.data?.message || 'UPI is not available right now.')
    }
  }

  const claimUpiPaid = async () => {
    if (!createdBooking) return
    try { await bookingsAPI.upiClaim(createdBooking._id) } catch {}
    setUpiClaimed(true)
  }

  const startPayment = async (bk: { _id: string; totalAmount: number; bookingId: string }) => {
    setPaymentStatus('processing')
    try {
      const { data: order } = await bookingsAPI.createOrder(bk._id)
      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Voya°',
        description: trip?.title,
        theme: { color: '#C8853A' },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        handler: async (response: any) => {
          try {
            await bookingsAPI.verifyPayment(bk._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            setPaymentStatus('paid')
          } catch {
            setPaymentStatus('failed')
          }
        },
        modal: { ondismiss: () => setPaymentStatus(s => s === 'processing' ? 'failed' : s) },
      })
      rzp.on('payment.failed', () => setPaymentStatus('failed'))
      rzp.open()
    } catch {
      setPaymentStatus('failed')
    }
  }

  const toggleWishlist = async () => {
    if (!user) return navigate('/login')
    try {
      await wishlistAPI.toggle(trip!._id)
      setWishlisted(w => !w)
    } catch {}
  }

  const submitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnqLoading(true)
    try {
      await contactAPI.send({
        name: enq.name, email: enq.email, phone: enq.phone,
        subject: `Enquiry: ${trip!.title}`,
        message: enq.message,
        tripTypes: [trip!.category],
      })
      setEnqSent(true)
    } catch {
      alert('Could not send your enquiry. Please try again or use WhatsApp.')
    } finally { setEnqLoading(false) }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return navigate('/login')
    setRvLoading(true)
    try {
      const { data } = await reviewsAPI.create({ tripId: trip!._id, rating: rvRating, title: rvTitle, body: rvBody })
      setReviews(r => [data.review, ...r])
      setRvTitle(''); setRvBody(''); setRvRating(5)
    } catch (e: any) {
      alert(e.response?.data?.message || 'Review failed')
    } finally { setRvLoading(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="w-10 h-10 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
    </div>
  )
  if (!trip) return null

  const discounted = trip.originalPrice && trip.originalPrice > trip.pricePerPerson
  const total = trip.pricePerPerson * travelers.length
  const discountAmt = coupon ? (coupon.flatOff > 0 ? Math.min(coupon.flatOff, total) : Math.round(total * coupon.percentOff / 100)) : 0
  const taxable = total - discountAmt
  const beforeCredit = taxable + Math.round(taxable * 0.05)
  const creditApplied = useCredit ? Math.min(walletCredit, beforeCredit) : 0
  const grandTotal = beforeCredit - creditApplied

  return (
    <div className="pt-20 min-h-screen bg-cream dark:bg-ink">
      <Helmet>
        <title>{`${trip.title} — Voya°`}</title>
        <meta name="description" content={`${trip.tagline} ${trip.days}D/${trip.nights}N in ${trip.destination}, ${trip.country}. From ₹${trip.pricePerPerson.toLocaleString('en-IN')} per person.`} />
        <meta property="og:title" content={`${trip.title} — Voya°`} />
        <meta property="og:description" content={trip.tagline} />
        <meta property="og:image" content={trip.coverImage} />
      </Helmet>
      {/* Back */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-6">
        <Link to="/trips" className="inline-flex items-center gap-2 text-sm text-mist hover:text-ink dark:hover:text-cream transition-colors mb-6">
          <ArrowLeft size={15} /> All journeys
        </Link>
      </div>

      {/* Image gallery */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden h-[420px]">
          <div className="md:col-span-2 relative overflow-hidden cursor-pointer" onClick={() => setActiveImg(0)}>
            <img src={trip.images?.[activeImg] || trip.coverImage} alt={trip.title}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-3">
            {(trip.images || []).slice(1, 3).map((img, i) => (
              <div key={i} className="relative overflow-hidden cursor-pointer rounded-r-none" onClick={() => setActiveImg(i + 1)}>
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Title & meta */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <span className="text-xs text-amber font-medium tracking-widest uppercase">{trip.category}</span>
                <h1 className="font-serif font-normal text-4xl md:text-5xl text-ink dark:text-cream mt-1 leading-tight"
                  style={{ fontFamily: '"Instrument Serif", serif' }}>{trip.title}</h1>
              </div>
              <button onClick={toggleWishlist}
                className={`mt-2 p-2.5 rounded-full border transition-all ${wishlisted ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-500' : 'border-black/10 dark:border-white/12 text-mist hover:border-red-200 hover:text-red-400'}`}>
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-mist mb-5">
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-amber" />{trip.destination}, {trip.country}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} className="text-amber" />{trip.days}D / {trip.nights}N</span>
              <span className="flex items-center gap-1.5"><Users size={13} className="text-amber" />Max {trip.maxGroupSize}</span>
              <span className="flex items-center gap-1.5"><Zap size={13} className="text-amber" />{trip.difficulty}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < Math.round(trip.rating) ? 'fill-amber text-amber' : 'text-fog'} />
              ))}</div>
              <span className="font-semibold text-ink dark:text-cream text-sm">{trip.rating}</span>
              <span className="text-xs text-mist">({trip.reviewCount} reviews)</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface dark:bg-white/5 rounded-xl p-1 mb-7 overflow-x-auto">
              {(['overview','itinerary','details','reviews'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                    activeTab === tab ? 'bg-cream dark:bg-ink text-ink dark:text-cream shadow-sm' : 'text-mist hover:text-ink dark:hover:text-cream'
                  }`}>{tab}</button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div>
                <p className="text-sm text-mist leading-relaxed mb-8">{trip.description}</p>
                {trip.highlights.length > 0 && (
                  <>
                    <h3 className="font-serif text-xl mb-4" style={{ fontFamily: '"Instrument Serif", serif' }}>Trip highlights</h3>
                    <ul className="space-y-2 mb-8">
                      {trip.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-mist">
                          <Check size={14} className="text-amber mt-0.5 flex-shrink-0" />{h}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-mist font-medium mb-3">What's included</h4>
                    <ul className="space-y-2">
                      {trip.included.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-mist">
                          <Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-mist font-medium mb-3">Not included</h4>
                    <ul className="space-y-2">
                      {trip.excluded.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-mist">
                          <X size={12} className="text-red-400 mt-0.5 flex-shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Itinerary */}
            {activeTab === 'itinerary' && (
              <div className="space-y-4">
                {trip.itinerary.map((day, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber font-semibold text-sm">
                      {day.day}
                    </div>
                    <div className="flex-1 pb-5 border-b border-black/5 dark:border-white/8 last:border-0">
                      <h3 className="font-medium text-ink dark:text-cream mb-1">Day {day.day}: {day.title}</h3>
                      <p className="text-xs text-mist leading-relaxed mb-2">{day.description}</p>
                      {day.activities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {day.activities.map((a, j) => (
                            <span key={j} className="text-[10px] bg-amber/8 text-amber px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                        </div>
                      )}
                      {day.accommodation && (
                        <p className="text-[10px] text-mist flex items-center gap-1">🏨 {day.accommodation}</p>
                      )}
                      <div className="flex gap-2 mt-1.5">
                        {[['🌅','Breakfast',day.meals?.breakfast],['☀️','Lunch',day.meals?.lunch],['🌙','Dinner',day.meals?.dinner]].map(([icon, label, inc]) => (
                          <span key={label as string} className={`text-[10px] px-2 py-0.5 rounded-full ${inc ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-surface dark:bg-white/5 text-fog'}`}>
                            {icon} {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Details */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Best time to visit', trip.bestTimeToVisit],
                    ['Climate', trip.climate],
                    ['Language', trip.language],
                    ['Departure from', trip.departureFrom],
                    ['Accommodation', trip.accommodation?.name],
                    ['Local transport', trip.transport?.local],
                    ['Visa required', trip.visaRequired ? 'Yes' : 'No'],
                  ].filter(([,v]) => v).map(([label, val]) => (
                    <div key={label as string} className="bg-surface dark:bg-white/5 rounded-xl p-4">
                      <p className="text-[10px] text-mist uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-sm text-ink dark:text-cream">{val}</p>
                    </div>
                  ))}
                </div>
                {trip.visaRequired && trip.visaInfo && (
                  <div className="bg-amber/8 border border-amber/20 rounded-xl p-4">
                    <p className="text-xs font-medium text-amber mb-1">Visa Information</p>
                    <p className="text-xs text-mist">{trip.visaInfo}</p>
                  </div>
                )}
                {trip.faqs?.length > 0 && (
                  <div>
                    <h3 className="font-serif text-xl mb-4" style={{ fontFamily: '"Instrument Serif", serif' }}>FAQs</h3>
                    <div className="space-y-2">
                      {trip.faqs.map((faq, i) => (
                        <div key={i} className="border border-black/6 dark:border-white/10 rounded-xl overflow-hidden">
                          <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="w-full flex justify-between items-center p-4 text-left hover:bg-surface dark:hover:bg-white/5 transition-colors">
                            <span className="text-sm font-medium text-ink dark:text-cream pr-4">{faq.question}</span>
                            {openFaq === i ? <ChevronUp size={15} className="text-mist flex-shrink-0" /> : <ChevronDown size={15} className="text-mist flex-shrink-0" />}
                          </button>
                          {openFaq === i && <p className="px-4 pb-4 text-xs text-mist leading-relaxed border-t border-black/5 dark:border-white/8 pt-3">{faq.answer}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {trip.location && (
                  <div>
                    <h3 className="font-serif text-xl mb-4" style={{ fontFamily: '"Instrument Serif", serif' }}>Where you'll be</h3>
                    <TripMap lat={trip.location.lat} lng={trip.location.lng} label={trip.destination} />
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 && (
                  <p className="text-sm text-mist mb-6">No reviews yet. Be the first to share your experience.</p>
                )}
                <div className="space-y-5 mb-8">
                  {reviews.map(r => (
                    <div key={r._id} className="border border-black/6 dark:border-white/10 rounded-xl p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber/15 flex items-center justify-center text-amber font-semibold text-xs flex-shrink-0">
                          {r.user.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm text-ink dark:text-cream">{r.user.name}</span>
                            <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={11} className="fill-amber text-amber" />)}</div>
                          </div>
                          <p className="text-[10px] text-mist">{new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</p>
                        </div>
                      </div>
                      <h4 className="font-medium text-sm text-ink dark:text-cream mb-1">{r.title}</h4>
                      <p className="text-xs text-mist leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>
                {user && (
                  <form onSubmit={submitReview} className="border border-black/8 dark:border-white/10 rounded-xl p-5">
                    <h3 className="font-medium text-sm mb-4">Write a review</h3>
                    <div className="flex gap-1 mb-3">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setRvRating(s)}>
                          <Star size={20} className={s <= rvRating ? 'fill-amber text-amber' : 'text-fog'} />
                        </button>
                      ))}
                    </div>
                    <input value={rvTitle} onChange={e => setRvTitle(e.target.value)} required placeholder="Review title" className="input-base mb-3" />
                    <textarea value={rvBody} onChange={e => setRvBody(e.target.value)} required rows={3} placeholder="Tell others about your experience..." className="input-base mb-3 resize-none" />
                    <button type="submit" disabled={rvLoading} className="btn-primary text-sm py-2.5 disabled:opacity-50">
                      {rvLoading ? 'Posting...' : 'Post review'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Sticky booking card */}
          <div>
            <div className="sticky top-24 bg-cream dark:bg-[#141414] border border-black/8 dark:border-white/10 rounded-2xl p-6 shadow-lg shadow-black/5 dark:shadow-black/30">
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-ink dark:text-cream">₹{trip.pricePerPerson.toLocaleString('en-IN')}</span>
                  {discounted && <span className="text-sm text-fog line-through">₹{trip.originalPrice?.toLocaleString('en-IN')}</span>}
                </div>
                <p className="text-xs text-mist">per person + 5% GST</p>
              </div>

              {booked ? (
                <div className="py-2">
                  {/* Paid via Razorpay */}
                  {paymentStatus === 'paid' ? (
                    <div className="text-center py-2">
                      <div className="text-3xl mb-2">🎉</div>
                      <p className="font-medium text-ink mb-1">Booking confirmed!</p>
                      <p className="text-xs text-mist mb-4">Payment received. Booking ID: {createdBooking?.bookingId}</p>
                      <Link to="/dashboard/bookings" className="btn-primary text-sm py-2.5 justify-center">View my bookings</Link>
                    </div>
                  ) : upiClaimed ? (
                    /* UPI payment claimed — pending verification */
                    <div className="text-center py-2">
                      <div className="text-3xl mb-2">✅</div>
                      <p className="font-medium text-ink mb-1">Thanks — payment noted!</p>
                      <p className="text-xs text-mist mb-4">We'll verify your UPI payment and confirm within a few hours. Booking ID: {createdBooking?.bookingId}</p>
                      <Link to="/dashboard/bookings" className="btn-primary text-sm py-2.5 justify-center">View my bookings</Link>
                    </div>
                  ) : payMethod === 'upi' && upiInfo ? (
                    /* UPI QR + deep link */
                    <div className="text-center">
                      <p className="font-medium text-ink mb-1">Pay ₹{upiInfo.amount.toLocaleString('en-IN')} via UPI</p>
                      <p className="text-[11px] text-mist mb-3">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiInfo.upiLink)}`}
                        alt="UPI QR code" className="w-44 h-44 mx-auto rounded-xl border border-black/8 bg-white p-2" />
                      <p className="text-xs text-mist mt-3">Paying to <span className="font-medium text-ink">{upiInfo.upiId}</span></p>
                      <a href={upiInfo.upiLink} className="btn-primary text-sm py-2.5 justify-center w-full mt-3">Open UPI app to pay</a>
                      <button onClick={claimUpiPaid} className="w-full mt-2 text-sm text-ink border border-black/15 rounded-full py-2.5 hover:border-ink transition-colors">I've paid</button>
                      <button onClick={() => setPayMethod('choose')} className="text-xs text-mist hover:text-ink transition-colors mt-3">← Choose another method</button>
                    </div>
                  ) : payMethod === 'razorpay' ? (
                    /* Razorpay flow */
                    <div className="text-center py-2">
                      {paymentStatus === 'processing' && (
                        <>
                          <div className="w-10 h-10 border-2 border-amber/30 border-t-amber rounded-full animate-spin mx-auto mb-4" />
                          <p className="font-medium text-ink mb-1">Waiting for payment…</p>
                          <p className="text-xs text-mist">Complete the Razorpay checkout to confirm your booking.</p>
                        </>
                      )}
                      {paymentStatus === 'failed' && (
                        <>
                          <div className="text-3xl mb-2">⚠️</div>
                          <p className="font-medium text-ink mb-1">Payment not completed</p>
                          <p className="text-xs text-mist mb-4">Your booking is saved as pending — retry anytime.</p>
                          <button onClick={() => createdBooking && startPayment(createdBooking)} className="btn-primary text-sm py-2.5 justify-center w-full mb-2">Retry payment</button>
                          <button onClick={() => setPayMethod('choose')} className="text-xs text-mist hover:text-ink transition-colors">← Choose another method</button>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Payment method chooser */
                    <div className="text-center py-2">
                      <div className="text-2xl mb-2">📋</div>
                      <p className="font-medium text-ink mb-1">Booking created!</p>
                      <p className="text-xs text-mist mb-4">Choose how you'd like to pay ₹{createdBooking?.totalAmount.toLocaleString('en-IN')}</p>
                      <button onClick={() => createdBooking && startUpi(createdBooking)}
                        className="btn-primary text-sm py-3 justify-center w-full mb-2">Pay via UPI (GPay / PhonePe)</button>
                      <button onClick={() => { setPayMethod('razorpay'); createdBooking && startPayment(createdBooking) }}
                        className="w-full text-sm text-ink border border-black/15 rounded-full py-3 hover:border-ink transition-colors mb-2">Pay with Card / Netbanking</button>
                      {travelers.length > 1 && createdBooking && (
                        <Link to={`/split/${createdBooking._id}`}
                          className="w-full flex items-center justify-center gap-2 text-sm text-ink border border-black/15 rounded-full py-3 hover:border-ink transition-colors">
                          <Users size={14} /> Split with my group ({travelers.length} pay separately)
                        </Link>
                      )}
                      <Link to="/dashboard/bookings" className="block text-xs text-mist hover:text-ink transition-colors mt-3">Pay later — view my bookings</Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {trip.departures && trip.departures.length > 0 ? (
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-mist block mb-2">Choose a departure</label>
                        <div className="space-y-1.5">
                          {trip.departures.map(dep => {
                            const left = dep.seatsTotal - dep.seatsBooked
                            const full = left < travelers.length
                            return (
                              <button key={dep._id} type="button" disabled={full}
                                onClick={() => setDepartureId(dep._id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                                  departureId === dep._id ? 'border-ink bg-ink/[0.03]' : 'border-black/10 hover:border-ink/40'
                                } ${full ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                <span className="text-sm text-ink">{new Date(dep.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${full ? 'bg-red-50 text-red-500' : left <= 4 ? 'bg-amber/10 text-amber' : 'bg-green-50 text-green-600'}`}>
                                  {full ? 'Sold out' : `${left} seat${left > 1 ? 's' : ''} left`}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-mist block mb-1">Travel Date</label>
                        <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="input-base text-sm" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] uppercase tracking-widest text-mist">Travelers ({travelers.length})</label>
                        {travelers.length < trip.maxGroupSize && (
                          <button type="button" onClick={addTraveler} className="text-[10px] text-amber hover:underline">+ Add traveler</button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {travelers.map((t, i) => (
                          <div key={i} className="bg-surface dark:bg-white/5 rounded-xl p-3 relative">
                            {travelers.length > 1 && (
                              <button onClick={() => removeTraveler(i)} className="absolute top-2 right-2 text-fog hover:text-red-400 transition-colors">
                                <X size={12} />
                              </button>
                            )}
                            <p className="text-[10px] text-mist mb-2">Traveler {i + 1}</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              <input value={t.name} onChange={e => updateTraveler(i, 'name', e.target.value)}
                                placeholder="Full name" className="input-base text-xs py-2 col-span-2" />
                              <input type="number" value={t.age} onChange={e => updateTraveler(i, 'age', e.target.value)}
                                placeholder="Age" className="input-base text-xs py-2" min={1} max={99} />
                              <select value={t.gender} onChange={e => updateTraveler(i, 'gender', e.target.value)}
                                className="input-base text-xs py-2">
                                <option>Male</option><option>Female</option><option>Other</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <textarea value={specialReq} onChange={e => setSpecialReq(e.target.value)}
                      placeholder="Special requests (dietary, accessibility, etc.)"
                      rows={2} className="input-base text-xs resize-none" />

                    {coupon ? (
                      <div className="flex items-center justify-between bg-green-50 text-green-700 text-xs px-3 py-2 rounded-xl">
                        <span>✓ {coupon.code} applied — {coupon.flatOff > 0 ? `₹${coupon.flatOff.toLocaleString('en-IN')} off` : `${coupon.percentOff}% off`}</span>
                        <button type="button" onClick={() => { setCoupon(null); setCouponInput('') }} className="text-green-700/70 hover:text-green-700"><X size={12} /></button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Coupon code" className="input-base text-xs py-2 flex-1" />
                          <button type="button" onClick={applyCoupon} disabled={couponChecking || !couponInput.trim()}
                            className="px-4 text-xs font-medium bg-surface dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50">
                            {couponChecking ? '...' : 'Apply'}
                          </button>
                        </div>
                        {couponErr && <p className="text-[10px] text-red-500 mt-1">{couponErr}</p>}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-black/6 dark:border-white/10 pt-4 mb-4">
                    <div className="flex justify-between text-xs text-mist mb-1">
                      <span>₹{trip.pricePerPerson.toLocaleString('en-IN')} × {travelers.length}</span>
                      <span>₹{(trip.pricePerPerson * travelers.length).toLocaleString('en-IN')}</span>
                    </div>
                    {coupon && (
                      <div className="flex justify-between text-xs text-green-600 mb-1">
                        <span>Coupon ({coupon.flatOff > 0 ? `₹${coupon.flatOff.toLocaleString('en-IN')} off` : `${coupon.percentOff}% off`})</span>
                        <span>−₹{discountAmt.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-mist mb-2">
                      <span>GST (5%)</span>
                      <span>₹{Math.round(taxable * 0.05).toLocaleString('en-IN')}</span>
                    </div>
                    {creditApplied > 0 && (
                      <div className="flex justify-between text-xs text-green-600 mb-2">
                        <span>Travel credit</span>
                        <span>−₹{creditApplied.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-ink dark:text-cream">
                      <span>Total</span>
                      <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>
                    {walletCredit > 0 && (
                      <label className="flex items-center gap-2 mt-3 text-xs text-ink dark:text-cream cursor-pointer">
                        <input type="checkbox" checked={useCredit} onChange={e => setUseCredit(e.target.checked)} />
                        Use my ₹{walletCredit.toLocaleString('en-IN')} travel credit
                      </label>
                    )}
                  </div>

                  {bookingErr && <p className="text-xs text-red-500 mb-3">{bookingErr}</p>}

                  <button onClick={handleBook} disabled={booking || trip.soldOut}
                    className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
                    {trip.soldOut ? 'Sold Out' : booking ? 'Processing...' : user ? 'Book this journey' : 'Sign in to book'}
                  </button>
                  <p className="text-[10px] text-mist text-center mt-2">No payment charged yet. Confirm later.</p>

                  <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/8 space-y-1.5">
                    {['Free cancellation within 48h','Best price guarantee','24/7 expert support'].map(t => (
                      <div key={t} className="flex items-center gap-2 text-[10px] text-mist">
                        <Check size={10} className="text-green-500 flex-shrink-0" />{t}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Enquire about this trip */}
            <div className="mt-4 bg-surface rounded-2xl p-5 border border-black/6">
              {enqSent ? (
                <div className="text-center py-2">
                  <div className="text-2xl mb-1">✉️</div>
                  <p className="text-sm font-medium text-ink">Enquiry sent!</p>
                  <p className="text-xs text-mist mt-1">A Voya planner will reach out within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">Have questions?</p>
                      <p className="text-xs text-mist mt-0.5">Ask our planners about this journey.</p>
                    </div>
                    {!enqOpen && (
                      <button onClick={() => setEnqOpen(true)} className="text-xs font-medium text-amber hover:underline whitespace-nowrap">Enquire →</button>
                    )}
                  </div>
                  {enqOpen && (
                    <form onSubmit={submitEnquiry} className="space-y-2 mt-4">
                      <input required value={enq.name} onChange={e => setEnq(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="input-base text-xs py-2" />
                      <input required type="email" value={enq.email} onChange={e => setEnq(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="input-base text-xs py-2" />
                      <input value={enq.phone} onChange={e => setEnq(f => ({ ...f, phone: e.target.value }))} placeholder="Phone (optional)" className="input-base text-xs py-2" />
                      <textarea value={enq.message} onChange={e => setEnq(f => ({ ...f, message: e.target.value }))} placeholder="Your question about this trip..." rows={2} className="input-base text-xs py-2 resize-none" />
                      <button type="submit" disabled={enqLoading} className="btn-primary text-xs py-2.5 w-full justify-center disabled:opacity-50">
                        {enqLoading ? 'Sending…' : 'Send enquiry'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related trips */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-3xl mb-7" style={{ fontFamily: '"Instrument Serif", serif' }}>
              You might also like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((t, i) => <TripCard key={t._id} trip={t} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
