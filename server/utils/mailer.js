const nodemailer = require('nodemailer');

function configured() {
  // Prefer Brevo's HTTPS API (works on hosts that block SMTP, e.g. Render).
  if (process.env.BREVO_API_KEY) return true;
  const p = process.env.EMAIL_PASS;
  return !!p && p !== 'your_gmail_app_password' && !!process.env.EMAIL_USER;
}
exports.isConfigured = configured;

const FROM_EMAIL = () => process.env.EMAIL_USER || 'hello.voyatravel@gmail.com';

// Send via Brevo's transactional email HTTP API (port 443 — never blocked).
async function sendViaBrevo({ to, subject, html }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Voya°', email: FROM_EMAIL() },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
      signal: ctrl.signal,
    });
    if (resp.ok) return { sent: true };
    const errText = await resp.text().catch(() => '');
    console.error('✉️  brevo send failed:', resp.status, errText);
    return { error: `brevo ${resp.status}` };
  } catch (err) {
    console.error('✉️  brevo send error:', err.message);
    return { error: err.message };
  } finally {
    clearTimeout(t);
  }
}

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    // Fail fast instead of hanging the request if SMTP is slow/blocked (e.g. on a host)
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });
  return transporter;
}

// Never throw — email must not break a booking/enquiry. Log and move on.
async function send({ to, subject, html }) {
  if (!configured()) {
    console.log(`✉️  [email skipped — not configured] would send "${subject}" to ${to}`);
    return { skipped: true };
  }
  // Brevo HTTP API is primary (Render blocks SMTP); SMTP is the local fallback.
  if (process.env.BREVO_API_KEY) return sendViaBrevo({ to, subject, html });
  try {
    await getTransporter().sendMail({
      from: `Voya° <${FROM_EMAIL()}>`,
      to, subject, html,
    });
    return { sent: true };
  } catch (err) {
    console.error('✉️  email send failed:', err.message);
    return { error: err.message };
  }
}

const wrap = (title, body) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAF9F6;padding:32px;border-radius:16px;color:#0A0A0A">
    <div style="font-size:24px;font-weight:600;margin-bottom:4px">Voya<span style="color:#C8853A">°</span></div>
    <h2 style="font-weight:600;font-size:20px;margin:16px 0 12px">${title}</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #e5e2db;margin:24px 0"/>
    <p style="font-size:12px;color:#6F6F6F">Voya° Travel · Sector 4, Gurugram, Haryana 122001 · hello@voya.travel</p>
  </div>`;

exports.sendBookingConfirmation = (booking, trip) => {
  const dateStr = new Date(booking.travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const body = `
    <p style="font-size:14px;color:#6F6F6F;line-height:1.6">Hi ${booking.contactName || 'traveller'}, your booking is in! Here are the details:</p>
    <table style="width:100%;font-size:14px;margin-top:12px">
      <tr><td style="color:#6F6F6F;padding:4px 0">Trip</td><td style="text-align:right;font-weight:600">${trip?.title || ''}</td></tr>
      <tr><td style="color:#6F6F6F;padding:4px 0">Booking ID</td><td style="text-align:right;font-weight:600">${booking.bookingId}</td></tr>
      <tr><td style="color:#6F6F6F;padding:4px 0">Travel date</td><td style="text-align:right">${dateStr}</td></tr>
      <tr><td style="color:#6F6F6F;padding:4px 0">Travellers</td><td style="text-align:right">${booking.groupSize}</td></tr>
      <tr><td style="color:#6F6F6F;padding:4px 0">Total</td><td style="text-align:right;font-weight:600">₹${booking.totalAmount?.toLocaleString('en-IN')}</td></tr>
      <tr><td style="color:#6F6F6F;padding:4px 0">Payment</td><td style="text-align:right">${booking.paymentStatus}</td></tr>
    </table>
    <p style="font-size:14px;color:#6F6F6F;line-height:1.6;margin-top:16px">A Voya planner will be in touch soon. Reply to this email or WhatsApp +91 85060 00066 with any questions.</p>`;
  return send({ to: booking.contactEmail, subject: `Your Voya° booking ${booking.bookingId} is confirmed`, html: wrap('Booking received 🎉', body) });
};

exports.sendEnquiryAck = (lead) => {
  const body = `
    <p style="font-size:14px;color:#6F6F6F;line-height:1.6">Hi ${lead.name}, thanks for reaching out to Voya°. We've received your enquiry${lead.subject ? ` about <strong>${lead.subject.replace(/^Enquiry:\s*/, '')}</strong>` : ''} and a planner will reply within 24 hours.</p>
    ${lead.message ? `<p style="font-size:13px;color:#6F6F6F;background:#F4F2EE;padding:12px;border-radius:10px;margin-top:12px">"${lead.message}"</p>` : ''}`;
  return send({ to: lead.email, subject: 'We received your enquiry — Voya°', html: wrap('Thanks for getting in touch', body) });
};

exports.sendOtp = (user, otp) => {
  const body = `
    <p style="font-size:14px;color:#6F6F6F;line-height:1.6">Hi ${user.name || 'traveller'}, welcome to Voya°! Enter this code to verify your email and activate your account:</p>
    <div style="font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;background:#F4F2EE;padding:18px 0;border-radius:12px;margin:18px 0;color:#0A0A0A">${otp}</div>
    <p style="font-size:13px;color:#6F6F6F;line-height:1.6">This code expires in 10 minutes. If you didn't create a Voya° account, you can safely ignore this email.</p>`;
  return send({ to: user.email, subject: `${otp} is your Voya° verification code`, html: wrap('Verify your email', body) });
};

exports.sendAdminAlert = (subject, html) => {
  if (!process.env.EMAIL_USER) return Promise.resolve({ skipped: true });
  return send({ to: process.env.EMAIL_USER, subject: `[Voya° admin] ${subject}`, html: wrap(subject, html) });
};
