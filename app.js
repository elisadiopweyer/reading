/* Data comes from ./data/trajectory_scores_by_method.csv (Stata export).
   There is intentionally no embedded fallback: stale embedded numbers drift
   from the pipeline, so a missing CSV shows an explicit error instead. */
const EMPTY_DATA = { week: [], month: [] };

const SERIES = {
  unadjusted: {
    label: "Unadjusted",
    tooltip: "Observed student-period average score before difficulty adjustment.",
    stroke: "#111827",
    width: 2.5,
    dash: "",
    group: "observed"
  },
  pooled_adjusted: {
    label: "Pooled D",
    tooltip: "Adjusted by holding the pooled V/BK/M text difficulty score D at its sample mean.",
    stroke: "#2563eb",
    width: 2.5,
    dash: "",
    group: "vbm"
  },
  three_leg_adjusted: {
    label: "V/BK/M",
    tooltip: "Adjusted by holding vocabulary, background knowledge, and meaning difficulty at their sample means.",
    stroke: "#dc2626",
    width: 3.6,
    dash: "",
    group: "vbm"
  },
  vocab_adjusted: {
    label: "Vocab",
    tooltip: "Adjusted by holding vocabulary difficulty at its sample mean.",
    stroke: "#7c3aed",
    width: 2.3,
    dash: "",
    group: "vbm"
  },
  bk_adjusted: {
    label: "BK",
    tooltip: "Adjusted by holding background knowledge difficulty at its sample mean.",
    stroke: "#059669",
    width: 2.3,
    dash: "",
    group: "vbm"
  },
  meaning_adjusted: {
    label: "Meaning",
    tooltip: "Adjusted by holding meaning difficulty at its sample mean.",
    stroke: "#d97706",
    width: 3.2,
    dash: "",
    group: "vbm"
  },
  genre_adjusted: {
    label: "Genre-adjusted",
    tooltip: "Adjusted by holding V/BK/M difficulty plus literary and fiction shares at their sample means.",
    stroke: "#0f766e",
    width: 3,
    dash: "",
    group: "controls"
  },
  textstat_adjusted: {
    label: "Textstat",
    tooltip: "Adjusted by holding the textstat readability complexity score at its sample mean.",
    stroke: "#0891b2",
    width: 2.7,
    dash: "",
    group: "external"
  },
  lc_sentstr_adjusted: {
    label: "CZI Sentence Structure (Claude-run)",
    tooltip:
      "Adjusted with the Learning Commons (CZI) sentence-structure evaluator: two-stage " +
      "clause/phrase analysis then a grades-5–12 rubric mapping to four bands (Slightly to " +
      "Exceedingly Complex), encoded 1–4 and z-scored. Published prompts " +
      "(github.com/learning-commons-org/evaluators, CC BY 4.0) executed with claude-sonnet-5 " +
      "instead of the published GPT-4o judge.",
    stroke: "#be185d",
    width: 2.7,
    dash: "",
    group: "external"
  },
  lc_vocab_adjusted: {
    label: "CZI Vocabulary (Claude-run)",
    tooltip:
      "Adjusted with the Learning Commons (CZI) vocabulary evaluator: background-knowledge " +
      "generation plus tiered-word analysis mapping to four bands (Slightly to Exceedingly " +
      "Complex), encoded 1–4 and z-scored. Published prompts (github.com/learning-commons-org/" +
      "evaluators, CC BY 4.0) executed with claude-sonnet-5 instead of the published GPT-4.1 judge.",
    stroke: "#b91c1c",
    width: 2.7,
    dash: "",
    group: "external"
  },
  lexile_adjusted: {
    label: "Lexile (published)",
    tooltip:
      "Adjusted with published Lexile measures of the trade books. Partial coverage by design: " +
      "only texts with a published measure (9 of 27); weeks with no covered texts are blank.",
    stroke: "#0e7490",
    width: 2.7,
    dash: "",
    group: "external"
  },
  atos_adjusted: {
    label: "ATOS (published)",
    tooltip:
      "Adjusted with published ATOS book levels. Partial coverage by design: only texts with a " +
      "published level (8 of 27); weeks with no covered texts are blank.",
    stroke: "#65a30d",
    width: 2.7,
    dash: "",
    group: "external"
  },
  raw_strict: {
    label: "Raw weekly average",
    tooltip:
      "Observed share of first attempts scored fully correct (strict coding: correct = 1, " +
      "partial or incorrect = 0), averaged across the class's student-week cells.",
    stroke: "#111827",
    width: 2.5,
    dash: "",
    group: "observed"
  },
  adj_textstat_fe: {
    label: "Adjusted — textstat (mechanical)",
    tooltip:
      "Each first attempt adjusted to average text difficulty using the fixed coefficient " +
      "β = −0.0207 per +1 SD of textstat median-grade readability, estimated once on the pooled " +
      "corpus with student and month fixed effects (strict-correct outcome). Weeks with " +
      "harder-than-average texts are adjusted upward.",
    stroke: "#0891b2",
    width: 2.7,
    dash: "",
    group: "external"
  },
  adj_czi_fe: {
    label: "Adjusted — CZI Lexile-like (LLM)",
    tooltip:
      "Each first attempt adjusted to average text difficulty using the fixed coefficient " +
      "β = −0.0235 per +1 SD of the CZI Lexile-like LLM difficulty estimate, estimated once on " +
      "the pooled corpus with student and month fixed effects (strict-correct outcome). Weeks " +
      "with harder-than-average texts are adjusted upward.",
    stroke: "#ea580c",
    width: 2.7,
    dash: "",
    group: "external"
  },
  adj_textstat_class: {
    label: "Adjusted — textstat, class-specific β",
    tooltip:
      "Same textstat adjustment, but the coefficient is re-estimated within this class only " +
      "(same student + month fixed-effects spec, same pooled difficulty z-scale). Dashed to " +
      "distinguish it from the universal-β line. Class betas are noisier — see the SE in the " +
      "coefficient table.",
    stroke: "#0891b2",
    width: 2.7,
    dash: "7 4",
    group: "external"
  },
  adj_czi_class: {
    label: "Adjusted — CZI Lexile-like, class-specific β",
    tooltip:
      "Same CZI Lexile-like adjustment, but the coefficient is re-estimated within this class " +
      "only (same student + month fixed-effects spec, same pooled difficulty z-scale). Dashed " +
      "to distinguish it from the universal-β line. Class betas are noisier — see the SE in " +
      "the coefficient table.",
    stroke: "#ea580c",
    width: 2.7,
    dash: "7 4",
    group: "external"
  }
};

