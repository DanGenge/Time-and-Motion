-- ============================================================================
-- TIME & MOTION TRACKER — Supabase schema
-- Run this entire file once in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES  (one row per authenticated user, holds display name)
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text,
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. PROJECTS
-- ----------------------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 3. PROJECT MEMBERS  (controls private access — only members can see a project)
-- ----------------------------------------------------------------------------
create table if not exists project_members (
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz default now(),
  primary key (project_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 4. STEP TEMPLATES  (the "task / delay / break" building blocks per project)
-- ----------------------------------------------------------------------------
create table if not exists step_templates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  step_type text not null check (step_type in ('task','delay','break')),
  category text,
  sort_order int default 0,
  target_seconds numeric,           -- optional standard/expected time, for efficiency %
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 5. STUDY RUNS  (an observation session: e.g. a shift, a cycle study, a truck run)
-- ----------------------------------------------------------------------------
create table if not exists study_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  run_name text not null,
  location text,
  equipment text,
  started_by uuid references auth.users(id),
  started_by_name text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  status text default 'active' check (status in ('active','completed'))
);

-- ----------------------------------------------------------------------------
-- 6. ENTRIES  (the actual recorded data points — the granular data)
-- ----------------------------------------------------------------------------
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references study_runs(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  step_template_id uuid references step_templates(id) on delete set null,
  step_name text not null,
  step_type text not null,
  cycle_number int default 1,
  recorded_by uuid references auth.users(id),
  recorded_by_name text,
  start_time timestamptz,
  end_time timestamptz,
  duration_seconds numeric,
  entry_method text default 'stopwatch' check (entry_method in ('stopwatch','manual','skip')),
  skipped boolean default false,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_entries_run on entries(run_id);
create index if not exists idx_entries_project on entries(project_id);
create index if not exists idx_entries_step on entries(step_template_id);

-- ----------------------------------------------------------------------------
-- 7. PROJECT PRESENCE (fallback table; live presence uses Realtime, this is backup)
-- ----------------------------------------------------------------------------
create table if not exists project_presence (
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  display_name text,
  last_seen timestamptz default now(),
  current_run_id uuid references study_runs(id),
  primary key (project_id, user_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY — makes projects private to their members only
-- ============================================================================
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table step_templates enable row level security;
alter table study_runs enable row level security;
alter table entries enable row level security;
alter table project_presence enable row level security;

-- Helper: is the current user a member of a given project?
create or replace function public.is_project_member(p_project_id uuid)
returns boolean as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- profiles: everyone can read display names (needed to show "who's online" etc.)
drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select using (true);
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- projects: members can see; any authenticated user can create (becomes owner)
drop policy if exists "projects_select_members" on projects;
create policy "projects_select_members" on projects for select
  using (is_project_member(id));
drop policy if exists "projects_insert_auth" on projects;
create policy "projects_insert_auth" on projects for insert
  with check (auth.uid() = owner_id);
drop policy if exists "projects_update_owner" on projects;
create policy "projects_update_owner" on projects for update
  using (auth.uid() = owner_id);

-- project_members: members can see the member list of their own projects
drop policy if exists "members_select" on project_members;
create policy "members_select" on project_members for select
  using (is_project_member(project_id));
drop policy if exists "members_insert" on project_members;
create policy "members_insert" on project_members for insert
  with check (auth.uid() = user_id or is_project_member(project_id));
drop policy if exists "members_delete" on project_members;
create policy "members_delete" on project_members for delete
  using (is_project_member(project_id));

-- step_templates / study_runs / entries / presence: members only, full CRUD
drop policy if exists "templates_all" on step_templates;
create policy "templates_all" on step_templates for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));

drop policy if exists "runs_all" on study_runs;
create policy "runs_all" on study_runs for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));

drop policy if exists "entries_all" on entries;
create policy "entries_all" on entries for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));

drop policy if exists "presence_all" on project_presence;
create policy "presence_all" on project_presence for all
  using (is_project_member(project_id)) with check (is_project_member(project_id));

-- ============================================================================
-- Convenience: automatically add the creator of a project as its "owner" member
-- ============================================================================
create or replace function public.handle_new_project()
returns trigger as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_project_created on projects;
create trigger on_project_created
  after insert on projects
  for each row execute procedure public.handle_new_project();

-- ============================================================================
-- Done. Next: Project Settings -> API -> copy your Project URL + anon key
-- into js/config.js in the web app.
-- ============================================================================
