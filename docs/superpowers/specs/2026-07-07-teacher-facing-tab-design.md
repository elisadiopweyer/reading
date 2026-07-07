# Teacher-facing trajectory view — design

Date: 2026-07-07
Approved by: elisa (chat, 2026-07-07) — "add CI bands", "use all the data",
"annotate the timeline with the texts", "separate tab called teacher-facing",
"unhard cap the weekly analysis", "remove the lane with month dummies".

## Goal

Show teachers a credible difficulty-adjusted reading progression for a class:
raw vs adjusted weekly scores with uncertainty bands, over the full year of
data (not the first 12 weeks), annotated with the texts the class actually
read each week.

## Changes

### 1. Stata exporter (`stata/run_trajectory_viz_exports.do`)

- Weekly horizon uncapped: `MAX_WEEK` 12 → 40 (all relative weeks present in
  the data; student-week cells still require ≥5 responses, unchanged).
- Monthly series removed from the export ("the lane with month dummies"):
  the 30-day pseudo-month aggregation was inconsistent with the weekly window
  (84 vs 240 days) and is superseded by the uncapped weekly view. The webapp
  drops its Week/Month toggle accordingly. Monthly code for the *writeup*
  (`run_adjusted_score_trajectories.do`) is untouched.

### 2. New teacher dataset (`scripts/build_teacher_view_export.py` → `trajectory_webapp/data/teacher_view.json`)

Python replication of the exporter's student-week panel (same filters:
class DZIUMA603, first attempts, three_bucket, no reflections, ≥5
responses/cell), validated against the Stata CSV before writing output.
For each relative week:

- raw mean score, n students, total responses;
- adjusted mean (pooled D and three-leg V/BK/M, same regression spec as the
  Stata exporter: `score_iw = α + γ_w + βX_iw + ε`, single pooled β̂);
- 95% CI bands for raw and adjusted series from a cluster bootstrap
  (resample students with replacement, B = 2000, percentile intervals;
  β̂ re-estimated inside every replicate so the band carries the
  adjustment's estimation uncertainty);
- texts read that week: title, pooled difficulty D, share of the week's
  responses.

### 3. Webapp (`trajectory_webapp/`)

- Two tabs: **Research** (existing chart, weekly only, uncapped) and
  **Teacher-facing** (new view, default tab stays Research so existing links
  behave the same).
- Teacher view: raw + adjusted line with shaded CI bands; text markers along
  the x-axis with hover/tap details (which texts, how hard, how much of the
  week's work); weeks with few students (n < 8) drawn de-emphasized;
  plain-language explainer instead of the regression equation block.
- No new dependencies; stays a plain static site.

## Explicitly out of scope / blocked

- textstat + CZI rescoring on real passage text: the excerpts are not on this
  machine (searched the project, `pilot_june/cleaned`, and
  `~/Desktop/coursemojo/from github`). Blocked until passages are exported
  from the content store (manifest `s3_slugs` are the key). When they arrive,
  drop them into `data/excerpt_texts.csv` with `text_source=raw_passage` and
  rerun `scripts/build_textstat_scores.py` + the exporter.
- No changes to writeup-facing Stata scripts.
- No deploy/push; changes stay local for review.