const DYNAMIC_COLORS = ["#0f766e", "#9333ea", "#ea580c", "#475569", "#16a34a", "#c2410c"];
const DEFAULT_SELECTED = [
  "unadjusted",
  "pooled_adjusted",
  "three_leg_adjusted",
  "textstat_adjusted",
  "lc_sentstr_adjusted",
  "lc_vocab_adjusted"
];

const state = {
  period: "week",
  selected: new Set(DEFAULT_SELECTED),
  showFit: true,
  showSE: false,
  fitOnly: false
};

let SCOPE = "all";
let DATA = EMPTY_DATA;
let BETAS = {};
let dataSource = "No data loaded — run the Stata exporter";

const svg = document.getElementById("chart");
const summary = document.getElementById("summary");
const chartTitle = document.getElementById("chartTitle");
const modelEquation = document.getElementById("modelEquation");
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");
const seriesPicker = document.getElementById("seriesPicker");

document.querySelectorAll("[data-period]").forEach((button) => {
  button.addEventListener("click", () => {
    state.period = button.dataset.period;
    document.querySelectorAll("[data-period]").forEach((node) => {
      const isActive = node.dataset.period === state.period;
      node.classList.toggle("active", isActive);
      node.setAttribute("aria-selected", String(isActive));
    });
    renderSeriesPicker();
    render();
  });
});

document.getElementById("fitToggle").addEventListener("change", (event) => {
  state.showFit = event.target.checked;
  render();
});

document.getElementById("seToggle").addEventListener("change", (event) => {
  state.showSE = event.target.checked;
  render();
});

document.getElementById("fitOnlyToggle").addEventListener("change", (event) => {
  state.fitOnly = event.target.checked;
  render();
});

window.addEventListener("resize", render);

const V2_SCOPES = new Set([
  "newcorpus", "4gth3d", "b8srbn", "kkmxmr", "8valvc", "j2fbgt",
  "5wp9l4", "dzq3xh", "3hjbb7", "6am9sv", "wq73az", "jgveh2", "mvhh2y",
]);
// Filled from data/scopes/teacher_scopes.json at init (one scope per class).
const V3_SCOPES = new Set();
const TAB_DEFAULT = { v1: "all", v2: "newcorpus", v3: "tv-dziuma603" };

