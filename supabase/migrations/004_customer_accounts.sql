-- ============================================================================
--  AyuLean — migration 004
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
