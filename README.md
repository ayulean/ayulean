# AyuLean — Ayurvedic Supplement Store

A single-product e-commerce website (in the style of ayuvya.com), built with Next.js 16
(App Router), TypeScript, Tailwind CSS v4 and Supabase (Postgres). It supports Cash on Delivery
and online payment (Razorpay), a 7-day replacement policy, customer reviews and ratings, and a
full admin panel where you can add more products, prices, discounts and coupons in the future.

---

## 1. Getting started

### Step 1 — create the Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project (the free tier is enough).
2. Open **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql)
   and hit **Run**. This creates every table, the rating view, the stock function and the security
   rules, and seeds the "Ayurvedic Supplement" product with 5 sample reviews and 2 coupons
   (`AYULEAN10`, `FLAT100`). The script is safe to run more than once.
3. Go to **Project Settings → API** and copy the **Project URL** and the **`service_role`** key.

### Step 2 — run the app

Put those two values in `.env.local`:

```bash
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

Then:

```bash
npm install
npm run dev
```

Website: http://localhost:3000
Admin panel: http://localhost:3000/admin — default password **`ayulean@123`**

Until the Supabase keys are filled in, every page shows a short setup screen instead of the store.

Production build:

```bash
npm run build
npm start
```

---

## 2. Environment variables

Set these in `.env.local` (already created) — `.env.example` is the reference:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase Project URL (Project Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` key — **server-only, never commit it** |
| `ADMIN_PASSWORD` | Password for the admin panel |
| `ADMIN_SECRET` | Signs the admin session cookie — use a long random string in production |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (for online payment) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |

**To turn on online payment:** generate keys from dashboard.razorpay.com → Settings → API Keys,
put them in `.env.local` and restart the server. While the keys are empty, the site
automatically runs in **COD-only mode** (checkout shows only Cash on Delivery).

---

## 3. Site structure

| Page | What it is |
| --- | --- |
| `/` | Home — hero, trust bar, product, benefits, reviews, replacement guarantee, FAQ |
| `/products` | Listing of all products |
| `/product/[slug]` | Product detail — gallery, price, benefits, ingredients, reviews + review form |
| `/cart` | Shopping cart (persists in the browser) |
| `/checkout` | Address form, coupon, Cash on Delivery or online payment |
| `/order/[orderNo]` | Order confirmation |
| `/track` | Order tracking by order number + mobile number |
| `/about`, `/contact` | Brand info and contact (Sector 13 Karnal, +91 7082042004) |
| `/policies/replacement` | 7-Day Replacement Policy |
| `/policies/shipping`, `/policies/privacy`, `/policies/terms` | Other policies |

### Admin panel (`/admin`)

| Page | What you can do |
| --- | --- |
| Dashboard | Orders, revenue, COD vs online split, stock alerts |
| Products | Add a product — name, description, benefits, ingredients, MRP, price (discount % is automatic), stock, images, live/hidden |
| Coupons | Create percent or flat discount coupons — minimum order, max discount cap, expiry date, usage limit |
| Orders | Full order details, status updates (placed → confirmed → shipped → delivered), WhatsApp link |
| Reviews | Approve, hide or delete customer reviews, or add one yourself |

**Note:** a review submitted by a customer stays *pending* and appears on the website only after
an admin approves it (this keeps spam out).

---

## 4. Changing product images

1. Put your image file in the `public/img/` folder (for example `public/img/bottle.jpg`).
2. Go to Admin → Products → Edit and enter `/img/bottle.jpg` under **Main image**.
3. In the gallery box, add one image path per line.

The logo lives at `public/img/logo.jpeg` (the original copy is also kept in `img/logo.jpeg`).

---

## 5. How the money is calculated

- Shipping: free above ₹499, otherwise ₹49 (change this in `lib/site.ts`).
- Coupons can be percent or flat, with an optional maximum discount cap.
- **All prices are recalculated on the server from the database** — values sent by the browser
  are never trusted, so prices cannot be tampered with.
- COD orders are confirmed immediately; online orders are confirmed only after the Razorpay
  signature is verified (`app/api/payments/verify/route.ts`).
- Stock and coupon usage are updated through the `reserve_stock_and_coupon` Postgres function, so
  both change together in one transaction and can never drift apart.

---

## 6. Where the code lives

```
app/(store)/      → customer-facing pages
app/admin/        → admin panel (login + protected pages)
app/api/          → orders, payments, coupon and reviews APIs
components/       → header, footer, cart, product UI, admin forms
lib/site.ts        → brand name, phone, address, shipping rules — edit this first
lib/supabase.ts    → server-side Supabase client
lib/queries.ts     → all read queries
lib/actions.ts     → admin server actions
supabase/schema.sql → tables, view, stock function, security rules and seed data
```

---

## 7. Security notes

- Every table has **row level security enabled with no policies**. The `anon` key can therefore read
  nothing at all — the database is only reachable through the server using the `service_role` key.
- `lib/supabase.ts` is imported only from Server Components, Server Actions and API routes, so the
  service key never reaches the browser.
- `.env*` is git-ignored. If the service key is ever exposed, rotate it from Project Settings → API.

---

## 8. Before you deploy

Because the data lives in Supabase, this app deploys cleanly to Vercel, Railway, a VPS — anywhere.

Set the same environment variables on your host, then make sure you:
- Change `ADMIN_PASSWORD` and generate a long random `ADMIN_SECRET`.
- Add your **live** Razorpay keys.
- Update the support email in `lib/site.ts` (currently the placeholder `support@ayulean.in`).
- Turn on Point-in-Time Recovery or scheduled backups in Supabase (free projects also pause after a
  week of inactivity — open the dashboard to wake one up).