async function loadTeacherScopes() {
  try {
    const res = await fetch("./data/scopes/teacher_scopes.json", { cache: "no-store" });
    if (!res.ok) return;
    const list = await res.json();
    const og = document.getElementById("og-v3");
    if (!og || !Array.isArray(list) || !list.length) return;
    og.innerHTML = "";
    list.forEach((entry) => {
      if (!entry || !entry.scope) return;
      V3_SCOPES.add(entry.scope);
      const opt = document.createElement("option");
      opt.value = entry.scope;
      opt.textContent = entry.label || entry.scope;
      og.appendChild(opt);
    });
    if (V3_SCOPES.size) TAB_DEFAULT.v3 = list[0].scope;
  } catch (error) {
    /* manifest is optional: without it the v3 optgroup stays empty */
  }
}
const scopeTab = (scope) =>
  V3_SCOPES.has(scope) ? "v3" : V2_SCOPES.has(scope) ? "v2" : "v1";
const isTeacherTab = () => scopeTab(SCOPE) === "v3";

// Teacher-tab adjustment views: which series each one shows.
const TEACHER_VIEWS = {
  unadjusted: ["raw_strict"],
  universal: ["raw_strict", "adj_textstat_fe", "adj_czi_fe"],
  class: ["raw_strict", "adj_textstat_class", "adj_czi_class"],
};
let TEACHER_VIEW = "universal";

function syncTeacherView() {
  if (!isTeacherTab()) return;
  state.selected = new Set(TEACHER_VIEWS[TEACHER_VIEW]);
  document.querySelectorAll("#teacherViewSwitch .vtab").forEach((b) =>
    b.setAttribute("aria-selected", b.dataset.view === TEACHER_VIEW ? "true" : "false")
  );
}

// Show only the active version's scopes in the picker and highlight its tab.
function applyTab(tab) {
  const ogs = {
    v1: document.getElementById("og-v1"),
    v2: document.getElementById("og-v2"),
    v3: document.getElementById("og-v3"),
  };
  for (const [key, og] of Object.entries(ogs)) {
    if (!og) continue;
    const inactive = key !== tab;
    og.hidden = inactive;
    [...og.children].forEach((o) => (o.disabled = inactive));
  }
  document.querySelectorAll("#versionTabs .vtab").forEach((b) =>
    b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false")
  );
  const teacherSwitch = document.getElementById("teacherViewSwitch");
  if (teacherSwitch) teacherSwitch.hidden = tab !== "v3";
}

async function reloadScope(scope) {
  const picker = document.getElementById("scopePicker");
  SCOPE = scope;
  if (picker) picker.value = scope;
  DATA = EMPTY_DATA;
  BETAS = {};
  await loadStataExport();
  syncTeacherView();
  renderSeriesPicker();
  render();
  if (typeof window.reloadTeacherView === "function") window.reloadTeacherView(SCOPE);
}

async function init() {
  await loadTeacherScopes();
  const picker = document.getElementById("scopePicker");
  const params = new URLSearchParams(location.search);
  const urlScope = params.get("scope");
  if (urlScope && picker && [...picker.options].some((o) => o.value === urlScope)) {
    SCOPE = urlScope;
    picker.value = urlScope;
  }
  // Version tabs: default to the tab that owns the initial scope, or ?tab=.
  const urlTab = params.get("tab");
  let activeTab = ["v1", "v2", "v3"].includes(urlTab) ? urlTab : scopeTab(SCOPE);
  if (urlTab && !urlScope) {
    SCOPE = TAB_DEFAULT[activeTab];
    if (picker) picker.value = SCOPE;
  }
  applyTab(activeTab);
  document.querySelectorAll("#versionTabs .vtab").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const tab = btn.dataset.tab;
      applyTab(tab);
      if (scopeTab(SCOPE) !== tab) await reloadScope(TAB_DEFAULT[tab]);
    });
  });
  if (TEACHER_VIEWS[params.get("adjview")]) {
    TEACHER_VIEW = params.get("adjview");
  }
  if (params.get("se") === "1") {
    state.showSE = true;
    document.getElementById("seToggle").checked = true;
  }
  if (params.get("fitonly") === "1") {
    state.fitOnly = true;
    document.getElementById("fitOnlyToggle").checked = true;
  }
  if (picker) {
    picker.addEventListener("change", async () => {
      SCOPE = picker.value;
      DATA = EMPTY_DATA;
      BETAS = {};
      await loadStataExport();
      syncTeacherView();
      renderSeriesPicker();
      render();
      if (typeof window.reloadTeacherView === "function") window.reloadTeacherView(SCOPE);
    });
  }
  document.querySelectorAll("#teacherViewSwitch .vtab").forEach((btn) => {
    btn.addEventListener("click", () => {
      TEACHER_VIEW = btn.dataset.view;
      syncTeacherView();
      renderSeriesPicker();
      render();
    });
  });
  await loadStataExport();
  syncTeacherView();
  renderSeriesPicker();
  render();
}

