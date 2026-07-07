# Webapp Data

Two generated files live here; both are required (there is no embedded
fallback in the app).

`trajectory_scores_by_method.csv` — research-view lanes. Written by
`stata/run_trajectory_viz_exports.do` (weekly only, horizon uncapped).

`teacher_view.json` — teacher-view series: raw and adjusted weekly means with
95% cluster-bootstrap confidence intervals, per-week text lists with pooled
difficulty D, per-week student counts, and the adjustment betas with CIs.
Written by `scripts/build_teacher_view_export.py`, which replicates the Stata
panel, asserts the replication matches the CSV above, then bootstraps
(students resampled with replacement, B = 2000, seed 20260707).
