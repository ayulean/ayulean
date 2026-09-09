-- ============================================================================
--  Angad Ayurveda — complete database setup, in one file
--
--  Run this once in a fresh Supabase project: SQL Editor → New query → paste
--  → Run. It is schema.sql followed by every migration in order, and each
--  piece is idempotent, so running it again is safe.
--
--  Generated from:
--    supabase/schema.sql
--    supabase/migrations/002_features.sql
--    supabase/migrations/003_bundles.sql
--    supabase/migrations/004_customer_accounts.sql
--    supabase/migrations/005_order_cancellation.sql
--    supabase/migrations/006_replacement_status.sql
--    supabase/migrations/007_replacement_tracking.sql
--
--  Keep editing the individual files, not this one — regenerate it instead.
-- ============================================================================


-- ===========================================================================
-- >>> supabase/schema.sql
-- ===========================================================================

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


-- ===========================================================================
-- >>> supabase/migrations/002_features.sql
-- ===========================================================================

-- ============================================================================
--  Angad Ayurveda — migration 002
--  Adds: safe stock release on cancellation, courier tracking, per-customer
--        coupon limits, replacement requests and API rate limiting.
--  Run once in Supabase → SQL Editor. Safe to run more than once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. New columns
-- ----------------------------------------------------------------------------

alter table public.orders add column if not exists stock_reserved  boolean not null default false;
alter table public.orders add column if not exists tracking_number text    not null default '';
alter table public.orders add column if not exists courier         text    not null default '';

alter table public.coupons add column if not exists per_customer_limit integer not null default 0; -- 0 = unlimited

-- Orders placed before this migration already had their stock deducted.
update public.orders set stock_reserved = true
 where stock_reserved = false
   and (payment_method = 'cod' or payment_status = 'paid')
   and status <> 'cancelled';

-- ----------------------------------------------------------------------------
-- 2. Replacement requests
-- ----------------------------------------------------------------------------