async function loadStataExport() {
  try {
    let response = await fetch(`./data/scopes/trajectory_scores_by_method__${SCOPE}.csv`, { cache: "no-store" });
    if (!response.ok && SCOPE === "all") {
      response = await fetch("./data/trajectory_scores_by_method.csv", { cache: "no-store" });
    }
    if (!response.ok) return;
    const text = await response.text();
    const longRows = parseCsv(text);
    const nextData = buildWideData(longRows);
    if (nextData.week.length || nextData.month.length) {
      DATA = nextData;
      const picker = document.getElementById("scopePicker");
      const scopeLabel = picker ? picker.selectedOptions[0].textContent : SCOPE;
      dataSource = `${isTeacherTab() ? "Fixed-β export" : "Stata export"} · ${scopeLabel}`;
      constrainSelected();
    }
  } catch (error) {
    dataSource = "No data loaded — run the Stata exporter";
  }

  try {
    let betaResponse = await fetch(`./data/scopes/trajectory_betas__${SCOPE}.csv`, { cache: "no-store" });
    if (!betaResponse.ok && SCOPE === "all") {
      betaResponse = await fetch("./data/trajectory_betas.csv", { cache: "no-store" });
    }
    if (betaResponse.ok) {
      BETAS = {};
      parseCsv(await betaResponse.text()).forEach((row) => {
        (BETAS[row.series_id] = BETAS[row.series_id] || []).push(row);
      });
    }
  } catch (error) {
    /* coefficient table is optional */
  }
}

function renderSeriesPicker() {
  const available = availableSeries(state.period);
  constrainSelected();
  seriesPicker.innerHTML = "";

  if (!available.length) {
    const empty = document.createElement("span");
    empty.className = "check-row disabled";
    empty.textContent = "No series";
    seriesPicker.appendChild(empty);
    return;
  }

  available.forEach((key) => {
    const def = SERIES[key];
    const label = document.createElement("label");
    label.className = "check-row";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.series = key;
    input.checked = state.selected.has(key);
    input.addEventListener("change", () => {
      if (input.checked) {
        state.selected.add(key);
      } else {
        state.selected.delete(key);
      }
      render();
    });

    const swatch = document.createElement("span");
    swatch.className = "line-swatch";
    swatch.style.borderTopColor = def.stroke;
    swatch.style.borderTopWidth = `${Math.max(2, def.width)}px`;
    if (def.dash) swatch.style.borderTopStyle = "dashed";

    const text = document.createElement("span");
    text.className = "hint";
    text.tabIndex = 0;
    text.dataset.tooltip = def.tooltip;
    text.textContent = def.label;

    label.append(input, swatch, text);
    seriesPicker.appendChild(label);
  });
}

function render() {
  const rows = DATA[state.period] || [];
  const selected = [...state.selected].filter((key) => hasFiniteValue(rows, key));
  chartTitle.textContent = isTeacherTab()
    ? "Weekly First-Attempt Correct Rate — Raw vs Difficulty-Adjusted"
    : "Weekly Score Trajectory";
  summary.innerHTML = `${rows.length} periods<br>${totalObservations(rows)} student-period rows<br>${dataSource}`;
  modelEquation.innerHTML = equationMarkup(state.period, selected);
  renderChart(rows, selected, state.showFit || state.fitOnly, state.showSE, state.fitOnly);
  renderTable(rows, selected);
}

