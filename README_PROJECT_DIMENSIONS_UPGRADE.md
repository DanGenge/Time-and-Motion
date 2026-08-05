# Time & Motion Tracker - Project Dimensions Upgrade

Adds an optional Project Dimensions tab so each project can store blast design or study context.

## Files included

- `migration_v5_project_dimensions.sql` - run this in Supabase SQL Editor.
- `dimensions.html` - upload this into the repo root beside `project.html`.
- `nav_patch_project_dimensions.txt` - small edit for `js/auth.js` and `project.html`.
- `export_patch_project_dimensions.txt` - small edit for `export.html`.

## What it adds

- New optional Dimensions tab.
- Blast Design template fields:
  - Blast name
  - Bench / location
  - Burden
  - Spacing
  - Hole depth
  - Hole diameter
  - Number of holes
  - Stemming
  - Subdrill
  - Explosive mass
- Crew Audit template fields.
- Custom fields.
- Calculations:
  - Approx pattern volume BCM
  - Total drilled metres
  - Powder factor kg/BCM
- Export all + dimensions CSV.

## Install order

1. Run `migration_v5_project_dimensions.sql` in Supabase.
2. Upload `dimensions.html` to the GitHub repo root.
3. Apply the nav patch to `js/auth.js` and `project.html`.
4. Apply the export patch to `export.html`.
5. Commit and push to GitHub.
6. Open the GitHub Pages app and test one project.