create table if not exists public.replacement_requests (
  id         bigint generated always as identity primary key,
  order_no   text        not null,
  name       text        not null,
  phone      text        not null,
  reason     text        not null,
  details    text        not null default '',
  status     text        not null default 'open',   -- open | approved | rejected | completed
  admin_note text        not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_replacement_order on public.replacement_requests(order_no);

-- ----------------------------------------------------------------------------
-- 3. Rate limiting (shared across server instances)
-- ----------------------------------------------------------------------------

create table if not exists public.rate_limits (
  key          text        primary key,
  window_start timestamptz not null default now(),
  hits         integer     not null default 0
);

create or replace function public.bump_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_hits int;
begin
  insert into public.rate_limits as rl (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set hits = case
                 when rl.window_start < now() - make_interval(secs => p_window_seconds) then 1
                 else rl.hits + 1
               end,
        window_start = case
                 when rl.window_start < now() - make_interval(secs => p_window_seconds) then now()
                 else rl.window_start
               end
  returning rl.hits into current_hits;

  return current_hits <= p_limit;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. Stock reservation, now driven by the order row itself
--    Both functions are guarded by orders.stock_reserved, so a retry, a double
--    webhook or a double click can never move stock twice.
-- ----------------------------------------------------------------------------

create or replace function public.reserve_order_stock(p_order_no text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  o    public.orders%rowtype;
  item jsonb;
begin
  select * into o from public.orders where order_no = p_order_no for update;
  if not found or o.stock_reserved then
    return false;
  end if;

  for item in select * from jsonb_array_elements(coalesce(o.items, '[]'::jsonb))
  loop
    update public.products
       set stock = greatest(0, stock - coalesce((item ->> 'qty')::int, 0))
     where id = (item ->> 'productId')::bigint;
  end loop;

  if o.coupon_code <> '' then
    update public.coupons set used_count = used_count + 1 where upper(code) = upper(o.coupon_code);
  end if;

  update public.orders set stock_reserved = true where id = o.id;
  return true;
end;
$$;

create or replace function public.release_order_stock(p_order_no text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  o    public.orders%rowtype;
  item jsonb;
begin
  select * into o from public.orders where order_no = p_order_no for update;
  if not found or not o.stock_reserved then
    return false;
  end if;

  for item in select * from jsonb_array_elements(coalesce(o.items, '[]'::jsonb))
  loop
    update public.products
       set stock = stock + coalesce((item ->> 'qty')::int, 0)
     where id = (item ->> 'productId')::bigint;
  end loop;

  if o.coupon_code <> '' then
    update public.coupons set used_count = greatest(0, used_count - 1) where upper(code) = upper(o.coupon_code);
  end if;

  update public.orders set stock_reserved = false where id = o.id;
  return true;
end;
$$;

-- How many times one phone number has already used a coupon.
create or replace function public.coupon_uses_by_phone(p_code text, p_phone text)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::int
    from public.orders
   where upper(coupon_code) = upper(p_code)
     and right(regexp_replace(phone, '\D', '', 'g'), 10) = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
     and status <> 'cancelled';
$$;

-- ----------------------------------------------------------------------------
-- 5. Security — same lockdown as the base schema
-- ----------------------------------------------------------------------------

alter table public.replacement_requests enable row level security;
alter table public.rate_limits          enable row level security;

revoke all on function public.bump_rate_limit(text, int, int)      from public, anon, authenticated;
revoke all on function public.reserve_order_stock(text)            from public, anon, authenticated;
revoke all on function public.release_order_stock(text)            from public, anon, authenticated;
revoke all on function public.coupon_uses_by_phone(text, text)     from public, anon, authenticated;

grant execute on function public.bump_rate_limit(text, int, int)   to service_role;
grant execute on function public.reserve_order_stock(text)         to service_role;
grant execute on function public.release_order_stock(text)         to service_role;
grant execute on function public.coupon_uses_by_phone(text, text)  to service_role;


-- ===========================================================================
-- >>> supabase/migrations/003_bundles.sql
-- ===========================================================================

-- ============================================================================
--  Angad Ayurveda — migration 003
--  Combo / bundle products: one sellable product made of two or more others.
--  Run once in Supabase → SQL Editor. Safe to run more than once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. What a combo contains
--    [] for a normal product; otherwise [{"productId": 1, "qty": 2}, ...]
-- ----------------------------------------------------------------------------

alter table public.products add column if not exists bundle_items jsonb not null default '[]'::jsonb;

-- ----------------------------------------------------------------------------
-- 2. Stock movement has to see through a combo
--    Selling one "Pack of 3" must remove 3 units of the product inside it, not
--    one unit of the combo. Both functions expand a combo into its components;
--    everything else works exactly as before.
-- ----------------------------------------------------------------------------

create or replace function public.reserve_order_stock(p_order_no text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  o        public.orders%rowtype;
  item     jsonb;
  comp     jsonb;
  bundle   jsonb;
  line_qty int;
begin
  select * into o from public.orders where order_no = p_order_no for update;
  if not found or o.stock_reserved then
    return false;
  end if;

  for item in select * from jsonb_array_elements(coalesce(o.items, '[]'::jsonb))
  loop
    line_qty := coalesce((item ->> 'qty')::int, 0);

    select bundle_items into bundle from public.products where id = (item ->> 'productId')::bigint;

    if bundle is null or jsonb_array_length(bundle) = 0 then
      update public.products
         set stock = greatest(0, stock - line_qty)
       where id = (item ->> 'productId')::bigint;
    else
      for comp in select * from jsonb_array_elements(bundle)
      loop
        update public.products
           set stock = greatest(0, stock - line_qty * coalesce((comp ->> 'qty')::int, 1))
         where id = (comp ->> 'productId')::bigint;
      end loop;
    end if;
  end loop;

  if o.coupon_code <> '' then
    update public.coupons set used_count = used_count + 1 where upper(code) = upper(o.coupon_code);
  end if;

  update public.orders set stock_reserved = true where id = o.id;
  return true;
end;
$$;

create or replace function public.release_order_stock(p_order_no text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  o        public.orders%rowtype;
  item     jsonb;
  comp     jsonb;
  bundle   jsonb;
  line_qty int;
begin
  select * into o from public.orders where order_no = p_order_no for update;
  if not found or not o.stock_reserved then
    return false;
  end if;

  for item in select * from jsonb_array_elements(coalesce(o.items, '[]'::jsonb))
  loop
    line_qty := coalesce((item ->> 'qty')::int, 0);

    select bundle_items into bundle from public.products where id = (item ->> 'productId')::bigint;

    if bundle is null or jsonb_array_length(bundle) = 0 then
      update public.products
         set stock = stock + line_qty
       where id = (item ->> 'productId')::bigint;
    else
      for comp in select * from jsonb_array_elements(bundle)
      loop
        update public.products
           set stock = stock + line_qty * coalesce((comp ->> 'qty')::int, 1)
         where id = (comp ->> 'productId')::bigint;
      end loop;
    end if;
  end loop;

  if o.coupon_code <> '' then
    update public.coupons set used_count = greatest(0, used_count - 1) where upper(code) = upper(o.coupon_code);
  end if;

  update public.orders set stock_reserved = false where id = o.id;
  return true;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Safety net: a combo may not contain another combo.
--    Nested combos would make stock maths ambiguous, so the database refuses
--    them outright rather than trusting the admin form to get it right.
-- ----------------------------------------------------------------------------

create or replace function public.check_bundle_components()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  comp        jsonb;
  nested      int;
  self_ref    boolean;
begin
  if jsonb_array_length(coalesce(new.bundle_items, '[]'::jsonb)) = 0 then
    return new;
  end if;

  for comp in select * from jsonb_array_elements(new.bundle_items)
  loop
    self_ref := (comp ->> 'productId')::bigint = new.id;
    if self_ref then
      raise exception 'A combo cannot contain itself';
    end if;

    select count(*) into nested
      from public.products
     where id = (comp ->> 'productId')::bigint
       and jsonb_array_length(bundle_items) > 0;

    if nested > 0 then
      raise exception 'A combo cannot contain another combo';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists products_check_bundle on public.products;
create trigger products_check_bundle
  before insert or update of bundle_items on public.products
  for each row execute function public.check_bundle_components();

revoke all on function public.check_bundle_components() from public, anon, authenticated;


-- ===========================================================================
-- >>> supabase/migrations/004_customer_accounts.sql
-- ===========================================================================

-- ============================================================================
--  Angad Ayurveda — migration 004
--  Customer accounts: links orders to a signed-in customer and stores the
--  profile details we reuse at checkout.
--  Run once in Supabase → SQL Editor. Safe to run more than once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Orders belong to a customer when one is signed in
--    ON DELETE SET NULL: deleting an account must never delete the order,
--    because we still need it for accounting and for the courier.
-- ----------------------------------------------------------------------------

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_orders_user on public.orders(user_id);

-- ----------------------------------------------------------------------------
-- 2. Customer profile — one row per account, created automatically on sign-up
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  full_name  text        not null default '',
  phone      text        not null default '',
  address    text        not null default '',
  city       text        not null default '',
  state      text        not null default '',
  pincode    text        not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill for anyone who signed up before this migration ran.
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', '')
  from auth.users u
 where not exists (select 1 from public.profiles p where p.id = u.id);

-- ----------------------------------------------------------------------------
-- 3. Security
--    A signed-in customer may read and edit only their own profile, and read
--    only their own orders. Everything else still goes through the server with
--    the service role key.
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile write"  on public.profiles;
drop policy if exists "own profile insert" on public.profiles;

create policy "own profile read"   on public.profiles for select using  (auth.uid() = id);
create policy "own profile write"  on public.profiles for update using  (auth.uid() = id) with check (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "own orders read" on public.orders;
create policy "own orders read" on public.orders for select using (auth.uid() = user_id);


-- ===========================================================================
-- >>> supabase/migrations/005_order_cancellation.sql
-- ===========================================================================

-- ============================================================================
--  Angad Ayurveda — migration 005
--  Customer-initiated order cancellation.
--  Run once in Supabase → SQL Editor. Safe to run more than once.
-- ============================================================================

alter table public.orders add column if not exists cancelled_at   timestamptz;
alter table public.orders add column if not exists cancel_reason  text not null default '';
alter table public.orders add column if not exists cancelled_by   text not null default ''; -- 'customer' | 'admin'

-- ----------------------------------------------------------------------------
--  Cancel in one atomic step.
--
--  The status check lives inside the function, not just in the app, so a
--  customer tapping Cancel at the same moment the admin marks the order shipped
--  cannot slip through. SELECT ... FOR UPDATE locks the row, so exactly one of
--  the two wins and the other sees the updated status.
--
--  Returns: 'cancelled' | 'not_found' | 'too_late' | 'already_cancelled'
-- ----------------------------------------------------------------------------

create or replace function public.cancel_order(
  p_order_no text,
  p_reason   text default '',
  p_by       text default 'customer'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  o public.orders%rowtype;
begin
  select * into o from public.orders where order_no = p_order_no for update;

  if not found then
    return 'not_found';
  end if;

  if o.status = 'cancelled' then
    return 'already_cancelled';
  end if;

  -- Once it is with the courier it is out of our hands.
  if o.status not in ('placed', 'confirmed', 'pending_payment') then
    return 'too_late';
  end if;

  update public.orders
     set status        = 'cancelled',
         cancelled_at  = now(),
         cancel_reason = coalesce(nullif(trim(p_reason), ''), ''),
         cancelled_by  = case when p_by = 'admin' then 'admin' else 'customer' end
   where id = o.id;

  return 'cancelled';
end;
$$;

revoke all on function public.cancel_order(text, text, text) from public, anon, authenticated;
grant execute on function public.cancel_order(text, text, text) to service_role;


-- ===========================================================================
-- >>> supabase/migrations/006_replacement_status.sql
-- ===========================================================================

-- ============================================================================
--  Angad Ayurveda — migration 006
--  Lets the customer see what happened to their replacement request.
--  Run once in Supabase → SQL Editor. Safe to run more than once.
-- ============================================================================

-- admin_note stays internal. customer_message is what the customer actually reads,
-- so the team can keep private notes without worrying about who sees them.
alter table public.replacement_requests
  add column if not exists customer_message text not null default '';

alter table public.replacement_requests
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_replacement_status on public.replacement_requests(status);


-- ===========================================================================
-- >>> supabase/migrations/007_replacement_tracking.sql
-- ===========================================================================

-- ============================================================================
--  Angad Ayurveda — migration 007
--  Gives a replacement its own shipment: courier, tracking number and dates.
--  Run once in Supabase → SQL Editor. Safe to run more than once.
-- ============================================================================

-- The replacement travels separately from the original order, so it needs its
-- own courier details rather than reusing the ones on orders.
alter table public.replacement_requests add column if not exists courier         text not null default '';
alter table public.replacement_requests add column if not exists tracking_number text not null default '';
alter table public.replacement_requests add column if not exists picked_up_at    timestamptz;
alter table public.replacement_requests add column if not exists shipped_at      timestamptz;
alter table public.replacement_requests add column if not exists delivered_at    timestamptz;

-- The old single "completed" status did not say whether the replacement had
-- been sent or actually received. It now maps onto the final "delivered" step.
update public.replacement_requests
   set status = 'delivered',
       delivered_at = coalesce(delivered_at, updated_at)
 where status = 'completed';