function equationMarkup(period, selected) {
  if (isTeacherTab()) return teacherEquationMarkup(selected);
  const suffix = period === "week" ? "iw" : "im";
  const periodIndex = period === "week" ? "w" : "m";
  const periodName = period === "week" ? "relative week" : "relative month";
  const adjusted = selected.filter((key) => key !== "unadjusted").map((key) => SERIES[key].label);
  const adjustedCopy = adjusted.length ? adjusted.join(", ") : "selected scoring method";
  const externalSelected = selected.some((key) => SERIES[key]?.group === "external");
  const controlsSelected = selected.some((key) => SERIES[key]?.group === "controls");

  return `
    <div class="equation-line">
      <span class="equation-name">Adjustment</span>
      <div class="math-equation">
        <span class="math-var">Score</span><sup>adj</sup><sub>${suffix}</sub>
        =
        <span class="math-var">Score</span><sub>${suffix}</sub>
        -
        <span class="math-hat">β</span><sub>X</sub>(<span class="math-var">X</span><sub>${suffix}</sub> - <span class="math-bar">X</span>)
      </div>
    </div>
    <div class="equation-line">
      <span class="equation-name">Period model</span>
      <div class="math-equation">
        <span class="math-var">Score</span><sub>${suffix}</sub>
        =
        <span class="math-var">α</span>
        +
        <span class="math-var">γ</span><sub>${periodIndex}</sub>
        +
        <span class="math-var">β</span><sub>X</sub><span class="math-var">X</span><sub>${suffix}</sub>
        +
        <span class="math-var">ε</span><sub>${suffix}</sub>
      </div>
    </div>
    <div class="equation-note">
      Showing ${escapeHtml(adjustedCopy)}. Each adjusted line removes the part of the student-period score predicted by that scoring method's difficulty measure and puts difficulty back at the sample mean.
      <span
        class="hint"
        tabindex="0"
        data-tooltip="Student i's average score in a ${periodName}."
      >Score<sub>${suffix}</sub></span>
      is the student-period score;
      <span
        class="hint"
        tabindex="0"
        data-tooltip="A period indicator. This lets each ${periodName} have its own baseline level."
      >γ<sub>${periodIndex}</sub></span>
      is the period term.
      ${externalSelected ? "External-score lines use the same adjustment formula as V/B/M, with their own scalar score." : ""}
      ${controlsSelected ? "Genre-adjusted holds V/BK/M difficulty, literary share, and fiction share at their sample means." : ""}
    </div>
    ${betaTableMarkup(selected)}
  `;
}

function teacherEquationMarkup(selected) {
  return `
    <div class="equation-line">
      <span class="equation-name">Adjustment</span>
      <div class="math-equation">
        <span class="math-var">Score</span><sup>adj</sup><sub>it</sub>
        =
        <span class="math-var">Score</span><sub>it</sub>
        -
        <span class="math-hat">β</span><sub>X</sub>&thinsp;<span class="math-var">X</span><sup>z</sup><sub>it</sub>
      </div>
    </div>
    <div class="equation-line">
      <span class="equation-name">Where β̂ comes from</span>
      <div class="math-equation">
        <span class="math-var">Score</span><sub>it</sub>
        =
        <span class="math-var">α</span><sub>i</sub>
        +
        <span class="math-var">γ</span><sub>m(t)</sub>
        +
        <span class="math-var">β</span><sub>X</sub><span class="math-var">X</span><sup>z</sup><sub>it</sub>
        +
        <span class="math-var">ε</span><sub>it</sub>
      </div>
    </div>
    <div class="equation-note">
      Score is the <strong>strict first-attempt outcome</strong> (fully correct = 1; partial or incorrect = 0).
      Each adjusted line subtracts a fixed coefficient times the text's difficulty (z-scored against the
      pooled corpus), so every week is shown as if the class had read texts of average difficulty.
      <strong>Universal β̂</strong> (solid) was estimated once on the pooled two-corpus sample
      (52,660 first attempts) with
      <span class="hint" tabindex="0" data-tooltip="Student fixed effects: each student is compared only to themselves, removing stable ability differences.">student</span>
      and
      <span class="hint" tabindex="0" data-tooltip="School-year-month fixed effects: removes shared calendar drift, e.g. the June drop.">month</span>
      fixed effects and is applied identically to every class. <strong>Class-specific β̂</strong> (dashed)
      re-fits the same spec within this class only — same difficulty z-scale, so the two coefficients are
      directly comparable, but the class estimate is noisier (fewer students, fewer months). A negative β̂
      means harder-than-average weeks are adjusted upward. Exploratory view; see the coefficient grid for
      how these β̂s move across specifications (raw pooled associations are positive-to-null).
    </div>
    ${betaTableMarkup(selected)}
  `;
}

