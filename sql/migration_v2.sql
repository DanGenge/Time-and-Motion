-- ============================================================================
-- TIME & MOTION TRACKER — Migration v2
-- Adds: activity categories, elements (sub-steps), observed/estimated flag,
--        delay attribution, opportunity tagging, run-level MMU/day/DTH fields.
-- SAFE TO RE-RUN. Additive only — no existing data is deleted.
-- Run in: Supabase Dashboard -> SQL Editor -> New Query -> paste -> Run
-- ============================================================================

-- ---------- 1. STEP TEMPLATES: category, parent (for elements), code ----------
alter table step_templates add column if not exists category_group text
  check (category_group in ('task','customer','orica','other')) default 'task';
alter table step_templates add column if not exists parent_id uuid references step_templates(id) on delete cascade;
alter table step_templates add column if not exists activity_code text;   -- e.g. "7", "22" from your master list
alter table step_templates add column if not exists is_element boolean default false;

-- Keep the old step_type working; widen its allowed values to cover your taxonomy.
-- (task/delay/break were the originals; add the 4 real groups as synonyms.)
do $$
begin
  begin
    alter table step_templates drop constraint if exists step_templates_step_type_check;
  exception when others then null;
  end;
end $$;
alter table step_templates add constraint step_templates_step_type_check
  check (step_type in ('task','delay','break','customer','orica','other'));

-- ---------- 2. STUDY RUNS: MMU count, observation days, DTH tonnes ----------
alter table study_runs add column if not exists mmu_count numeric;         -- e.g. 5 MMUs observed
alter table study_runs add column if not exists observation_days numeric;  -- e.g. 5 days
alter table study_runs add column if not exists dth_tonnes numeric;        -- tonnes Down The Hole
alter table study_runs add column if not exists blast_name text;           -- e.g. RN14_UPG_BL18
alter table study_runs add column if not exists asset_name text;           -- e.g. BM318 (default MMU)

-- ---------- 3. ENTRIES: category, element, observed/estimated, attribution, opportunity ----------
alter table entries add column if not exists category_group text
  check (category_group in ('task','customer','orica','other'));
alter table entries add column if not exists parent_step_name text;        -- parent activity if this is an element
alter table entries add column if not exists element_name text;            -- the element within a task
alter table entries add column if not exists data_quality text
  check (data_quality in ('observed','estimated')) default 'observed';
alter table entries add column if not exists attribution text;             -- who owns a delay (free text / same as category)
alter table entries add column if not exists is_opportunity boolean default false;
alter table entries add column if not exists opportunity_type text
  check (opportunity_type in ('planning','resourcing','other'));
alter table entries add column if not exists mmu_name text;                -- which MMU this entry belongs to
alter table entries add column if not exists blast_name text;              -- blast/shot name
alter table entries add column if not exists dth_tonnes numeric;           -- optional tonnes tagged to entry/day

create index if not exists idx_entries_category on entries(category_group);
create index if not exists idx_entries_mmu on entries(mmu_name);

-- ============================================================================
-- Done. Existing rows keep working; new columns default sensibly.
-- ============================================================================
