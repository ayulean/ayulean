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