function betaTableMarkup(selected) {
  const withBetas = selected.filter((key) => Array.isArray(BETAS[key]) && BETAS[key].length);
  if (!withBetas.length) return "";

  const fmt = (value, digits) => {
    const num = Number.parseFloat(value);
    return Number.isFinite(num) ? num.toFixed(digits) : "—";
  };
  const fmtP = (value) => {
    const num = Number.parseFloat(value);
    if (!Number.isFinite(num)) return "—";
    return num < 0.001 ? "&lt;0.001" : num.toFixed(3);
  };

  const bodyRows = withBetas
    .map((key) => {
      const def = SERIES[key];
      const terms = BETAS[key];
      return terms
        .map((term, index) => `
          <tr>
            ${index === 0
              ? `<td class="beta-series" rowspan="${terms.length}" style="box-shadow: inset 3px 0 0 ${def.stroke}">${escapeHtml(def.label)}</td>`
              : ""}
            <td>${escapeHtml(term.param_label)}</td>
            <td class="num">${fmt(term.coef, 4)}</td>
            <td class="num">${fmt(term.se, 4)}</td>
            <td class="num">${fmtP(term.pvalue)}</td>
            <td class="num">${fmt(term.xbar, 2)}</td>
          </tr>`)
        .join("");
    })
    .join("");

  return `
    <div class="beta-block">
      <div class="beta-title">How the selected adjusted lines are built</div>
      <table class="beta-table">
        <thead>
          <tr>
            <th>Series</th>
            <th>Difficulty term X</th>
            <th>β̂</th>
            <th>SE</th>
            <th>p</th>
            <th>X̄ (mean)</th>
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
      <div class="beta-note">
        ${isTeacherTab()
          ? "All β̂s come from the same student + month fixed-effects spec on strict-correct first attempts " +
            "(SEs clustered by student, normal-approximation p; X̄ = 0 because difficulty is z-scored on the " +
            "pooled corpus). <em>Universal</em> rows are estimated once on the pooled two-corpus sample and " +
            "applied identically to every class; <em>class-specific</em> rows re-fit the spec within this " +
            "class only, so they are noisier but tailored."
          : "Each adjusted line subtracts β̂·(X<sub>iw</sub> − X̄) for every term shown, where β̂ comes from the " +
            "weekly regression of student-week scores on week indicators plus that series' difficulty term(s) " +
            "(standard errors clustered by student). A negative β̂ means harder texts predict lower scores, so " +
            "weeks with harder-than-average texts are adjusted upward."}
      </div>
    </div>`;
}

