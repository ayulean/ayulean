# Angad Ayurveda — Ayurvedic Supplement Store

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
   - [`supabase/migrations/004_customer_accounts.sql`](supabase/migrations/004_customer_accounts.sql) —
     customer accounts, profiles and per-customer order access.
   - [`supabase/migrations/005_order_cancellation.sql`](supabase/migrations/005_order_cancellation.sql) —
     customer-initiated order cancellation.
   - [`supabase/migrations/006_replacement_status.sql`](supabase/migrations/006_replacement_status.sql) —
     replacement status visible to the customer.
   - [`supabase/migrations/007_replacement_tracking.sql`](supabase/migrations/007_replacement_tracking.sql) —
     courier tracking for the replacement shipment.
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
Admin panel: http://localhost:3000/admin — default password **`angad@123`**

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
| `NEXT_PUBLIC_SUPABASE_URL` | Same project URL, readable in the browser (customer accounts) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key. Empty = accounts off, guest checkout stays on |
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
| `/account/login`, `/account/register` | Customer sign-in and sign-up, with Continue with Google |
| `/account` | Profile, saved delivery address and change password |
| `/account/orders` | The customer's own order history |
| `/account/forgot-password` | Sends a password reset link |
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

**Reviews publish immediately.** A customer's review is live on the product page as soon as they
submit it — there is nothing to approve. The admin panel is there to *remove* or *hide* a review, not
to let it through.

The one exception: a review containing a link is held back until you look at it. Review spam is
almost always link spam, and a genuine customer describing a supplement has no reason to paste a
URL. Held reviews appear in their own section in Admin → Reviews, where you can publish or delete
them. The customer is not told their review was flagged — a spammer should not learn where the line
is. Submissions are also rate limited to 3 per IP per hour.

---

## 4. Product images

Go to **Admin → Products → Edit → Upload images**. Files go to the public `product-images`
bucket in Supabase Storage and the main-image and gallery fields fill in automatically.
JPG, PNG, WebP and AVIF up to 5 MB each.

You can still paste a local path instead — put the file in `public/img/` and enter
`/img/bottle.jpg`. The logo lives at `public/img/angad-logo.jpeg`.

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
echo "Angad Ayurveda <orders@yourdomain.in>" | vercel env add ORDER_FROM_EMAIL production
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
  so it shows as "Angad Ayurveda".
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

## 4c. Customer accounts

Powered by Supabase Auth. Email + password and **Continue with Google**, plus forgot-password and
change-password.

**Where sign-in is required.** Browsing, the cart and the wishlist stay open to everyone; the account
is only asked for at **checkout** — the same as Flipkart and Amazon. Forcing sign-up earlier is the
single biggest way to lose a sale. A signed-in customer gets their saved address filled in
automatically, and every order is linked to them so `/account/orders` works.

Guests are not locked out either: while `NEXT_PUBLIC_SUPABASE_ANON_KEY` is empty, accounts are
switched off entirely and checkout stays open to everyone.

### Setting it up

1. **Supabase → Project Settings → API** — copy the Project URL and the **anon / publishable** key
   into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Unlike the service key, these
   two are meant to be public.
2. **Supabase → Authentication → URL Configuration**
   - Site URL: your production URL
   - Redirect URLs: add `<your-url>/auth/callback` **and** `http://localhost:3000/auth/callback`
