<div align="center">

# Voya°

### Curated travel for the soulful wanderer.

A production-grade **MERN** travel platform — cinematic UI, full booking engine, payments, an AI trip designer, and a complete admin suite.

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

<br/>

![Status](https://img.shields.io/badge/status-active-success?style=flat-square)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey?style=flat-square)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)
![Made with love](https://img.shields.io/badge/made%20with-%E2%99%A5-C8853A?style=flat-square)

</div>

---

## ✨ Highlights

- 🎬 **Cinematic, editorial UI** — Instrument Serif + Inter, an ambient video hero, Framer Motion, fully responsive down to mobile.
- 🧭 **AI Trip Designer & assistant** — Google Gemini plans custom itineraries and answers traveller questions in-app.
- 💳 **Real payments** — Razorpay (cards/net-banking) **and** direct UPI-to-bank, plus **group split payments** where each traveller pays their share.
- 🔐 **Email OTP verification** — new accounts confirm a 6-digit code before activation.
- 📅 **Booking lifecycle** — seat-managed departures, confirmation popup, and an **Add-to-Calendar (.ics)** reminder.
- 🎁 **Referral program** — wallet credit for inviter and invitee, redeemable at checkout.
- 🛠️ **Full admin suite** — trips CRUD (Cloudinary uploads), bookings, coupons, enquiries, and live stats.
- 📧 **Transactional email** — OTP, booking confirmations, admin alerts, enquiry acknowledgements (Nodemailer).
- 🔎 **SEO-ready** — `react-helmet-async` meta tags + generated sitemap.

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/-React_18-61DAFB?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white) |
| **UX** | ![Framer Motion](https://img.shields.io/badge/-Framer_Motion-0055FF?logo=framer&logoColor=white) ![React Router](https://img.shields.io/badge/-React_Router-CA4245?logo=reactrouter&logoColor=white) ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) ![Mongoose](https://img.shields.io/badge/-Mongoose-880000?logo=mongoose&logoColor=white) |
| **Data & Auth** | ![MongoDB](https://img.shields.io/badge/-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white) ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white) ![bcrypt](https://img.shields.io/badge/-bcrypt-525252) |
| **Services** | ![Gemini](https://img.shields.io/badge/-Google_Gemini-8E75B2?logo=googlegemini&logoColor=white) ![Razorpay](https://img.shields.io/badge/-Razorpay-0C2451?logo=razorpay&logoColor=white) ![Cloudinary](https://img.shields.io/badge/-Cloudinary-3448C5?logo=cloudinary&logoColor=white) ![Gmail](https://img.shields.io/badge/-Nodemailer-EA4335?logo=gmail&logoColor=white) ![Maps](https://img.shields.io/badge/-Google_Maps-4285F4?logo=googlemaps&logoColor=white) |
| **Deploy** | ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/-Render-46E3B7?logo=render&logoColor=black) |

---

## 🗂️ Project Structure

```
voya-mern/
├── server/                     # Express + Mongoose API
│   ├── models/                 # User, Trip, Booking, Review, Coupon, Lead, Newsletter
│   ├── controllers/            # auth, trip, booking, review, assistant, coupon, admin…
│   ├── routes/                 # auth, trips, bookings, reviews, wishlist,
│   │                           #   contact, admin, newsletter, assistant, coupons
│   ├── middleware/             # auth.js (JWT protect + adminOnly)
│   ├── utils/                  # seeder, mailer, extraTrips
│   └── index.js                # server entry
│
└── client/                     # React + Vite + Tailwind
    ├── src/
    │   ├── components/          # layout (Navbar, Footer, TripCard, AssistantWidget…), admin
    │   ├── context/            # AuthContext (JWT + localStorage)
    │   ├── pages/              # Home, Trips, TripDetail, Design, SplitPay, Auth, Legal…
    │   ├── services/           # api.ts (Axios + JWT interceptor)
    │   └── types/              # shared TypeScript interfaces
    └── vite.config.ts
```

---

## ⚡ Quick Start

```bash
# 1. Install
cd server && npm install
cd ../client && npm install

# 2. Configure env (copy the templates, then fill in your keys)
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Run (two terminals)
cd server && npm run dev     # API  → http://localhost:5000
cd client && npm run dev     # App  → http://localhost:3000

# 4. Seed the catalogue (one-time)
#    open http://localhost:5000/api/seed
```

**Default admin:** `admin@voya.travel` / `voya_admin_2026`

> 🔑 Environment variables are documented in [`server/.env.example`](server/.env.example) and [`client/.env.example`](client/.env.example). Never commit your real `.env` — it's git-ignored.

---

## 🚀 Deployment

Frontend → **Vercel**, backend → **Render**, database → **MongoDB Atlas**.
A full click-by-click walkthrough (with the exact env-var table for each host) lives in **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## 📡 API Reference

<details>
<summary><b>Auth</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register (sends OTP) |
| POST | `/api/auth/verify-otp` | — | Verify email, receive JWT |
| POST | `/api/auth/resend-otp` | — | Resend verification code |
| POST | `/api/auth/login` | — | Login, receive JWT |
| GET | `/api/auth/me` | JWT | Current user + wishlist |
| GET | `/api/auth/referral` | JWT | Referral code, link & wallet |
| PUT | `/api/auth/profile` | JWT | Update profile |
| PUT | `/api/auth/password` | JWT | Change password |
</details>

<details>
<summary><b>Trips</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trips` | — | List (filter / sort / paginate) |
| GET | `/api/trips/:slug` | — | Trip detail |
| GET | `/api/trips/:slug/related` | — | Related trips |
| POST | `/api/trips` | Admin | Create |
| PUT | `/api/trips/:id` | Admin | Update |
| DELETE | `/api/trips/:id` | Admin | Deactivate |

**Query params:** `category`, `continent`, `country`, `difficulty`, `minPrice`, `maxPrice`, `minDays`, `maxDays`, `search`, `featured`, `sort` (`newest`·`popular`·`rating`·`price_asc`·`price_desc`), `page`, `limit`
</details>

<details>
<summary><b>Bookings & Payments</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | JWT | Create booking (coupon, wallet, departure) |
| GET | `/api/bookings/my` | JWT | My bookings |
| PUT | `/api/bookings/:id/cancel` | JWT | Cancel (releases seats) |
| POST | `/api/bookings/:id/create-order` | JWT | Razorpay order |
| POST | `/api/bookings/:id/verify-payment` | JWT | Verify Razorpay signature |
| GET | `/api/bookings/:id/upi-intent` | JWT | UPI intent + QR |
| GET | `/api/bookings/:id/split` | — | Group split status |
| POST | `/api/bookings/:id/split-claim` | — | Mark a share paid |
| GET | `/api/bookings/admin/all` | Admin | All bookings |
| PUT | `/api/bookings/:id/status` | Admin | Confirm / cancel (emails traveller) |
</details>

<details>
<summary><b>AI, Coupons, Reviews, Wishlist, Admin</b></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/assistant/chat` | — | Gemini travel assistant |
| POST | `/api/assistant/design` | — | AI Trip Designer (structured itinerary) |
| GET / POST | `/api/coupons` | mixed | List / create (admin) |
| POST | `/api/coupons/validate` | JWT | Apply a coupon at checkout |
| POST | `/api/reviews` | JWT | Submit review |
| GET | `/api/reviews/trip/:tripId` | — | Trip reviews |
| GET | `/api/wishlist` · POST `/:tripId` | JWT | Get / toggle wishlist |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/leads` | Admin | Contact enquiries |
| GET | `/api/seed` | — | Seed sample data (dev) |
</details>

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `ink` | `#0A0A0A` | Headings, buttons, dark sections |
| `mist` | `#6F6F6F` | Body text, captions |
| `fog` | `#ADADAD` | Placeholders, disabled |
| `cream` | `#FAF9F6` | Page background |
| `amber` | `#C8853A` | Accent, eyebrows, highlights |
| `surface` | `#F4F2EE` | Cards, input backgrounds |

**Type:** `Instrument Serif` (display, italic for emphasis) · `Inter` (body).

---

<div align="center">

**Built with obsessive care.**

© 2026 Voya° Travel

</div>
