import { Helmet } from 'react-helmet-async'

const UPDATED = '5 July 2026'

function LegalLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="pt-20 min-h-screen bg-cream">
      <Helmet>
        <title>{`${title} — Voya°`}</title>
        <meta name="description" content={subtitle} />
      </Helmet>
      <div className="bg-ink py-16 px-5 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top,#C8853A,transparent_60%)]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="section-eyebrow text-amber/70">Legal</p>
          <h1 className="font-serif font-normal text-4xl md:text-5xl text-cream leading-tight"
            style={{ fontFamily: '"Instrument Serif", serif', letterSpacing: '-1px' }}>{title}</h1>
          <p className="text-xs text-fog mt-3">Last updated {UPDATED}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-14">
        <div className="space-y-7 text-sm text-mist leading-relaxed">{children}</div>
        <div className="mt-12 pt-6 border-t border-black/8 text-xs text-mist">
          Questions? Email <a href="mailto:hello@voya.travel" className="text-amber hover:underline">hello@voya.travel</a> or WhatsApp +91 85060 00066.
        </div>
      </div>
    </div>
  )
}

const H = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-serif text-2xl text-ink mt-2" style={{ fontFamily: '"Instrument Serif", serif' }}>{children}</h2>
)

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" subtitle="How Voya° collects, uses, and protects your personal information.">
      <p>At Voya° ("we", "us"), your privacy matters. This policy explains what we collect, why, and how we keep it safe when you use voya.travel or book a journey with us.</p>
      <div><H>Information we collect</H>
        <p>We collect information you give us directly — your name, email, phone number, traveller details, and payment references when you make a booking or enquiry. We also collect basic usage data (pages visited, device type) to improve the site.</p></div>
      <div><H>How we use it</H>
        <p>To process your bookings and enquiries, communicate with you about your trips, send booking confirmations and travel updates, respond to support requests, and — only if you opt in — send occasional newsletters. We never sell your data.</p></div>
      <div><H>Payments</H>
        <p>Card and net-banking payments are processed securely by our payment partner (Razorpay); we do not store your full card details. UPI payments are made directly from your app to ours. We only retain a payment reference against your booking.</p></div>
      <div><H>Sharing</H>
        <p>We share only what is necessary to deliver your trip — for example, traveller names with hotels, guides, or transport partners. We may share data where required by law.</p></div>
      <div><H>Your rights</H>
        <p>You may request a copy of the data we hold about you, ask us to correct it, or request deletion, by emailing hello@voya.travel. You can unsubscribe from marketing at any time via the link in our emails.</p></div>
      <div><H>Cookies</H>
        <p>We use minimal cookies and local storage to keep you signed in and remember your preferences. You can clear these in your browser at any time.</p></div>
    </LegalLayout>
  )
}

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" subtitle="The terms that govern your use of Voya° and the journeys you book with us.">
      <p>These terms govern your use of voya.travel and any journey you book through us. By using the site or making a booking, you agree to them.</p>
      <div><H>Bookings</H>
        <p>A booking is confirmed once payment is received and we send a written confirmation with your Booking ID. Prices are per person and include applicable taxes as shown at checkout unless stated otherwise. Availability is subject to confirmation.</p></div>
      <div><H>Pricing & payment</H>
        <p>All prices are in Indian Rupees (₹). We accept UPI, cards, and net-banking. Prices may change until a booking is confirmed. Any coupon or discount is subject to its own validity and terms.</p></div>
      <div><H>Your responsibilities</H>
        <p>You are responsible for valid travel documents (passport, visas), adequate travel insurance, meeting health/fitness requirements for adventurous trips, and arriving on time for departures. Provide accurate traveller details — errors may incur charges.</p></div>
      <div><H>Changes by us</H>
        <p>Occasionally we may need to change an itinerary due to weather, safety, or circumstances beyond our control. We will always offer the closest possible alternative or a fair refund of the affected portion.</p></div>
      <div><H>Liability</H>
        <p>We act as a travel organiser and are not liable for losses arising from events outside our reasonable control. Our total liability is limited to the value of your booking. Nothing here limits liability that cannot be limited by law.</p></div>
      <div><H>Governing law</H>
        <p>These terms are governed by the laws of India, with jurisdiction in the courts of Gurugram, Haryana.</p></div>
    </LegalLayout>
  )
}

export function CancellationPage() {
  return (
    <LegalLayout title="Cancellation & Refund Policy" subtitle="Our cancellation, refund, and rescheduling terms.">
      <p>Plans change — we get it. Here is exactly how cancellations and refunds work at Voya°.</p>
      <div><H>Free look period</H>
        <p>Cancel within 48 hours of booking for a full refund, provided your departure is more than 15 days away.</p></div>
      <div><H>Cancellation charges</H>
        <p>After the free look period, refunds depend on how far your travel date is:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><span className="text-ink font-medium">30+ days before travel:</span> full refund, less any non-recoverable costs (e.g. paid visa or flight fees).</li>
          <li><span className="text-ink font-medium">15–29 days before travel:</span> 50% refund.</li>
          <li><span className="text-ink font-medium">Under 15 days:</span> no refund, but you may reschedule once for free to any departure within 12 months.</li>
        </ul></div>
      <div><H>How to cancel</H>
        <p>Cancel from your dashboard under "My Bookings", or email hello@voya.travel with your Booking ID. Refunds are processed to your original payment method within 7–10 business days.</p></div>
      <div><H>Rescheduling</H>
        <p>Prefer to move your trip rather than cancel? Contact us at least 15 days before departure and we will move you to another date at no charge (fare differences may apply).</p></div>
      <div><H>Cancellations by Voya°</H>
        <p>If we ever have to cancel a departure (rare, and usually for safety), you receive a full refund or a free transfer to another journey — your choice.</p></div>
    </LegalLayout>
  )
}
