import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { bookingsAPI } from '../../services/api'

const SEEN_KEY = 'voya_seen_confirmed'
const getSeen = (): string[] => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') } catch { return [] } }
const addSeen = (id: string) => localStorage.setItem(SEEN_KEY, JSON.stringify([...getSeen(), id]))

// Build an .ics calendar file (all-day event on the travel date, with a
// 1-day-before reminder alarm) and trigger a download. Works with Apple
// Calendar, Google Calendar, Outlook — i.e. a real reminder on iPhone.
function pad(n: number) { return String(n).padStart(2, '0') }
function icsDate(d: Date) { return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` }
function downloadICS(b: any) {
  const start = new Date(b.travelDate)
  const end = new Date(start); end.setDate(end.getDate() + 1)
  const now = new Date()
  const stamp = `${icsDate(now)}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const esc = (s: string) => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
  const title = b.trip?.title || 'Voya° Trip'
  const dest = b.trip?.destination || b.trip?.country || ''
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Voya//Trips//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${b.bookingId || b._id}@voya.travel`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${icsDate(start)}`,
    `DTEND;VALUE=DATE:${icsDate(end)}`,
    `SUMMARY:${esc(`Voya° Trip — ${title}`)}`,
    `DESCRIPTION:${esc(`Your Voya° journey${dest ? ` to ${dest}` : ''}. Booking ${b.bookingId || ''}. Travellers: ${b.groupSize || 1}.`)}`,
    dest ? `LOCATION:${esc(dest)}` : '',
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`Voya° trip tomorrow — ${title}`)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `voya-trip-${(b.bookingId || b._id || 'reminder')}.ics`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function BookingReminder() {
  const { user } = useAuth()
  const [booking, setBooking] = useState<any | null>(null)

  useEffect(() => {
    if (!user) return
    let alive = true
    const check = async () => {
      try {
        const { data } = await bookingsAPI.mine()
        if (!alive) return
        const seen = getSeen()
        // Show the most recent confirmed booking the user hasn't been notified about
        const fresh = (data.bookings || []).find(
          (b: any) => b.bookingStatus === 'confirmed' && !seen.includes(b._id)
        )
        if (fresh) setBooking(fresh)
      } catch { /* ignore */ }
    }
    check()
    const t = setInterval(check, 90_000) // re-check periodically while the app is open
    return () => { alive = false; clearInterval(t) }
  }, [user])

  if (!booking) return null

  const dismiss = () => { addSeen(booking._id); setBooking(null) }
  const dateStr = new Date(booking.travelDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm" onClick={dismiss}>
      <div className="w-full max-w-sm bg-cream rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Cover */}
        <div className="h-36 relative">
          {booking.trip?.coverImage && <img src={booking.trip.coverImage} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/10" />
          <button onClick={dismiss} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ink/40 text-cream flex items-center justify-center hover:bg-ink/60 transition-colors">
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 text-cream">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-xs font-medium uppercase tracking-widest">Booking confirmed</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <h3 className="font-serif text-2xl text-ink leading-tight mb-1" style={{ fontFamily: '"Instrument Serif", serif' }}>
            {booking.trip?.title}
          </h3>
          <p className="text-sm text-mist mb-5">
            You're all set for <span className="text-ink font-medium">{dateStr}</span>. We can't wait to host you.
          </p>

          <button onClick={() => downloadICS(booking)}
            className="btn-primary w-full justify-center py-3 mb-2">
            <CalendarPlus size={16} /> Add reminder to calendar
          </button>
          <Link to="/dashboard/bookings" onClick={dismiss}
            className="block text-center text-sm text-mist hover:text-ink transition-colors py-2">
            View booking details
          </Link>
          <p className="text-[11px] text-mist/70 text-center mt-2 leading-relaxed">
            The calendar file works with Apple Calendar, Google Calendar & Outlook — with a reminder the day before.
          </p>
        </div>
      </div>
    </div>
  )
}
