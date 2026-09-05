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
