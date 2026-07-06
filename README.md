# Voya° — Full-Stack MERN Travel Agency

> Curated travel for the soulful wanderer. A production-grade MERN stack travel platform with cinematic UI, full booking system, user dashboard, and admin panel.

---

## 🌍 What's Built

### Frontend (React + TypeScript + Vite + Tailwind)
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Cinematic video hero, featured trips, why Voya, testimonials |
| All Trips | `/trips` | Filterable, searchable, paginated grid with sort |
| Trip Detail | `/trips/:slug` | Full itinerary, booking form, reviews, related trips |
| Destinations | `/destinations` | Visual destination grid |
| About | `/about` | Team, timeline, mission, stats |
| Contact | `/contact` | Form, map, FAQ accordion |
| Login | `/login` | Split-panel auth |
| Register | `/register` | Split-panel auth |
| Dashboard | `/dashboard` | Bookings, wishlist, profile edit |
| Admin | `/admin` | Stats, trip management, booking overview |
| 404 | `*` | Custom not-found page |

### Backend (Node.js + Express + MongoDB)
- **7 models**: User, Trip, Booking, Review, Newsletter
- **Full REST API** with auth, pagination, filtering
- **JWT authentication** with bcrypt password hashing
- **Rich seeder** with 6 fully-detailed trips (Ladakh, Bali, Maldives, Japan, Greece, Rajasthan)
- **Admin-only routes** with role-based access

---

## 🗂️ Folder Structure

```
voya-mern/
├── server/
│   ├── models/          User, Trip, Booking, Review, Newsletter
│   ├── controllers/     authController, tripController, bookingController
│   │                    reviewController, miscControllers
│   ├── routes/          auth, trips, bookings, reviews, wishlist
│   │                    contact, newsletter, admin
│   ├── middleware/       auth.js  (JWT protect + adminOnly)
│   ├── utils/           seeder.js (6 rich sample trips)
│   └── index.js         Express server entry
│
└── client/
    ├── src/
    │   ├── components/layout/   Navbar, Footer, TripCard, VideoBackground
    │   ├── context/            AuthContext (JWT + localStorage)
    │   ├── pages/              All 11 pages
    │   ├── services/           api.ts (Axios + auto-token)
    │   └── types/              Shared TypeScript interfaces
    └── vite.config.ts
```

---

## ⚡ Quick Start

### 1. Install

```bash
# Clone or extract
cd voya-mern

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure Environment

**`server/.env`**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/voya
JWT_SECRET=your_jwt_secret_minimum_32_chars
CLIENT_URL=http://localhost:5173
EMAIL_USER=hello@voya.travel
EMAIL_PASS=your_gmail_app_password
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

### 4. Seed the Database

Visit: `http://localhost:5000/api/seed`

This creates:
- 6 fully-detailed trips (Ladakh, Bali, Maldives, Kyoto/Tokyo, Santorini/Athens, Rajasthan)
- Admin account: `admin@voya.travel` / `voya_admin_2026`

---

## 🔑 Make Yourself Admin

After registering normally:
```js
// MongoDB shell or Compass
db.users.updateOne({ email: "you@email.com" }, { $set: { role: "admin" } })
```
Then visit `/admin` for the admin dashboard.

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd client && npm run build
# Push to GitHub → Import in Vercel
# Set: VITE_API_URL = https://your-render-backend.onrender.com/api
# vercel.json handles SPA routing automatically
```

### Backend → Render
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Add env vars in Render dashboard

### Database → MongoDB Atlas
- Create free M0 cluster
- Add connection string to `MONGO_URI`
- Whitelist `0.0.0.0/0` for Render

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, receive JWT |
| GET | `/api/auth/me` | JWT | Get current user + wishlist |
| PUT | `/api/auth/profile` | JWT | Update name/phone/avatar |
| PUT | `/api/auth/password` | JWT | Change password |
| POST | `/api/auth/forgot-password` | — | Generate reset token |
| PUT | `/api/auth/reset-password/:token` | — | Reset password |

### Trips
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trips` | — | List trips (filter/sort/paginate) |
| GET | `/api/trips/:slug` | — | Trip detail by slug |
| GET | `/api/trips/:slug/related` | — | Related trips |
| POST | `/api/trips` | Admin | Create trip |
| PUT | `/api/trips/:id` | Admin | Update trip |
| DELETE | `/api/trips/:id` | Admin | Deactivate trip |

**Query params for GET /api/trips:**
`category`, `continent`, `country`, `difficulty`, `minPrice`, `maxPrice`, `minDays`, `maxDays`, `search`, `featured`, `sort` (newest/popular/rating/price_asc/price_desc), `page`, `limit`

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | JWT | Create booking |
| GET | `/api/bookings/my` | JWT | User's bookings |
| GET | `/api/bookings/:id` | JWT | Booking detail |
| PUT | `/api/bookings/:id/cancel` | JWT | Cancel booking |
| PUT | `/api/bookings/:id/payment` | JWT | Confirm payment |
| GET | `/api/bookings/admin/all` | Admin | All bookings |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews` | JWT | Submit review |
| GET | `/api/reviews/trip/:tripId` | — | Trip reviews |
| DELETE | `/api/reviews/:id` | JWT | Delete own review |

### Wishlist
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wishlist` | JWT | Get wishlist |
| POST | `/api/wishlist/:tripId` | JWT | Toggle wishlist item |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/seed` | — | Seed sample data (dev only) |

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

**Fonts:**
- Display: `Instrument Serif` (italic for emphasis)
- Body: `Inter` (weights 300–700)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v3 |
| Animation | Framer Motion, CSS `requestAnimationFrame` video loop |
| Routing | React Router DOM v6 |
| HTTP | Axios with JWT interceptor |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 📋 What to Add Next

- [ ] **Razorpay payment** — keys in `.env`, integrate in booking flow
- [ ] **Cloudinary** — image upload for admin trip creation
- [ ] **Nodemailer** — booking confirmation + welcome emails
- [ ] **Google Maps** — embed in contact + trip detail pages
- [ ] **Blog/Journal** — markdown-based travel articles
- [ ] **Coupon codes** — discount system in bookings

---

© 2026 Voya° Travel. Built with obsessive care.
