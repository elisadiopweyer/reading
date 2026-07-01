# Webapp Data

`run_trajectory_viz_exports.do` writes the visualization CSV here:

```text
trajectory_scores_by_method.csv
```

The webapp loads that file when served over HTTP. If the CSV is absent, `app.js`
falls back to the embedded V/B/M trajectory values that were already in the app.
