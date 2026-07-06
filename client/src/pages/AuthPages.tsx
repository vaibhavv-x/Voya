import { useState } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, MailCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

// ─── Shared OTP verification step ────────────────────────────────────────────
function OtpStage({ email, initialDevOtp, onVerified }: { email: string; initialDevOtp?: string; onVerified: () => void }) {
  const { verifyOtp } = useAuth()
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState(initialDevOtp)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [resent, setResent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('')
    try { await verifyOtp(email, otp.trim()); onVerified() }
    catch (e: any) { setErr(e.response?.data?.message || 'Verification failed') }
    finally { setLoading(false) }
  }

  const resend = async () => {
    setErr(''); setResent(false)
    try {
      const { data } = await authAPI.resendOtp({ email })
      setDevOtp(data.devOtp); setResent(true); setTimeout(() => setResent(false), 4000)
    } catch (e: any) { setErr(e.response?.data?.message || 'Could not resend code') }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="w-12 h-12 rounded-2xl bg-amber/15 flex items-center justify-center text-amber mb-5">
        <MailCheck size={22} />
      </div>
      <h1 className="font-serif text-3xl text-ink mb-1" style={{ fontFamily: '"Instrument Serif", serif' }}>Verify your email</h1>
      <p className="text-sm text-mist mb-6 leading-relaxed">
        We sent a 6-digit code to <span className="text-ink font-medium">{email}</span>. Enter it below to activate your account.
      </p>

      {devOtp && (
        <div className="bg-amber/10 border border-amber/25 text-amber text-xs rounded-xl p-3 mb-5 leading-relaxed">
          ⚙️ Email sending isn't configured yet, so here's your code for now: <strong className="tracking-widest">{devOtp}</strong>
        </div>
      )}
      {resent && <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl p-3 mb-5">✓ A fresh code has been sent.</div>}
      {err && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3 mb-5">{err}</div>}

      <form onSubmit={submit} className="space-y-4">
        <input
          inputMode="numeric" maxLength={6} required autoFocus value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="input-base text-center text-2xl font-semibold tracking-[0.5em] pl-[0.5em]" />
        <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
          {loading ? 'Verifying…' : <>Verify & continue <ArrowRight size={15} /></>}
        </button>
      </form>

      <p className="text-sm text-mist mt-6 text-center">
        Didn't get it? <button onClick={resend} className="text-ink font-medium hover:underline">Resend code</button>
      </p>
    </div>
  )
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState('')
  const [verify, setVerify]     = useState<{ email: string; devOtp?: string } | null>(null)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('')
    try { await login(email, password); navigate('/dashboard') }
    catch (e: any) {
      const d = e.response?.data
      // Account exists but email never verified — route into the OTP step
      if (d?.needsVerification) setVerify({ email: d.email || email, devOtp: d.devOtp })
      else setErr(d?.message || 'Login failed')
    }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900" alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 flex flex-col justify-end p-14 text-cream">
          <div className="flex items-baseline gap-0.5 mb-10">
            <span className="font-serif text-3xl" style={{ fontFamily: '"Instrument Serif", serif' }}>Voya</span>
            <sup className="text-[11px] text-amber font-sans">°</sup>
          </div>
          <h2 className="font-serif text-4xl font-normal leading-tight mb-4" style={{ fontFamily: '"Instrument Serif", serif' }}>
            Welcome back,<br /><em className="text-fog italic">traveler.</em>
          </h2>
          <p className="text-sm text-fog leading-relaxed max-w-xs">
            Your bookings, wishlist, and upcoming adventures — all in one place.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        {verify ? (
          <OtpStage email={verify.email} initialDevOtp={verify.devOtp} onVerified={() => navigate('/dashboard')} />
        ) : (
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-baseline gap-0.5 mb-10 lg:hidden">
            <span className="font-serif text-2xl text-ink" style={{ fontFamily: '"Instrument Serif", serif' }}>Voya</span>
            <sup className="text-[10px] text-amber">°</sup>
          </Link>
          <h1 className="font-serif text-3xl text-ink mb-1" style={{ fontFamily: '"Instrument Serif", serif' }}>Sign in</h1>
          <p className="text-sm text-mist mb-8">
            No account? <Link to="/register" className="text-ink font-medium hover:underline">Create one</Link>
          </p>
          {err && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3 mb-5">{err}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" className="input-base" />
            <div className="relative">
              <input type={show ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" className="input-base pr-11" />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-fog hover:text-ink transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
              {loading ? 'Signing in…' : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>
        )}
      </div>
    </div>
  )
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const ref = params.get('ref') || ''

  // If routed here from an unverified login, jump straight to the OTP step
  const routed = (location.state as any)?.verifyEmail
  const [verify, setVerify] = useState<{ email: string; devOtp?: string } | null>(
    routed ? { email: routed, devOtp: (location.state as any)?.devOtp } : null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('')
    try {
      const res = await register(form.name, form.email, form.password, form.phone, ref)
      setVerify({ email: res.email, devOtp: res.devOtp })
    }
    catch (e: any) { setErr(e.response?.data?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream flex">
      <div className="hidden lg:flex lg:w-1/2 bg-ink relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=900" alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 flex flex-col justify-end p-14 text-cream">
          <h2 className="font-serif text-4xl font-normal leading-tight mb-4" style={{ fontFamily: '"Instrument Serif", serif' }}>
            Join 8,000+<br /><em className="text-fog italic">soulful wanderers.</em>
          </h2>
          <p className="text-sm text-fog leading-relaxed max-w-xs">Exclusive early access to new trips, personalised recommendations, and a community that travels like you do.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        {verify ? (
          <OtpStage email={verify.email} initialDevOtp={verify.devOtp} onVerified={() => navigate('/dashboard')} />
        ) : (
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl text-ink mb-1" style={{ fontFamily: '"Instrument Serif", serif' }}>Create account</h1>
          <p className="text-sm text-mist mb-8">Already a member? <Link to="/login" className="text-ink font-medium hover:underline">Sign in</Link></p>
          {ref && <div className="bg-amber/10 border border-amber/20 text-amber text-xs rounded-xl p-3 mb-5">🎁 You were invited! Sign up and get <strong>₹1,000</strong> credit towards your first trip.</div>}
          {err && <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3 mb-5">{err}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Full name" className="input-base" />
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Email address" className="input-base" />
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Phone (optional)" className="input-base" />
            <div className="relative">
              <input type={show ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Password" className="input-base pr-11" />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-fog hover:text-ink transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
              {loading ? 'Creating…' : <>Create account <ArrowRight size={15} /></>}
            </button>
          </form>
        </div>
        )}
      </div>
    </div>
  )
}