3. **Continue with Google** — in [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create an *OAuth client ID* of type *Web application*. Add this authorised redirect URI:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Then paste the Client ID and Client Secret into **Supabase → Authentication → Providers → Google**
   and enable it. Nothing needs to change in this codebase.

### Security

Customer pages use the **anon** key, so every query runs under row level security: the policies in
migration 004 let a customer read and edit only their own profile, and read only their own orders.
Nothing else in the database is reachable from a browser.

---

## 4d. Invoices and cancellation

**Invoice.** Every customer can open their own invoice at `/order/<orderNo>/invoice` and print it or
save it as a PDF. Access needs proof of ownership: either they are signed in to the account that
placed the order, or the URL carries the phone number the order was placed with (this is how the
Track Order page links to it). Anyone else gets a polite refusal, not the invoice.

**Cancellation.** A customer can cancel while the order is still `placed`, `confirmed` or
`pending_payment`. Once it is marked **shipped** the button disappears and the API refuses, because
the parcel is already with the courier.

The rule is enforced inside Postgres, not just in the app. `cancel_order()` takes a row lock, checks
the status, and updates in the same transaction — so if a customer taps Cancel at the exact moment
the admin marks the order shipped, one of the two wins cleanly and the other is told what happened.
Cancelling puts the stock and coupon usage back automatically.

Admins can still cancel from any status in the admin panel — a shipped parcel can be recalled by
phone. Cancellations record who did it and why.

**Replacement lifecycle.** A replacement travels back and forth, so it has its own five-step journey
and its own courier details — separate from the original order's:

| Status | Customer sees | You do next |
| --- | --- | --- |
| `open` | Under review | Review and approve or reject |
| `approved` | Approved | Arrange the reverse pickup |
| `picked_up` | Old product picked up | Pack and dispatch the replacement |
| `shipped` | Replacement on the way | Waiting with the courier |
| `delivered` | Replacement delivered | Done |
| `rejected` | Not approved | Closed |

Customers follow it on their order page, on Track Order and under My Orders — with a progress bar,
the replacement's own tracking number, and dispatch/delivery dates. Every status change emails them,
and the shipped mail carries the courier and AWB number.

**The admin page is grouped by what you have to do**, not by date: *Needs your action* (review,
pickup, dispatch), *Replacement on the way*, and *Closed*. If a request is marked shipped without a
tracking number it is flagged, because the customer would otherwise have nothing to follow.

Two note fields are deliberately kept separate: **Internal note** is only ever seen by you, while
**Message to customer** appears on their order page and in the email.

---

## 4e. Payment gateway onboarding (Razorpay & alternatives)

Razorpay declined this website with:

> businesses operating in Ayurvedic supplements falls outside the categories we currently support

That is a **category / underwriting decision**, not a bug in this code. Ayurvedic and nutraceutical
sellers sit in Razorpay's restricted list: they are onboarded, but only through a manual review that
needs licence documents, and the automated first-pass check rejects an application when the website
shows supplement signals with no visible licence or seller information. Nothing you change in the UI
alone will flip that — you have to come back with the documents. **Do not** re-apply describing the
business as something it is not (cosmetics, general merchandise, a "wellness store"). Misdescribing
the business to a payment gateway is a KYC breach: it gets the account frozen after the first
chargeback and the settlements held.

### What the site now shows them

Everything a risk reviewer looks for is rendered from `COMPLIANCE` in [`lib/site.ts`](lib/site.ts),
driven by the `NEXT_PUBLIC_*` variables in [`.env.example`](.env.example). **Fill these in and
redeploy before re-applying** — while they are blank the site displays no licence at all, which is
what triggered the rejection:

| Variable | What goes in it |
| --- | --- |
| `NEXT_PUBLIC_LEGAL_NAME` | The registered entity on the bank account you gave Razorpay. It must match exactly. |
| `NEXT_PUBLIC_FSSAI` | Your 14-digit FSSAI licence as the seller/marketer. |
| `NEXT_PUBLIC_AYUSH_LICENCE` | The AYUSH / State Drug Controller Ayurvedic manufacturing licence. |
| `NEXT_PUBLIC_MANUFACTURER`, `..._ADDRESS`, `..._FSSAI` | Contract manufacturer details as printed on the label. |
| `NEXT_PUBLIC_GSTIN` | Same GSTIN as on the application. |

They appear in the footer, in a **Product & seller information** panel on the product page, and at
the bottom of every policy page. A full **Cancellation & Refund Policy** now lives at
`/policies/refund` — a separate, linked refund policy is a hard requirement on the checklist, and
burying refunds inside the replacement page does not satisfy it.

### The six pages the checklist wants, and where they are

About Us `/about` · Contact Us `/contact` · Terms `/policies/terms` · Privacy `/policies/privacy` ·
Shipping `/policies/shipping` · **Cancellation & Refund `/policies/refund`**. All six are linked from
the footer on every page, which is where the reviewer looks for them.

### Re-applying to Razorpay

Reply on the same support ticket (do not open a fresh application — a second rejection on a new
ticket is harder to overturn) and ask for a **manual review under the nutraceutical / Ayurvedic
category**, attaching:

1. FSSAI licence certificate.
2. AYUSH / Ayurvedic manufacturing licence, plus the manufacturing agreement if it is contract-made.
3. GST certificate and the entity's incorporation or Udyam registration.
4. Clear photographs of the actual product label — front, back and the ingredient panel.
5. The third-party lab test / CoA for a recent batch.
6. A line stating the product is a food supplement making no disease-treatment claim, with a link to
   the disclaimer on the product page.

### If they decline again

Ayurvedic supplements are routinely approved by **Cashfree, PayU, CCAvenue, Easebuzz and PhonePe
Payment Gateway** with the same document set. Cashfree and PayU are the usual fallbacks here.
Whichever you pick, only [`lib/razorpay.ts`](lib/razorpay.ts) and the two `RAZORPAY_*` variables have
to change — the checkout flow, order records and webhook handling around it stay as they are.

Until any gateway is live the site runs COD-only on its own, with no code change: leave
`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` empty.

### Claims are the other half of this

A supplement site is also rejected for claiming to treat something. This repo keeps the product
copy to "supports metabolism / digestion / energy" and carries a not-a-medicine disclaimer. Keep it
that way in the admin panel: no "cure", no "treats obesity", no "guaranteed weight loss", no
before/after photos, no invented customer counts or ratings. Those same words also attract action
under the Drugs and Magic Remedies Act and the CCPA advertising rules, quite apart from the gateway.

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
