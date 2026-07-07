# Reading Trajectories

Static web app for the trajectory outputs. Two views:

- **Research** — every adjustment lane (Pooled D, V/BK/M, single legs, genre,
  textstat, CZI) over the full year of relative weeks, from the Stata export.
- **Teacher-facing** (`?view=teacher` deep link) — actual vs difficulty-adjusted
  weekly scores with 95% cluster-bootstrap confidence bands, a per-week text
  difficulty strip, and hover annotations listing the texts the class read.

Open locally:

```bash
python3 -m http.server 4187
```

Then open `http://localhost:4187` (or `http://localhost:4187/?view=teacher`).

Deploy on Vercel:

```text
Framework preset: Other
Build command: leave blank
Output directory: leave blank
```

Plain static site: `index.html`, `styles.css`, `app.js` (research view),
`teacher.js` (teacher view).

## Data refresh

Two steps, run in this order from the CourseMojo workspace:

1. Research lanes (writes `data/trajectory_scores_by_method.csv`):

```stata
do "/Users/eldw/Desktop/coursemojo/interim_assessments/pilot_june/text_difficulty_vbm/stata/run_trajectory_viz_exports.do"
```

2. Teacher view (writes `data/teacher_view.json`; validates its panel against
   the CSV from step 1, then bootstraps the confidence bands):

```bash
python3 interim_assessments/pilot_june/text_difficulty_vbm/scripts/build_teacher_view_export.py
```

Notes:

- The weekly horizon is uncapped (all relative weeks with data). The old
  monthly (30-day pseudo-month) series were removed 2026-07-07.
- There is intentionally no embedded fallback dataset in `app.js`; if the CSV
  or JSON is missing the app says so instead of showing stale numbers.
