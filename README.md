# AyuLean — Ayurvedic Supplement Store

A single-product e-commerce website (in the style of ayuvya.com), built with Next.js 16
(App Router), TypeScript, Tailwind CSS v4 and Supabase (Postgres). It supports Cash on Delivery
and online payment (Razorpay), a 7-day replacement policy, customer reviews and ratings, and a
full admin panel where you can add more products, prices, discounts and coupons in the future.

---

## 1. Getting started

### Step 1 — create the Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project (the free tier is enough).
2. Open **SQL Editor → New query** and run these two files in order — both are safe to re-run:
   - [`supabase/schema.sql`](supabase/schema.sql) — tables, rating view, stock function, security
     rules, and the seed product plus 2 coupons (`AYULEAN10`, `FLAT100`).
   - [`supabase/migrations/002_features.sql`](supabase/migrations/002_features.sql) — courier
     tracking, stock release on cancellation, per-customer coupon limits, replacement requests and
     API rate limiting.
   - [`supabase/migrations/003_bundles.sql`](supabase/migrations/003_bundles.sql) — combo products.
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
| `RESEND_API_KEY` | Resend key for order emails. Empty = emails are only logged |
| `ORDER_FROM_EMAIL` | Sender address — **must be on a domain verified in Resend** |
| `ORDER_REPLY_TO` | Where customer replies go — a Gmail address is fine here |
| `ORDER_NOTIFY_EMAIL` | Where new-order alerts are sent to you |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for the sitemap, canonical links and OG tags |
| `NEXT_PUBLIC_GSTIN` | Your GSTIN, printed on invoices |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 ID. Empty = analytics never loads |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel ID. Empty = pixel never loads |

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
| `/wishlist` | Saved products (kept in the browser) |
| `/replacement` | 7-day replacement request form |
| `/about`, `/contact` | Brand info and contact (Sector 13 Karnal, +91 7082042004) |
| `/policies/replacement` | 7-Day Replacement Policy |
| `/policies/shipping`, `/policies/privacy`, `/policies/terms` | Other policies |

### Admin panel (`/admin`)

| Page | What you can do |
| --- | --- |
| Dashboard | Orders, revenue, COD vs online split, stock alerts |
| Products | Add a product — name, description, benefits, ingredients, MRP, price (discount % is automatic), stock, images, live/hidden |
| Combos | Turn any product into a combo by listing the products inside it (Products → Edit → Combo contents) |
| Coupons | Create percent or flat discount coupons — minimum order, max discount cap, expiry date, usage limit |
| Orders | Full order details, status updates (placed → confirmed → shipped → delivered), WhatsApp link |
| Reviews | Approve, hide or delete customer reviews, or add one yourself |
| Replacements | Customer replacement requests with status and internal notes |
| Invoice | A printable GST invoice per order (Orders → Print invoice) |

**Note:** a review submitted by a customer stays *pending* and appears on the website only after
an admin approves it (this keeps spam out).

---

## 4. Product images

Go to **Admin → Products → Edit → Upload images**. Files go to the public `product-images`
bucket in Supabase Storage and the main-image and gallery fields fill in automatically.
JPG, PNG, WebP and AVIF up to 5 MB each.

You can still paste a local path instead — put the file in `public/img/` and enter
`/img/bottle.jpg`. The logo lives at `public/img/logo.jpeg`.

---

## 4a. Order emails

