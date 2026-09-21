# Arcwave Pilates

A cinematic, dark-themed website for **Arcwave Pilates** — a boutique Pilates studio in Thiruvanmiyur, Chennai. Built with Next.js 16, TypeScript, Tailwind CSS, and Prisma over **MySQL**. Features a fully dynamic admin panel where every price, plan, schedule slot, and piece of site copy can be edited live.

> Tagline: **Find your strength. Find your flow.**
> Sub-tagline: *Mindful movement. Meaningful strength.*

---

## ✨ Features

### Public site (`/`)
- **Cinematic hero** — dark background, noise overlay, animated "Arcwave" wordmark (framer-motion `WordsPullUp`), trial CTA.
- **About / Founder** — Niranjan, internationally certified Pilates expert, 7+ years. Multi-style pull-up heading + scroll-linked per-character text reveal.
- **Features** — 4 staggered entrance cards (cinematic reformer image + 3 content cards).
- **Dynamic Pricing** — membership plans (1/3/6 months × twice/thrice a week) + drop-in daily class. All prices, features, carry-forward, bonus classes come from the database.
- **Booking system** — 4 tabs:
  - **Trial** — captured + Instagram link to confirm (2-snap style).
  - **Daily class** — date picker + available class slots with capacity checks.
  - **Membership** — choose plan, lock weekly recurring slots (calendar-lock), carry-forward classes.
  - **Manage** — look up bookings & memberships by phone, **immediate cancel/reschedule**.
- **Weekly Schedule** — Mon–Sat timetable, 5 slots/day.
- **Studio Gallery** — lightbox-enabled image grid using real studio photos.
- **FAQ** — accordion with the 4 questions from the original brief.
- **Footer** — wordmark, taglines, Instagram, location, subtle Admin link.

### Admin panel (`/admin`) — password-gated
A normal visitor sees only a login form. After signing in, the dashboard gives full CRUD over:
- **Pricing** — create / edit / delete plans; toggle active & featured; edit price, classes/week, total classes, bonus classes, carry-forward, tagline, features, sort order.
- **Bookings** — filter by type & status, search by name/phone/email, change status, delete.
- **Schedule** — add / edit / delete weekly class slots; toggle active; edit capacity inline.
- **Memberships** — view active memberships with locked weekly-slot chips; update usage & status.
- **Settings** — edit all site copy, Instagram link, trial/daily/membership notes, founder info, etc.

All changes go live instantly across the public site — no rebuild required.

---

## 🛠 Tech stack

| Layer | Choice |
|------|--------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS 4** + shadcn/ui (New York) |
| Database | **Prisma ORM** + **MySQL** |
| Animations | **framer-motion** |
| Icons | **lucide-react** |
| Fonts | **Almarai** (300/400/700/800) + **Instrument Serif** (italic accents) |
| Auth | HMAC-signed httpOnly cookie (scrypt-hashed passwords) |

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+ (or Bun)
- A package manager (Bun recommended — this repo uses `bun.lock`)
- **A MySQL 5.7+ / MariaDB 10.2+ database** (local, hosted, or managed)

### 1. Configure the database connection
Copy the example env file and edit it with your real MySQL credentials:
```bash
cp .env.example .env
# then edit .env and set DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/arcwave_pilates
```

Create the database in MySQL first (if it doesn't exist):
```sql
CREATE DATABASE arcwave_pilates CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Install dependencies
```bash
bun install
```

### 3. Push the schema & seed
```bash
# Create all tables from the Prisma schema
bun run db:push

# Seed the database (admin user, 7 pricing plans, weekly schedule, 23 settings)
bun run prisma/seed.ts
```

### 4. Run the dev server
```bash
bun run dev
```

The site runs at `http://localhost:3000`.

### Admin access
After seeding, sign in at `/admin`:
- **Username:** `admin`
- **Password:** `arcwave2024`

> ⚠️ **Change the admin password before deploying.** Edit the password in `prisma/seed.ts` (or create a new admin via the DB) and re-seed. Also set a `SESSION_SECRET` env var for stronger session tokens.

---

## 📊 Membership logic

Implemented exactly per the studio's brief:

| Duration | Frequency | Sessions | Carry-forward | Bonus |
|----------|-----------|----------|---------------|-------|
| 1 month  | Twice / week | 8  | up to 5  | 1 |
| 1 month  | Thrice / week | 12 | up to 5  | 1 |
| 3 months | Twice / week | 24 | up to 15 | 3 |
| 3 months | Thrice / week | 36 | up to 15 | 3 |
| 6 months | Twice / week | 48 | up to 28 | 4 |
| 6 months | Thrice / week | 72 | up to 28 | 4 |
| Drop-in  | —          | 1  | 0          | 0 |

- **Trial** books via Instagram (2-snap confirm).
- **Membership** locks the weekly calendar — the user picks their recurring slots at purchase time.
- **Cancel** is immediate; **reschedule** is instant from the Manage tab.
- **Extra (unused) classes carry forward** up to the plan's limit.

All of the above is editable from `/admin` → Pricing.

---

## 📁 Project structure

```
prisma/
  schema.prisma        # AdminUser, PricingPlan, ClassSlot, Booking, Membership, Setting (MySQL)
  seed.ts              # Seeds admin + 7 plans + weekly schedule + 23 settings
src/
  app/
    page.tsx           # Public landing page (server component)
    admin/page.tsx     # Admin (auth-gated server component)
    api/
      bookings/        # POST create, lookup, manage (cancel/reschedule)
      admin/           # login, logout, session, data, plans, bookings, slots, memberships, settings
  components/
    anim/              # WordsPullUp, WordsPullUpMultiStyle, AnimatedText
    site/              # Hero, About, Features, Pricing, Booking, Schedule, Gallery, FAQ, Footer
    admin/             # AdminLogin, AdminDashboard
    ui/                # shadcn/ui component library
  lib/
    auth.ts            # scrypt hashing + HMAC session tokens
    db.ts              # Prisma client singleton
    site.ts            # settings/plans/slots helpers, formatINR
    booking-store.ts   # zustand store for booking flow
public/images/         # Real Arcwave studio photos + 2 generated cinematic images
```

---

## 🔐 Security notes

- Admin passwords are hashed with **scrypt** (salt + 64-byte key).
- Sessions are **HMAC-signed httpOnly cookies**, 7-day expiry.
- The `/admin` route is a server component that calls `isAdmin()` (cookie verification) before rendering the dashboard — there's no client-only auth gate to bypass.
- Set a `SESSION_SECRET` environment variable in production for unique session tokens.

---

## 📝 Design credits

The dark, cinematic visual language (warm-cream palette, noise textures, pull-up text animations, staggered card entrances) is adapted from a "Prisma" creative-studio design brief. All imagery is Arcwave-Pilates-specific: 6 real studio photos extracted from the original site, plus 2 AI-generated cinematic reformer images for the hero and feature card.

---

## 📄 License

This project was built for Arcwave Pilates. Reuse the code structure freely; the studio photography and branding belong to Arcwave Pilates.
