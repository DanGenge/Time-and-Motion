-- ============================================================================
-- TIME & MOTION TRACKER - Migration v5
-- Adds optional Project Dimensions fields per project.
-- Examples: blast design burden, spacing, hole depth, hole diameter, hole count.
-- SAFE TO RE-RUN. Additive only.
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> paste -> Run
-- ============================================================================

create table if not exists project_dimensions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  template_name text default 'Custom',
  field_key text not null,
  field_label text not null,
  field_type text not null default 'number'
    check (field_type in ('text','number','date','select')),
  field_unit text,
  field_value text,
  sort_order int default 0,
  is_calculated boolean default false,
  formula_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, field_key)
);

alter table project_dimensions enable row level security;

drop policy if exists "project_dimensions_all" on project_dimensions;
create policy "project_dimensions_all" on project_dimensions for all
  using (is_project_member(project_id))
  with check (is_project_member(project_id));

create index if not exists idx_project_dimensions_project on project_dimensions(project_id);
create index if not exists idx_project_dimensions_order on project_dimensions(project_id, sort_order);

create or replace function public.touch_project_dimensions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_project_dimensions_updated_at on project_dimensions;
create trigger trg_project_dimensions_updated_at
  before update on project_dimensions
  for each row execute procedure public.touch_project_dimensions_updated_at();

-- ============================================================================
-- Done.
-- ============================================================================