Order confirmations (to the customer), new-order alerts (to you) and shipping updates all go out
through [Resend](https://resend.com). Set `RESEND_API_KEY` and `ORDER_NOTIFY_EMAIL` to switch them
on — until then every email is written to the server console instead, so nothing breaks.

### Finishing the Resend setup (pending — needs a domain)

Marketplace terms are already accepted for the `ayuleanveda-6902` team. The install stops at one
step because Resend needs a sending domain up front:

```
Error: Missing required metadata: domain, region.
```

Once you own a domain, run this from the project root:

```bash
vercel integration add resend/resend-email -m domain=yourdomain.in -m region=us-east-1 --format=json
vercel env pull --yes          # pulls the provisioned RESEND_API_KEY
```

Then in the Resend dashboard, copy the DKIM/SPF records it shows and add them at your domain
registrar. When the domain shows **Verified**, set the sender and redeploy:

```bash
vercel env rm ORDER_FROM_EMAIL production --yes
echo "AyuLean <orders@yourdomain.in>" | vercel env add ORDER_FROM_EMAIL production
vercel --prod
```

Until then the app runs fine: every email is written to the server log instead of being sent, and
no order or checkout is affected.

### About the sender address

Email providers only let you send **from** a domain you control and have authenticated with DKIM
and SPF records. That means a `gmail.com` address cannot be the sender — Gmail's own servers would
reject it as spoofing. So:

- `ORDER_FROM_EMAIL` must be on a domain verified in Resend (e.g. `orders@ayulean.in`). Until you
  have one, keep Resend's test sender `onboarding@resend.dev` — the display name is still yours,
  so it shows as "AyuLean".
- `ORDER_REPLY_TO` is set to `ayuleanveda@gmail.com`, so when a customer hits Reply the message
  lands in that Gmail inbox regardless of the technical sender.
- `ORDER_NOTIFY_EMAIL` is also `ayuleanveda@gmail.com` — every new order alert goes there.

**Important limit while using the test sender:** Resend only delivers to the email address that
owns the account. So new-order alerts to `ayuleanveda@gmail.com` will arrive, but customer
confirmation emails will not go out until you verify a domain (Resend → Domains → Add domain, then
add the DNS records at your registrar).

---

## 4b. Combo products

Any product can be turned into a combo. In **Admin → Products → Edit → Combo contents**, add the
products it contains and how many of each. Leave it empty for a normal product.

A combo keeps **no stock of its own**. How many you can sell is worked out from the components — if
a "Pack of 3" needs 3 bottles and 10 bottles are left, 3 combos are available. Selling one combo
removes 3 bottles, and cancelling that order puts all 3 back. The product page shows what is inside
and how much the customer saves against buying the items separately.

### Multipacks (2, 3, 4… of the same product)

A pack is just a combo with one component. The fastest route is **Admin → Products → Create pack**
next to any product — it opens a prefilled draft named "… — Pack of 3", with the MRP already set to
what 3 would cost separately. Change the pack size with the Pack of 2 / 3 / 4 / 6 / 12 buttons, then
lower the price so the customer has a reason to buy the pack.

**If you only want to sell packs and never the single unit**, add the single item once and save it
with **"Show live on the website" unchecked**. It stays out of the shop and acts purely as the stock
item every pack draws from — so all your inventory lives in one place instead of being split across
"Pack of 2", "Pack of 3" and so on. Hidden products are marked `(hidden — stock item)` in the combo
picker.

Two rules are enforced by the database itself, not just the form: a combo cannot contain another
combo, and it cannot contain itself. Deleting a product that a combo depends on is blocked with a
message naming the combo.

---

## 5. How the money is calculated

- Shipping: free above ₹499, otherwise ₹49 (change this in `lib/site.ts`).
- Coupons can be percent or flat, with an optional maximum discount cap.
- **All prices are recalculated on the server from the database** — values sent by the browser
  are never trusted, so prices cannot be tampered with.
- COD orders are confirmed immediately; online orders are confirmed only after the Razorpay
  signature is verified (`app/api/payments/verify/route.ts`).
- Stock and coupon usage are updated through the `reserve_order_stock` / `release_order_stock`
  Postgres functions. Both are guarded by `orders.stock_reserved`, so a retry, a double click or a
  duplicate webhook can never move stock twice — and cancelling an order puts the stock back.
- Coupons support a global usage limit *and* a per-customer limit, checked against the phone number.
- The order, review and replacement endpoints are rate limited per IP through Postgres, so the limit
  holds across server instances.

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
lib/notify.ts      → order emails (Resend)
lib/storage.ts     → product image uploads (Supabase Storage)
lib/ratelimit.ts   → Postgres-backed rate limiting
tests/             → vitest unit tests (npm test)
supabase/          → schema.sql + migrations/
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
- Set `NEXT_PUBLIC_SITE_URL` to your real domain so the sitemap and OG tags are correct.
- Turn on Point-in-Time Recovery or scheduled backups in Supabase (free projects also pause after a
  week of inactivity — open the dashboard to wake one up).

---

## 9. Testing

```bash
npm test          # run once
npm run test:watch
npm run build     # type-check + production build
npx eslint .      # lint
```
