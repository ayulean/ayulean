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
