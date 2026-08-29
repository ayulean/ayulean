-- ============================================================================
--  AyuLean — migration 003
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
