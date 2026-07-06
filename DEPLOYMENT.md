# Voya° — Deployment Guide

This app has three pieces. Deploy them in this order:

| Piece | What it is | Where to host | Cost |
|-------|-----------|---------------|------|
| **Database** | MongoDB Atlas | Already live (Atlas) | Free tier |
| **Backend** | Express API (`/server`) | **Render** (recommended) | Free |
| **Frontend** | Vite + React (`/client`) | **Vercel** (recommended) | Free |

You need free accounts at: [MongoDB Atlas](https://cloud.mongodb.com), [Render](https://render.com), [Vercel](https://vercel.com), and [GitHub](https://github.com) (both hosts deploy from a Git repo).

---

## Step 0 — Push the code to GitHub

Render and Vercel both deploy from a GitHub repo.

```bash
cd /Users/tanishchhabra/Desktop/voya-mern
git init
git add .
git commit -m "Voya production build"
# create an EMPTY repo on github.com first, then:
git remote add origin https://github.com/<your-username>/voya-mern.git
git branch -M main
git push -u origin main
```

> ⚠️ **Before pushing, confirm `.env` files are git-ignored** (they contain secret keys). Run `git status` — you should NOT see `server/.env` or `client/.env` in the list. If you do, add them to `.gitignore` first. You will re-enter these secrets in the hosting dashboards instead of committing them.

---

## Step 1 — MongoDB Atlas (allow cloud access)

Your app already uses Atlas. One change is needed so Render can reach it:

1. Atlas → **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`). *(Render's IPs are dynamic, so this is required.)*
2. Atlas → **Database → Connect → Drivers** → copy the connection string. This is your `MONGO_URI` for Render.

---

## Step 2 — Backend on Render

1. Render Dashboard → **New → Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
3. **Environment → Add Environment Variables** — copy each key from your local `server/.env`:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | *(Atlas string from Step 1)* |
   | `JWT_SECRET` | *(a long random string)* |
   | `JWT_EXPIRE` | `30d` |
   | `CLIENT_URL` | *(your Vercel URL — fill in after Step 3)* |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | *(from local .env)* |
   | `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | *(from local .env)* |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | *(from local .env)* |
   | `GEMINI_API_KEY` | *(from local .env)* |
   | `UPI_ID` | `vaibhavchhabra2201@oksbi` |
   | `UPI_NAME` | `Voya Travel` |

   *(Do NOT set `PORT` — Render sets it automatically.)*
4. **Create Web Service.** Wait for the first deploy to finish. You'll get a URL like `https://voya-api.onrender.com`.
5. Test it: open `https://voya-api.onrender.com/api/health` — should return `{"status":"Voya API running"}`.
6. **Seed the database** (loads all trips): open `https://voya-api.onrender.com/api/seed` once in your browser.

> 💤 Render free tier sleeps after 15 min idle — the first request after a nap takes ~30s to wake. Fine for launch; upgrade to the $7/mo plan later to keep it always-on.

---

## Step 3 — Frontend on Vercel

1. Vercel Dashboard → **Add New → Project** → import your GitHub repo.
2. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite *(auto-detected)*
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment Variables** — add these three (from your local `client/.env`, but point the API at Render):

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://voya-api.onrender.com/api`  *(your Render URL + `/api`)* |
   | `VITE_GOOGLE_MAPS_API_KEY` | *(from local client/.env)* |
   | `VITE_WHATSAPP_NUMBER` | `918506000066` |

4. **Deploy.** You'll get a URL like `https://voya.vercel.app`.

---

## Step 4 — Connect the two & redeploy

1. Back in **Render → your service → Environment**, set `CLIENT_URL` to your Vercel URL (e.g. `https://voya.vercel.app`). Save → it redeploys.
2. Done. Open your Vercel URL and test: browse trips, log in, make a test booking.

---

## Post-launch checklist

- [ ] **Admin login works** — `admin@voya.travel` / `voya_admin_2026` → visit `/admin`. **Change this password** after first login.
- [ ] **Google Maps** — in Google Cloud Console, add your Vercel domain to the API key's *HTTP referrer* restrictions (else Maps shows a "for development" watermark).
- [ ] **Razorpay** — currently **test keys**. Switch to live keys (`rzp_live_…`) in Render env when you're ready to take real card payments. UPI-to-bank already works live.
- [ ] **Email** — `EMAIL_PASS` must be a Gmail **App Password** (not your login password) for booking confirmation emails to send.
- [ ] **Custom domain** (optional) — add `voya.com` (or similar) in Vercel → Domains, then update `CLIENT_URL` on Render to match.

---

## Quick reference — what each env var powers

| Variable | Powers |
|----------|--------|
| `MONGO_URI` | All data (trips, users, bookings) |
| `JWT_SECRET` | Login/auth tokens |
| `GEMINI_API_KEY` | Voya AI assistant + Trip Designer |
| `RAZORPAY_*` | Card/netbanking checkout |
| `UPI_ID` / `UPI_NAME` | Direct UPI-to-your-bank payments + group split |
| `CLOUDINARY_*` | Admin image uploads |
| `EMAIL_*` | Booking confirmation + admin alert emails |
| `VITE_GOOGLE_MAPS_API_KEY` | Trip location maps |
| `VITE_WHATSAPP_NUMBER` | Floating WhatsApp button |
