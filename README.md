# Time & Motion Tracker

A private, multi-user web app for running time & motion studies from a PC, tablet or iPhone browser — no app install needed.

## What it does

| Page | Purpose |
|---|---|
| **index.html** | Sign in / create account, see only the projects you've been added to (private) |
| **project.html** | Project home — members, and start/resume observation "runs" |
| **templates.html** | Build your library of steps (Task / Delay / Break) per project, with optional target/standard times, reorderable |
| **tracker.html** | The stopwatch screen — Start/Stop timer, Skip, or Manual time entry per step. Auto-refreshes every 5s (+ manual "Sync now"), shows who else is online live, supports repeating "cycles" |
| **reports.html** | Summary & efficiency table, a flexible pivot-table/chart builder (bar, stacked bar, line, pie, doughnut, scatter), and a cycle/time trend chart |
| **export.html** | Filterable, fully granular CSV export (every recorded data point) plus summary/runs/templates exports |

## Tech stack (matches what you already use)

- **Frontend:** plain HTML/CSS/JS — no build step, no npm install required. Runs identically on desktop, tablet and iPhone Safari/Chrome.
- **Backend:** [Supabase](https://supabase.com) (Postgres + Auth + Realtime Presence) — private projects are enforced with Row Level Security, not just app-level checks.
- **Hosting:** static files — deploy the same way you just set up for your trading app (GitHub → Netlify).

---

## Setup — Step by step

### 1. Create/choose a Supabase project

You mentioned you'd exhausted your Supabase free-tier project count. Two options:

- **Reuse an existing Supabase project** (recommended if you're at the 2-project free-tier limit): this app only needs a handful of new tables — it does *not* need its own dedicated project. Just run the schema below in that project's SQL editor; the table names (`projects`, `entries`, `step_templates` etc.) are namespaced enough not to clash with a trading-app schema.
- **Or create a new free project** if you have room / are open to the paid tier ($25/mo Pro if you need more than 2 active projects).

### 2. Run the database schema

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of `sql/schema.sql` and click **Run**.
3. This creates all tables, enables Row Level Security, and sets up the policies that keep each project private to its members.

### 3. Get your API keys

Supabase Dashboard → **Project Settings → API**:
- Copy the **Project URL**
- Copy the **anon public** key (⚠️ not the `service_role` key — that one must never go in frontend code)

### 4. Configure the app

Edit `js/config.js`:

```js
window.APP_CONFIG = {
  SUPABASE_URL: "https://your-project.supabase.co",
  SUPABASE_ANON_KEY: "your-anon-key-here",
  AUTO_REFRESH_MS: 5000
};
```

### 5. Deploy (GitHub → Netlify, same as your trading app)

```bash
# from inside the timemotion-tracker folder
git init
git add .
git commit -m "Time and motion tracker"
git branch -M main
git remote add origin https://github.com/DanGenge/timemotion-tracker.git
git push -u origin main
```

Then in Netlify: **Add new site → Import an existing project → GitHub → timemotion-tracker**.
Leave build command blank, publish directory = `/` (root) — it's static HTML, nothing to build.

Once deployed you'll get a URL like `https://timemotion-tracker.netlify.app` that works on your iPhone, tablet, and any PC.

### 6. Enable email auth in Supabase (usually on by default)

Supabase Dashboard → **Authentication → Providers** → make sure **Email** is enabled.
For field use where you don't want email-confirmation friction: **Authentication → Settings** → turn OFF "Confirm email" so people can sign up and start using it immediately with just email + password.

---

## Using it day-to-day

1. **Sign up** — each user creates an account (email + password + a display name that teammates will see).
2. **Create a project** — e.g. "Moolarben Blast Crew — Loading Cycle Study". You're automatically the owner.
3. **Add members** by email (they need to have signed up first) — this is what keeps the project private; only members can see or add data.
4. **Build your step templates** — add every Task, Delay and Break you want to measure (e.g. "Position truck", "Waiting on shovel", "Crib break"), optionally with a target/standard time for efficiency scoring, and reorder them.
5. **Start a run** on the Project page (e.g. "Day shift 03 Aug — Truck 14") — this is one observation session. Multiple people can join and record against the *same* run simultaneously — you'll see each other listed as "online now" and each other's entries appear within 5 seconds (or hit **Sync now**).
6. **On the Tracker page:** Start/Stop the stopwatch per step, hit Skip if a step doesn't apply this cycle, or use Manual entry to key in a time directly (e.g. `1:45` or `105` seconds). Use **+ New cycle** each time you loop back to the start of the sequence (e.g. each truck load cycle).
7. **Reports page:** the Summary tab shows count/avg/min/max/total/efficiency % per step automatically. The Compare tab lets you pick any row/column grouping (step, user, run, cycle, type, date) and metric (avg, total, count, efficiency), rendered as a table and/or as a bar/stacked bar/line/pie/doughnut/scatter chart — essentially a mini Power BI. The Trend tab charts a chosen step's duration over cycles or time against its target line.
8. **Export page:** filter by run/user/type/date, then download the fully granular CSV (every single recorded entry — start time, end time, duration, method, who recorded it) for deeper analysis in Excel/Power BI, plus quick summary/run/template exports.

## Notes & things worth knowing

- **Private by design:** Row Level Security means even with the public `anon` key exposed in the frontend (normal for Supabase apps), a user genuinely cannot query another project's data — it's enforced at the database level, not just hidden in the UI.
- **Multi-user sync:** entries write immediately to Supabase; every client polls every 5 seconds (as you asked) and there's a manual "Sync now" button. The "who's online" bar is instant (via Supabase Realtime Presence), separate from the 5s data poll.
- **Cycles:** built in as a first-class concept — perfect for repeated cycle-time studies (e.g. truck loading, drilling patterns) rather than one-off single measurements.
- **Extending it:** the schema has a `category` field on step templates and denormalized `step_name`/`step_type` on every entry, so you can freely rename/reorder/deactivate templates later without breaking historical reports.
- **Known simplification:** "member" is currently a flat role alongside "owner"/"admin" (roles are stored but not yet used to restrict actions — everyone with access can currently edit templates/entries). Happy to add stricter role permissions (e.g. only admins can edit templates) if useful.

## File structure

```
timemotion-tracker/
├── index.html          # login/signup + project list
├── project.html        # project dashboard (members, runs)
├── templates.html       # step template builder
├── tracker.html         # stopwatch tracking screen
├── reports.html         # summary, pivot/chart builder, trend
├── export.html          # granular CSV export
├── css/style.css
├── js/
│   ├── config.js         # <- put your Supabase URL/key here
│   ├── supabaseClient.js
│   ├── auth.js
│   ├── presence.js
│   └── utils.js
├── sql/schema.sql        # run once in Supabase SQL editor
└── README.md
```
