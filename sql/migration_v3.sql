-- ============================================================================
-- TIME & MOTION TRACKER — Migration v3
-- Adds user-created BUCKETS (e.g. MMU, On-bench) to group & order activities.
-- SAFE TO RE-RUN. Additive only.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query -> paste -> Run
-- ============================================================================

-- 1. BUCKETS table
create table if not exists buckets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 2. Link activities to a bucket (nullable = "Unsorted")
alter table step_templates add column if not exists bucket_id uuid references buckets(id) on delete set null;

-- 3. RLS: members of the project can do everything with its buckets
alter table buckets enable row level security;
drop policy if exists "buckets_all" on buckets;
create policy "buckets_all" on buckets for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));

create index if not exists idx_buckets_project on buckets(project_id);
create index if not exists idx_steptemplates_bucket on step_templates(bucket_id);

-- Done. Existing activities have bucket_id = null and appear under "Unsorted".
-- ============================================================================
