-- ============================================================================
--  AyuLean — migration 002
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
