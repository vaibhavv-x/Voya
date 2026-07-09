const nodemailer = require('nodemailer');

function gmailConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}
function configured() {
  // All over HTTPS so they work on hosts that block SMTP (e.g. Render).
  if (process.env.RESEND_API_KEY) return true;   // Resend (preferred)
  if (gmailConfigured()) return true;             // Gmail API (OAuth2)
  if (process.env.BREVO_API_KEY) return true;
  const p = process.env.EMAIL_PASS;
  return !!p && p !== 'your_gmail_app_password' && !!process.env.EMAIL_USER;
}
exports.isConfigured = configured;

const FROM_EMAIL = () => process.env.EMAIL_USER || 'hello@voyatravel.live';

// ── Resend (transactional email over HTTPS — instant domain verification) ──
async function sendViaResend({ to, subject, html }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: `Voya° <${FROM_EMAIL()}>`, to: [to], subject, html }),
      signal: ctrl.signal,
    });
    if (resp.ok) return { sent: true };
    const errText = await resp.text().catch(() => '');
    console.error('✉️  resend send failed:', resp.status, errText);
    return { error: `resend ${resp.status}` };
  } catch (err) {
    console.error('✉️  resend send error:', err.message);
    return { error: err.message };
  } finally {
    clearTimeout(t);
  }
}

// ── Gmail API (send over HTTPS via OAuth2 — not blocked by Render) ──
let gmailToken = { value: null, exp: 0 };
async function gmailAccessToken() {
  if (gmailToken.value && Date.now() < gmailToken.exp - 60000) return gmailToken.value;
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.access_token) throw new Error('gmail token: ' + (data.error || resp.status));
  gmailToken = { value: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 };
  return gmailToken.value;
}
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const encHeader = (s) => `=?UTF-8?B?${b64(s)}?=`; // RFC 2047 for non-ASCII (e.g. the ° in Voya°)
function buildRawEmail({ to, subject, html }) {
  const msg = [
    `From: ${encHeader('Voya°')} <${FROM_EMAIL()}>`,
    `To: ${to}`,
    `Subject: ${encHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(html),
  ].join('\r\n');
  return b64(msg).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); // base64url
}
async function sendViaGmail({ to, subject, html }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const token = await gmailAccessToken();
    const resp = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ raw: buildRawEmail({ to, subject, html }) }),
      signal: ctrl.signal,
    });
    if (resp.ok) return { sent: true };
    const errText = await resp.text().catch(() => '');
    console.error('✉️  gmail send failed:', resp.status, errText);
    return { error: `gmail ${resp.status}` };
  } catch (err) {
    console.error('✉️  gmail send error:', err.message);
    return { error: err.message };
  } finally {
    clearTimeout(t);
  }
}

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
  // All HTTPS-based senders first (Render blocks SMTP); SMTP is the local fallback.
  if (process.env.RESEND_API_KEY) return sendViaResend({ to, subject, html });
  if (gmailConfigured()) return sendViaGmail({ to, subject, html });
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
