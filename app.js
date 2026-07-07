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
  learning_commons_adjusted: {
    label: "Learning Commons",
    tooltip: "Adjusted by holding the Learning Commons evaluator score at its sample mean.",
    stroke: "#be185d",
    width: 2.7,
    dash: "",
    group: "external"
  },
  czi_adjusted: {
    label: "CZI",
    tooltip: "Adjusted by holding the CZI text complexity score at its sample mean.",
    stroke: "#4f46e5",
    width: 2.7,
    dash: "",
    group: "external"
  }
};

const DYNAMIC_COLORS = ["#0f766e", "#9333ea", "#ea580c", "#475569", "#16a34a", "#c2410c"];
const DEFAULT_SELECTED = [
  "unadjusted",
  "pooled_adjusted",
  "three_leg_adjusted",
  "czi_adjusted",
  "textstat_adjusted"
];

const state = {
  period: "week",
  selected: new Set(DEFAULT_SELECTED),
  showFit: true
};

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

window.addEventListener("resize", render);

async function init() {
  await loadStataExport();
  renderSeriesPicker();
  render();
}

async function loadStataExport() {
  try {
    const response = await fetch("./data/trajectory_scores_by_method.csv", { cache: "no-store" });
    if (!response.ok) return;
    const text = await response.text();
    const longRows = parseCsv(text);
    const nextData = buildWideData(longRows);
    if (nextData.week.length || nextData.month.length) {
      DATA = nextData;
      dataSource = "Stata export";
      constrainSelected();
    }
  } catch (error) {
    dataSource = "No data loaded — run the Stata exporter";
  }

  try {
    const betaResponse = await fetch("./data/trajectory_betas.csv", { cache: "no-store" });
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
  chartTitle.textContent = "Weekly Score Trajectory";
  summary.innerHTML = `${rows.length} periods<br>${totalObservations(rows)} student-period rows<br>${dataSource}`;
  modelEquation.innerHTML = equationMarkup(state.period, selected);
  renderChart(rows, selected, state.showFit);
  renderTable(rows, selected);
}

function equationMarkup(period, selected) {
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
        Each adjusted line subtracts β̂·(X<sub>iw</sub> − X̄) for every term shown, where β̂ comes from the
        weekly regression of student-week scores on week indicators plus that series' difficulty term(s)
        (standard errors clustered by student). A negative β̂ means harder texts predict lower scores, so
        weeks with harder-than-average texts are adjusted upward.
      </div>
    </div>`;
}

function renderChart(rows, selected, showFit) {
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
  const values = rows.flatMap((row) => selected.map((key) => row[key]).filter(Number.isFinite)).concat(fitValues);

  if (!values.length) {
    appendText(svg, width / 2, height / 2, "No finite values for selected series", "middle", "axis");
    return;
  }

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = Math.max(0.08, rawMax - rawMin);
  const yMin = Math.max(0, rawMin - spread * 0.25);
  const yMax = Math.min(1, rawMax + spread * 0.25);
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
  appendText(svg, 16, margin.top + innerHeight / 2, "Average score", "middle", "axis", -90);

  selected.forEach((key, index) => {
    const def = SERIES[key];
    const points = rows.filter((row) => Number.isFinite(row[key]));
    if (!points.length) return;

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

    if (showFit && fits[key]) {
      const fit = fits[key];
      const fitLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      fitLine.setAttribute("x1", x(fit.startX));
      fitLine.setAttribute("y1", y(fit.startY));
      fitLine.setAttribute("x2", x(fit.endX));
      fitLine.setAttribute("y2", y(fit.endY));
      fitLine.setAttribute("class", "fit-line");
      fitLine.setAttribute("stroke", def.stroke);
      fitLine.setAttribute("stroke-width", Math.max(1.1, def.width - 1.2));
      fitLine.setAttribute("stroke-dasharray", "1 7");
      svg.appendChild(fitLine);
    }
  });

  renderLegend(selected, margin.left, 28, showFit);
}

function renderLegend(selected, startX, startY, showFit) {
  let xCursor = startX;
  selected.forEach((key) => {
    const def = SERIES[key];
    appendLine(svg, xCursor, startY, xCursor + 28, startY, "data-line", def.stroke, def.width, def.dash);
    if (showFit) {
      appendLine(svg, xCursor, startY + 8, xCursor + 28, startY + 8, "fit-line", def.stroke, 1.4, "1 7");
    }
    appendText(svg, xCursor + 36, startY + 4, def.label, "start", "axis");
    xCursor += Math.max(96, def.label.length * 8 + 56);
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
    if (!state.selected.size) state.selected.add([...available][0]);
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
