-- ============================================================================
-- TIME & MOTION TRACKER — Migration v4
-- Editable + custom CATEGORIES (badges). The 4 built-ins stay as the
-- reporting backbone (task/customer/orica/other); custom categories
-- (e.g. Glencore, Dyno) each map to one of those 4 so Reports keeps working.
-- SAFE TO RE-RUN. Additive only.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query -> paste -> Run
-- ============================================================================

-- 1. CATEGORIES table (per project)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  label text not null,                    -- what shows on the badge, e.g. "Glencore"
  color text not null default '#0093D1',  -- hex colour of the badge
  report_group text not null default 'customer'
    check (report_group in ('task','customer','orica','other')),
  is_builtin boolean default false,       -- the original 4 (label/colour editable, not deletable)
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table categories enable row level security;
drop policy if exists "categories_all" on categories;
create policy "categories_all" on categories for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));

create index if not exists idx_categories_project on categories(project_id);

-- 2. Link activities to a chosen category (nullable; falls back to report group)
alter table step_templates add column if not exists category_id uuid references categories(id) on delete set null;

-- 3. Snapshot the badge on each entry so history keeps its look even if a
--    category is later renamed/recoloured/deleted.
alter table entries add column if not exists category_label text;
alter table entries add column if not exists category_color text;

-- Done. The app seeds the 4 built-in categories automatically on first load.
-- ============================================================================
