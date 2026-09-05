-- ============================================================================
--  Angad Ayurveda — Supabase schema, security rules and seed data
--  Run this once in Supabase → SQL Editor → New query → Run.
--  It is safe to run more than once (everything is IF NOT EXISTS / idempotent).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------------------

create table if not exists public.products (
  id           bigint generated always as identity primary key,
  slug         text        not null unique,
  name         text        not null,
  subtitle     text        not null default '',
  description  text        not null default '',
  benefits     jsonb       not null default '[]'::jsonb,
  ingredients  text        not null default '',
  how_to_use   text        not null default '',
  mrp          integer     not null default 0,
  price        integer     not null default 0,
  image        text        not null default '/img/product-1.svg',
  gallery      jsonb       not null default '[]'::jsonb,
  stock        integer     not null default 100,
  active       boolean     not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.coupons (
  id           bigint generated always as identity primary key,
  code         text        not null unique,
  type         text        not null default 'percent' check (type in ('percent', 'flat')),
  value        integer     not null default 0,
  min_order    integer     not null default 0,
  max_discount integer     not null default 0,   -- 0 = no cap
  expires_at   date,
  usage_limit  integer     not null default 0,   -- 0 = unlimited
  used_count   integer     not null default 0,
  active       boolean     not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.reviews (
  id         bigint generated always as identity primary key,
  product_id bigint      not null references public.products(id) on delete cascade,
  name       text        not null,
  email      text        not null default '',
  rating     integer     not null check (rating between 1 and 5),
  title      text        not null default '',
  body       text        not null default '',
  approved   boolean     not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id                  bigint generated always as identity primary key,
  order_no            text        not null unique,
  customer_name       text        not null,
  phone               text        not null,
  email               text        not null default '',
  address             text        not null,
  city                text        not null,
  state               text        not null,
  pincode             text        not null,
  items               jsonb       not null default '[]'::jsonb,
  subtotal            integer     not null default 0,
  discount            integer     not null default 0,
  coupon_code         text        not null default '',
  shipping            integer     not null default 0,
  total               integer     not null default 0,
  payment_method      text        not null default 'cod'     check (payment_method in ('cod', 'online')),
  payment_status      text        not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  razorpay_order_id   text        not null default '',
  razorpay_payment_id text        not null default '',
  status              text        not null default 'placed',
  notes               text        not null default '',
  created_at          timestamptz not null default now()
);

create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_orders_phone    on public.orders(phone);
create index if not exists idx_orders_created  on public.orders(created_at desc);

-- ----------------------------------------------------------------------------
-- 2. Rating stats view (review count + average per product)
-- ----------------------------------------------------------------------------

create or replace view public.product_stats as
select
  p.id                                                              as product_id,
  count(r.id) filter (where r.approved)                             as review_count,
  coalesce(avg(r.rating) filter (where r.approved), 0)::numeric(3,2) as avg_rating
from public.products p
left join public.reviews r on r.product_id = p.id
group by p.id;

-- ----------------------------------------------------------------------------
-- 3. Atomic stock + coupon reservation
--    Called once an order is confirmed (COD immediately, online after payment
--    verification). Runs as a single transaction so stock can never drift.
-- ----------------------------------------------------------------------------

create or replace function public.reserve_stock_and_coupon(p_items jsonb, p_coupon text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
begin
  for item in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    update public.products
       set stock = greatest(0, stock - coalesce((item ->> 'qty')::int, 0))
     where id = (item ->> 'productId')::bigint;
  end loop;

  if p_coupon is not null and p_coupon <> '' then
    update public.coupons
       set used_count = used_count + 1
     where upper(code) = upper(p_coupon);
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. Security — every table is locked down.
--    The app talks to Supabase only from the server using the service_role key,
--    which bypasses RLS. With RLS on and no policies, the public anon key can
--    read nothing, so a browser can never touch this data directly.
-- ----------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.coupons  enable row level security;
alter table public.reviews  enable row level security;
alter table public.orders   enable row level security;

revoke all on public.product_stats from anon, authenticated;
revoke all on function public.reserve_stock_and_coupon(jsonb, text) from public, anon, authenticated;
grant  execute on function public.reserve_stock_and_coupon(jsonb, text) to service_role;

-- ----------------------------------------------------------------------------
-- 5. Seed data — the starting product, its reviews and two coupons.
--    Skipped automatically if the product already exists.
-- ----------------------------------------------------------------------------

insert into public.products
  (slug, name, subtitle, description, benefits, ingredients, how_to_use, mrp, price, image, gallery, stock, active)
values (
  'ayurvedic-supplement',
  'Ayurvedic Supplement',
  '100% herbal formula for metabolism, digestion & daily energy',
  E'Angad Ayurveda''s Ayurvedic Supplement is a classical Ayurvedic formulation built for today''s busy lifestyle. It brings together a balanced blend of time-tested herbs — Garcinia, Green Tea, Triphala, Guggul and Ginger — that support your metabolism, improve digestion and keep your energy steady through the day.\n\nEvery batch is manufactured in a GMP-certified facility and tested by a third-party lab. No added sugar, no preservatives, 100% vegetarian.',
  '["Naturally supports a healthy metabolism","Improves digestion and gut health","Helps reduce bloating and heaviness","Sustained energy all day, with no crash","100% vegetarian, no added sugar, no preservatives","GMP certified facility, third-party lab tested"]'::jsonb,
  'Garcinia Cambogia (500mg), Green Tea Extract (200mg), Triphala (150mg), Guggul (100mg), Ginger Extract (50mg), Black Pepper Extract (5mg)',
  'Take 1 capsule in the morning and 1 capsule in the evening, 30 minutes before meals, with lukewarm water. For best results, use consistently for 90 days.',
  1499,
  899,
  '/img/product-1.svg',
  '["/img/product-1.svg","/img/product-2.svg","/img/product-3.svg"]'::jsonb,
  250,
  true
)
on conflict (slug) do nothing;

-- No sample reviews are seeded. Publishing invented reviews is misleading and, in
-- India, actionable under consumer-protection rules. Add real ones from the
-- admin panel (Reviews → "Add a review yourself") as customers send them in.

insert into public.coupons (code, type, value, min_order, max_discount, usage_limit, active)
values ('AYULEAN10', 'percent', 10, 499, 200, 0, true),
       ('FLAT100',   'flat',   100, 799,   0, 0, true)
on conflict (code) do nothing;