function renderChart(rows, selected, showFit, showSE, fitOnly) {
  const width = Math.max(720, svg.clientWidth || 960);
  const height = svg.clientHeight || 560;
  const margin = { top: 70, right: 34, bottom: 54, left: 82 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = "";

  if (!selected.length) {
    appendText(svg, width / 2, height / 2, "Select at least one series", "middle", "axis");
    return;
  }

  const fits = showFit ? Object.fromEntries(
    selected
      .map((key) => [key, linearFit(rows, key)])
      .filter(([, fit]) => fit)
  ) : {};
  const fitValues = Object.values(fits).flatMap((fit) => [fit.startY, fit.endY]);
  const seValues = (showSE && !fitOnly)
    ? rows.flatMap((row) => selected.flatMap((key) => {
        const se = row[`${key}_se`];
        return Number.isFinite(row[key]) && Number.isFinite(se)
          ? [row[key] - 1.96 * se, row[key] + 1.96 * se]
          : [];
      }))
    : [];
  const values = (fitOnly
    ? fitValues
    : rows.flatMap((row) => selected.map((key) => row[key]).filter(Number.isFinite)).concat(fitValues)
  ).concat(seValues);

  if (!values.length) {
    appendText(svg, width / 2, height / 2, "No finite values for selected series", "middle", "axis");
    return;
  }

  // Tight y-domain: fit the plotted values with a thin pad instead of stretching
  // toward 0/1, so level differences and trendline slopes stay legible.
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = Math.max(0.05, rawMax - rawMin);
  const yMin = Math.max(0, rawMin - spread * 0.1);
  const yMax = Math.min(1, rawMax + spread * 0.1);
  const xMin = rows[0].period;
  const xMax = rows[rows.length - 1].period;

  const x = (period) => margin.left + ((period - xMin) / (xMax - xMin || 1)) * innerWidth;
  const y = (value) => margin.top + (1 - (value - yMin) / (yMax - yMin || 1)) * innerHeight;

  const yTicks = makeTicks(yMin, yMax, 5);
  yTicks.forEach((tick) => {
    appendLine(svg, margin.left, y(tick), width - margin.right, y(tick), "grid-line");
    appendText(svg, margin.left - 12, y(tick) + 4, tick.toFixed(2), "end", "axis");
  });

  appendLine(svg, margin.left, margin.top, margin.left, height - margin.bottom, "axis-line");
  appendLine(svg, margin.left, height - margin.bottom, width - margin.right, height - margin.bottom, "axis-line");

  rows.forEach((row) => {
    appendText(svg, x(row.period), height - margin.bottom + 24, String(row.period), "middle", "axis");
  });
  appendText(svg, margin.left + innerWidth / 2, height - 12, state.period === "week" ? "Relative week" : "Relative month", "middle", "axis");
  appendText(svg, 16, margin.top + innerHeight / 2, isTeacherTab() ? "Share fully correct" : "Average score", "middle", "axis", -90);

  selected.forEach((key, index) => {
    const def = SERIES[key];
    const points = rows.filter((row) => Number.isFinite(row[key]));
    if (!points.length) return;

    if (showSE && !fitOnly) {
      const bandPoints = points.filter((row) => Number.isFinite(row[`${key}_se`]));
      if (bandPoints.length > 1) {
        const upper = bandPoints.map((row, i) =>
          `${i === 0 ? "M" : "L"} ${x(row.period)} ${y(row[key] + 1.96 * row[`${key}_se`])}`);
        const lower = [...bandPoints].reverse().map((row) =>
          `L ${x(row.period)} ${y(row[key] - 1.96 * row[`${key}_se`])}`);
        const band = document.createElementNS("http://www.w3.org/2000/svg", "path");
        band.setAttribute("d", upper.join(" ") + " " + lower.join(" ") + " Z");
        band.setAttribute("class", "se-band");
        band.setAttribute("fill", def.stroke);
        svg.appendChild(band);
      }
    }

    if (!fitOnly) {
      const path = points.map((row, i) => `${i === 0 ? "M" : "L"} ${x(row.period)} ${y(row[key])}`).join(" ");
      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      line.setAttribute("d", path);
      line.setAttribute("class", "data-line");
      line.setAttribute("stroke", def.stroke);
      line.setAttribute("stroke-width", def.width);
      if (def.dash) line.setAttribute("stroke-dasharray", def.dash);
      svg.appendChild(line);

      points.forEach((row) => {
        const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        point.setAttribute("cx", x(row.period));
        point.setAttribute("cy", y(row[key]));
        point.setAttribute("r", index === 0 ? 3.5 : 3);
        point.setAttribute("class", "data-point");
        point.setAttribute("stroke", def.stroke);
        svg.appendChild(point);
      });
    }

    if (showFit && fits[key]) {
      const fit = fits[key];
      const fitLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      fitLine.setAttribute("x1", x(fit.startX));
      fitLine.setAttribute("y1", y(fit.startY));
      fitLine.setAttribute("x2", x(fit.endX));
      fitLine.setAttribute("y2", y(fit.endY));
      fitLine.setAttribute("class", "fit-line");
      fitLine.setAttribute("stroke", def.stroke);
      fitLine.setAttribute("stroke-width", fitOnly ? def.width : Math.max(1.1, def.width - 1.2));
      fitLine.setAttribute("stroke-dasharray", fitOnly ? "6 4" : "1 7");
      svg.appendChild(fitLine);
    }
  });

  renderLegend(selected, margin.left, 28, showFit);
}

function renderLegend(selected, startX, startY, showFit) {
  const maxX = Math.max(720, svg.clientWidth || 960) - 40;
  let xCursor = startX;
  let yCursor = startY;
  selected.forEach((key) => {
    const def = SERIES[key];
    const entryWidth = Math.max(96, def.label.length * 8 + 56);
    if (xCursor > startX && xCursor + entryWidth > maxX) {
      xCursor = startX;
      yCursor += 20;
    }
    appendLine(svg, xCursor, yCursor, xCursor + 28, yCursor, "data-line", def.stroke, def.width, def.dash);
    if (showFit) {
      appendLine(svg, xCursor, yCursor + 8, xCursor + 28, yCursor + 8, "fit-line", def.stroke, 1.4, "1 7");
    }
    appendText(svg, xCursor + 36, yCursor + 4, def.label, "start", "axis");
    xCursor += entryWidth;
  });
}

function renderTable(rows, selected) {
  const columns = [
    { key: "label", label: state.period === "week" ? "Week" : "Month" },
    { key: "n", label: "N" },
    ...selected.map((key) => ({ key, label: SERIES[key].label, tooltip: SERIES[key].tooltip }))
  ];

  tableHead.innerHTML = `<tr>${columns.map((column) => `<th>${headerLabel(column)}</th>`).join("")}</tr>`;
  tableBody.innerHTML = rows
    .map((row) => {
      return `<tr>${columns
        .map((column) => {
          const value = row[column.key];
          const text = typeof value === "number" && column.key !== "n" ? value.toFixed(3) : value ?? "";
          return `<td>${text}</td>`;
        })
        .join("")}</tr>`;
    })
    .join("");
}

function headerLabel(column) {
  if (!column.tooltip) return column.label;
  return `<span class="hint" tabindex="0" data-tooltip="${escapeAttr(column.tooltip)}">${column.label}</span>`;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""]));
  });
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

