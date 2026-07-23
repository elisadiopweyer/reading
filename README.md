# Reading Trajectories

Static web app for the trajectory outputs. Views:

- **Research** — every adjustment lane (Pooled D, V/BK/M, single legs, genre,
  textstat, CZI) over the full year of relative weeks, from the Stata export.
- **Teacher-facing** (`?view=teacher` deep link) — actual vs difficulty-adjusted
  weekly scores with 95% cluster-bootstrap confidence bands, a per-week text
  difficulty strip, and hover annotations listing the texts the class read.
- **v3 · Teacher view (fixed β)** — every class in the pooled dataset (31
  classes; ones with <2 plottable weeks are skipped by the builder), weekly
  first-attempt strict-correct rate under three switchable views
  (`?adjview=unadjusted|universal|class`): raw only; adjusted with two *fixed
  universal* coefficients (textstat β = −0.0207, Learning Commons vocabulary
  band — the real CZI evaluator lane — β = −0.0245 per +1 SD, from the pooled
  student+month-FE model in `analysis/exploratory/coefficients_grid.py`, read
  from its details CSV and asserted, never re-fit per class; the retired Claude
  "CZI Lexile-like" guess lane was replaced by LC vocab on 2026-07-23); and
  adjusted with *class-specific* coefficients (same student+month-FE spec
  re-fit within the class, dashed lines — noisier and wildly heterogeneous:
  DZIUMA classes ≈ −0.02/−0.03, but e.g. Hughes604 +0.26). The
  class list + betas live in `data/scopes/teacher_scopes.json` (written by
  `scripts/build_fixed_beta_teacher_tab.py`), which the app reads at startup.
  Exploratory: the coefficient grid shows these betas are spec-sensitive (raw
  pooled associations run positive-to-null).

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

3. v3 fixed-β teacher tab (writes `data/scopes/trajectory_scores_by_method__tv-*.csv`
   and `trajectory_betas__tv-*.csv`; asserts the betas against the coefficient-grid
   details CSV):

```bash
python3 interim_assessments/pilot_june/text_difficulty_vbm/scripts/build_fixed_beta_teacher_tab.py
```

Notes:

- The weekly horizon is uncapped (all relative weeks with data). The old
  monthly (30-day pseudo-month) series were removed 2026-07-07.
- There is intentionally no embedded fallback dataset in `app.js`; if the CSV
  or JSON is missing the app says so instead of showing stale numbers.
