# Reading Trajectories

Static web app for the Stata trajectory outputs.

Open locally:

```bash
python3 -m http.server 4187
```

Then open `http://localhost:4187`.

Deploy on Vercel:

```text
Framework preset: Other
Build command: leave blank
Output directory: leave blank
```

This is a plain static site: `index.html`, `styles.css`, and `app.js`.

## Data refresh

Run the Stata exporter from the CourseMojo workspace:

```stata
do "/Users/eldw/Desktop/coursemojo/interim_assessments/pilot_june/text_difficulty_vbm/stata/run_trajectory_viz_exports.do"
```

That writes:

```text
data/trajectory_scores_by_method.csv
```

The app loads that CSV and creates toggles for every scoring method present.
If the CSV is missing, it falls back to the embedded V/B/M data.