function buildWideData(longRows) {
  const maps = { week: new Map(), month: new Map() };
  longRows.forEach((record) => {
    const periodType = record.period_type;
    const period = Number(record.period);
    const score = Number(record.score);
    const seriesId = record.series_id;
    if (!maps[periodType] || !Number.isFinite(period) || !Number.isFinite(score) || !seriesId) return;

    ensureSeriesDefinition(seriesId, record);
    const map = maps[periodType];
    const row = map.get(period) || {
      period,
      label: record.period_label || `${periodType === "week" ? "Week" : "Month"} ${period}`,
      n: 0
    };
    row[seriesId] = score;
    row[`${seriesId}_n`] = Number(record.n_students);
    row[`${seriesId}_se`] = Number(record.score_se);
    row[`${seriesId}_mean_difficulty`] = Number(record.mean_difficulty);
    row.n = Math.max(row.n || 0, Number(record.n_students) || 0);
    map.set(period, row);
  });

  return {
    week: [...maps.week.values()].sort((a, b) => a.period - b.period),
    month: [...maps.month.values()].sort((a, b) => a.period - b.period)
  };
}

function ensureSeriesDefinition(seriesId, record) {
  if (SERIES[seriesId]) {
    if (record.series_label) SERIES[seriesId].label = record.series_label;
    return;
  }
  const dynamicIndex = Object.keys(SERIES).length % DYNAMIC_COLORS.length;
  const label = record.series_label || seriesId.replace(/_/g, " ");
  SERIES[seriesId] = {
    label,
    tooltip: `Adjusted by holding ${label} difficulty at its sample mean.`,
    stroke: DYNAMIC_COLORS[dynamicIndex],
    width: 2.7,
    dash: "",
    group: record.series_group || "external"
  };
}

function availableSeries(period) {
  const rows = DATA[period] || [];
  return Object.keys(SERIES).filter((key) => hasFiniteValue(rows, key));
}

function hasFiniteValue(rows, key) {
  return rows.some((row) => Number.isFinite(row[key]));
}

function constrainSelected() {
  const available = new Set(availableSeries(state.period));
  [...state.selected].forEach((key) => {
    if (!available.has(key)) state.selected.delete(key);
  });
  if (!state.selected.size && available.size) {
    DEFAULT_SELECTED.filter((key) => available.has(key)).forEach((key) => state.selected.add(key));
    // No defaults present (e.g. the teacher tab's own series): show everything available.
    if (!state.selected.size) available.forEach((key) => state.selected.add(key));
  }
}

function totalObservations(rows) {
  return rows.reduce((sum, row) => sum + (Number(row.n) || 0), 0);
}

function makeTicks(min, max, count) {
  const ticks = [];
  const step = (max - min) / Math.max(1, count - 1);
  for (let i = 0; i < count; i += 1) {
    ticks.push(min + step * i);
  }
  return ticks;
}

function linearFit(rows, key) {
  const points = rows.filter((row) => Number.isFinite(row[key]));
  const n = points.length;
  if (n < 2) return null;
  const sumX = points.reduce((sum, row) => sum + row.period, 0);
  const sumY = points.reduce((sum, row) => sum + row[key], 0);
  const sumXX = points.reduce((sum, row) => sum + row.period * row.period, 0);
  const sumXY = points.reduce((sum, row) => sum + row.period * row[key], 0);
  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = sumY / n - slope * (sumX / n);
  const startX = points[0].period;
  const endX = points[points.length - 1].period;

  return {
    startX,
    endX,
    startY: intercept + slope * startX,
    endY: intercept + slope * endX
  };
}

function appendLine(parent, x1, y1, x2, y2, className, stroke, width, dash) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("class", className);
  if (stroke) line.setAttribute("stroke", stroke);
  if (width) line.setAttribute("stroke-width", width);
  if (dash) line.setAttribute("stroke-dasharray", dash);
  parent.appendChild(line);
  return line;
}

function appendText(parent, x, y, text, anchor, className, rotate) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
  node.setAttribute("x", x);
  node.setAttribute("y", y);
  node.setAttribute("text-anchor", anchor);
  node.setAttribute("class", className);
  if (rotate) node.setAttribute("transform", `rotate(${rotate} ${x} ${y})`);
  node.textContent = text;
  parent.appendChild(node);
  return node;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

init();
