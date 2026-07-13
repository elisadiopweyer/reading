/* Teacher-facing view: full-year weekly trajectory with 95% CI bands and
   per-week text annotations. Data: ./data/teacher_view.json, produced by
   scripts/build_teacher_view_export.py (cluster bootstrap, B=2000). */

const TEACHER_COLORS = {
  raw: "#6b7280",
  adjusted: "#2563eb"
};

/* Single-hue sequential ramp (amber) for the difficulty strip, light -> dark. */
const DIFFICULTY_RAMP = ["#fef3c7", "#fcd34d", "#f59e0b", "#b45309", "#78350f"];
const DIFFICULTY_DOMAIN = [4, 16];
const LOW_N_SHARE = 0.6; // de-emphasize weeks with < 60% of peak participation
const MIN_LINE_STUDENTS = 5; // below this, a week is a standalone faded dot, not part of the line

const teacherState = { data: null, hoverWeek: null };

const teacherView = document.getElementById("teacherView");
const teacherSvg = document.getElementById("teacherChart");
const teacherTooltip = document.getElementById("teacherTooltip");
const teacherSummary = document.getElementById("teacherSummary");
const teacherTableHead = document.getElementById("teacherTableHead");
const teacherTableBody = document.getElementById("teacherTableBody");
const teacherBetaNote = document.getElementById("teacherBetaNote");

let teacherScope = (() => {
  const p = new URLSearchParams(location.search).get("scope");
  return p || "all";
})();

async function initTeacherView() {
  try {
    let response = await fetch(`./data/scopes/teacher_view__${teacherScope}.json`, { cache: "no-store" });
    if (!response.ok && teacherScope === "all") {
      response = await fetch("./data/teacher_view.json", { cache: "no-store" });
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    teacherState.data = await response.json();
  } catch (error) {
    teacherSummary.textContent = "Could not load teacher view data — run scripts/build_teacher_view_export.py.";
    return;
  }
  renderTeacherView();
}

window.reloadTeacherView = (scope) => {
  teacherScope = scope;
  initTeacherView();
};

function renderTeacherView() {
  const data = teacherState.data;
  if (!data || !teacherView || teacherView.hidden) return;
  const weeks = data.weeks;
  const first = weeks[0];
  const last = weeks[weeks.length - 1];

  teacherSummary.innerHTML = `${weeks.length} weeks of activity · ${data.class}<br>` +
    `${formatMonthYear(first.median_date)} to ${formatMonthYear(last.median_date)}`;

  const beta = data.betas.pooled_d;
  teacherBetaNote.textContent =
    `Adjustment uses the whole year of data. Effect of one difficulty point on scores: ` +
    `${formatPct(beta.est)} (95% CI ${formatPct(beta.ci[0])} to ${formatPct(beta.ci[1])}) — ` +
    `a range that ${beta.ci[0] <= 0 && beta.ci[1] >= 0 ? "includes zero, so read adjusted-vs-actual gaps cautiously" : "excludes zero"}.`;

  renderTeacherChart(weeks);
  renderTeacherTable(weeks);
}

function renderTeacherChart(weeks) {
  const width = Math.max(720, teacherSvg.clientWidth || 960);
  const height = teacherSvg.clientHeight || 560;
  const margin = { top: 24, right: 30, bottom: 92, left: 64 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const stripY = height - margin.bottom + 40;

  teacherSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  teacherSvg.innerHTML = "";

  const values = weeks.flatMap((w) => [w.raw_ci[0], w.raw_ci[1], w.vbm_ci[0], w.vbm_ci[1]]);
  const spread = Math.max(0.1, Math.max(...values) - Math.min(...values));
  const yMin = Math.max(0, Math.min(...values) - spread * 0.08);
  const yMax = Math.min(1, Math.max(...values) + spread * 0.08);
  const xMin = weeks[0].week;
  const xMax = weeks[weeks.length - 1].week;

  const x = (week) => margin.left + ((week - xMin) / (xMax - xMin || 1)) * innerW;
  const y = (v) => margin.top + (1 - (v - yMin) / (yMax - yMin || 1)) * innerH;

  for (const tick of percentTicks(yMin, yMax, 5)) {
    svgLine(teacherSvg, margin.left, y(tick), width - margin.right, y(tick), "grid-line");
    svgText(teacherSvg, margin.left - 10, y(tick) + 4, `${Math.round(tick * 100)}%`, "end", "axis");
  }
  svgLine(teacherSvg, margin.left, height - margin.bottom, width - margin.right, height - margin.bottom, "axis-line");

  const maxN = Math.max(...weeks.map((w) => w.n_students));

  /* Consecutive runs of adequately-attended weeks: break lines and bands across
     week gaps (e.g. 27 -> 31) and across very-low-attendance weeks, which are
     drawn as standalone faded dots with a CI whisker instead. */
  const lineWeeks = weeks.filter((w) => w.n_students >= MIN_LINE_STUDENTS);
  const loneWeeks = weeks.filter((w) => w.n_students < MIN_LINE_STUDENTS);
  const runs = [];
  if (lineWeeks.length) {
    let run = [lineWeeks[0]];
    for (let i = 1; i < lineWeeks.length; i += 1) {
      if (lineWeeks[i].week - lineWeeks[i - 1].week === 1) run.push(lineWeeks[i]);
      else { runs.push(run); run = [lineWeeks[i]]; }
    }
    runs.push(run);
  }

  const series = [
    { key: "raw", ci: "raw_ci", color: TEACHER_COLORS.raw, band: 0.10, width: 2 },
    { key: "vbm_adj", ci: "vbm_ci", color: TEACHER_COLORS.adjusted, band: 0.13, width: 2.4 }
  ];

  for (const s of series) {
    for (const seg of runs) {
      if (seg.length < 2) continue;
      const top = seg.map((w, i) => `${i === 0 ? "M" : "L"} ${x(w.week)} ${y(w[s.ci][1])}`).join(" ");
      const bottom = [...seg].reverse().map((w) => `L ${x(w.week)} ${y(w[s.ci][0])}`).join(" ");
      svgPath(teacherSvg, `${top} ${bottom} Z`, { fill: s.color, "fill-opacity": s.band, stroke: "none" });
    }
  }
  for (const s of series) {
    for (const seg of runs) {
      const d = seg.map((w, i) => `${i === 0 ? "M" : "L"} ${x(w.week)} ${y(w[s.key])}`).join(" ");
      svgPath(teacherSvg, d, { fill: "none", stroke: s.color, "stroke-width": s.width, "stroke-linejoin": "round", "stroke-linecap": "round" });
      for (const w of seg) {
        const dot = svgEl("circle", {
          cx: x(w.week), cy: y(w[s.key]), r: 4,
          fill: s.color, stroke: "#fff", "stroke-width": 2,
          opacity: w.n_students < maxN * LOW_N_SHARE ? 0.45 : 1
        });
        teacherSvg.appendChild(dot);
      }
    }
    for (const w of loneWeeks) {
      svgLine(teacherSvg, x(w.week), y(w[s.ci][0]), x(w.week), y(w[s.ci][1]), "")
        .setAttribute("style", `stroke:${s.color};stroke-width:1.5;opacity:0.3`);
      teacherSvg.appendChild(svgEl("circle", {
        cx: x(w.week), cy: y(w[s.key]), r: 3.5,
        fill: s.color, stroke: "#fff", "stroke-width": 2, opacity: 0.4
      }));
    }
  }

  /* Difficulty strip: one square per week, single-hue ramp by average text difficulty. */
  svgText(teacherSvg, margin.left - 10, stripY + 8, "Texts", "end", "axis");
  for (const w of weeks) {
    const d = weightedDifficulty(w);
    teacherSvg.appendChild(svgEl("rect", {
      x: x(w.week) - 6, y: stripY, width: 12, height: 12, rx: 2,
      fill: rampColor(d), stroke: "#fff", "stroke-width": 2
    }));
  }

  /* Week axis labels: every 5th week plus endpoints, with month anchors. */
  for (const w of weeks) {
    if (w.week % 5 === 0 || w.week === xMin || w.week === xMax) {
      svgText(teacherSvg, x(w.week), height - margin.bottom + 22, String(w.week), "middle", "axis");
      svgText(teacherSvg, x(w.week), height - margin.bottom + 36, formatMonthShort(w.median_date), "middle", "axis-sub");
    }
  }
  svgText(teacherSvg, margin.left + innerW / 2, height - 6, "Week of class activity", "middle", "axis");

  /* Hover: one column band per week (>= 24px target), tooltip + crosshair. */
  const half = Math.max(14, innerW / Math.max(1, (xMax - xMin)) / 2);
  for (const w of weeks) {
    const hit = svgEl("rect", {
      x: x(w.week) - half, y: margin.top, width: half * 2, height: stripY + 14 - margin.top,
      fill: "transparent"
    });
    hit.addEventListener("mouseenter", () => showTeacherTooltip(w, x(w.week), y(w.vbm_adj)));
    hit.addEventListener("mouseleave", hideTeacherTooltip);
    hit.setAttribute("tabindex", "0");
    hit.addEventListener("focus", () => showTeacherTooltip(w, x(w.week), y(w.vbm_adj)));
    hit.addEventListener("blur", hideTeacherTooltip);
    teacherSvg.appendChild(hit);
  }
}

function weightedDifficulty(w) {
  if (!w.texts.length) return null;
  return w.texts.reduce((sum, t) => sum + t.d * t.share, 0);
}

function rampColor(d) {
  if (d == null) return "#e4e4e7";
  const [lo, hi] = DIFFICULTY_DOMAIN;
  const t = Math.min(1, Math.max(0, (d - lo) / (hi - lo)));
  return DIFFICULTY_RAMP[Math.min(DIFFICULTY_RAMP.length - 1, Math.floor(t * DIFFICULTY_RAMP.length))];
}

function showTeacherTooltip(w, px, py) {
  const svgBox = teacherSvg.getBoundingClientRect();
  const viewBox = teacherSvg.viewBox.baseVal;
  const scaleX = svgBox.width / viewBox.width;
  const scaleY = svgBox.height / viewBox.height;

  const texts = w.texts.map((t) =>
    `<li><span class="tt-dot" style="background:${rampColor(t.d)}"></span>` +
    `${escapeText(t.title)} <span class="tt-meta">difficulty ${t.d.toFixed(1)} · ${Math.round(t.share * 100)}% of work</span></li>`
  ).join("");

  teacherTooltip.innerHTML =
    `<div class="tt-title">Week ${w.week} <span class="tt-meta">(${formatMonthYear(w.median_date)}, ${w.n_students} students)</span></div>` +
    `<div class="tt-row"><span class="tt-swatch" style="background:${TEACHER_COLORS.raw}"></span>Actual ${formatPct(w.raw)} <span class="tt-meta">(${formatPct(w.raw_ci[0])}–${formatPct(w.raw_ci[1])})</span></div>` +
    `<div class="tt-row"><span class="tt-swatch" style="background:${TEACHER_COLORS.adjusted}"></span>Adjusted ${formatPct(w.vbm_adj)} <span class="tt-meta">(${formatPct(w.vbm_ci[0])}–${formatPct(w.vbm_ci[1])})</span></div>` +
    `<ul class="tt-texts">${texts}</ul>`;

  teacherTooltip.hidden = false;
  const wrap = teacherSvg.parentElement.getBoundingClientRect();
  let left = svgBox.left - wrap.left + px * scaleX + 14;
  const topPos = svgBox.top - wrap.top + py * scaleY - 10;
  if (left + teacherTooltip.offsetWidth > wrap.width - 8) {
    left = svgBox.left - wrap.left + px * scaleX - teacherTooltip.offsetWidth - 14;
  }
  teacherTooltip.style.left = `${Math.max(8, left)}px`;
  teacherTooltip.style.top = `${Math.max(8, topPos)}px`;
}

function hideTeacherTooltip() {
  teacherTooltip.hidden = true;
}

function renderTeacherTable(weeks) {
  teacherTableHead.innerHTML =
    "<tr><th>Week</th><th>When</th><th>Students</th><th>Actual (95% CI)</th>" +
    "<th>Adjusted V/BK/M (95% CI)</th><th>Adjusted pooled D (95% CI)</th><th>Texts read</th></tr>";
  teacherTableBody.innerHTML = weeks.map((w) => {
    const texts = w.texts.map((t) => `${escapeText(t.title)} (${t.d.toFixed(1)})`).join("; ");
    return `<tr><td>${w.week}</td><td>${formatMonthYear(w.median_date)}</td><td>${w.n_students}</td>` +
      `<td>${formatPct(w.raw)} (${formatPct(w.raw_ci[0])}–${formatPct(w.raw_ci[1])})</td>` +
      `<td>${formatPct(w.vbm_adj)} (${formatPct(w.vbm_ci[0])}–${formatPct(w.vbm_ci[1])})</td>` +
      `<td>${formatPct(w.pooled_adj)} (${formatPct(w.pooled_ci[0])}–${formatPct(w.pooled_ci[1])})</td>` +
      `<td class="tt-textcell">${texts}</td></tr>`;
  }).join("");
}

/* --- small helpers ------------------------------------------------------ */

function percentTicks(min, max, count) {
  /* Clean percentage steps (5/10/20pp) covering [min, max]. */
  const span = (max - min) * 100;
  const step = span / (count - 1) <= 6 ? 5 : span / (count - 1) <= 12 ? 10 : 20;
  const ticks = [];
  for (let t = Math.ceil(min * 100 / step) * step; t <= max * 100 + 1e-9; t += step) {
    ticks.push(t / 100);
  }
  return ticks;
}

function formatPct(v) {
  return `${(v * 100).toFixed(0)}%`;
}

function formatMonthYear(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatMonthShort(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short" });
}

function svgEl(tag, attrs) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function svgPath(parent, d, attrs) {
  const el = svgEl("path", { d, ...attrs });
  parent.appendChild(el);
  return el;
}

function svgLine(parent, x1, y1, x2, y2, className) {
  const el = svgEl("line", { x1, y1, x2, y2, class: className });
  parent.appendChild(el);
  return el;
}

function svgText(parent, x, y, text, anchor, className) {
  const el = svgEl("text", { x, y, "text-anchor": anchor, class: className });
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

function escapeText(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

window.addEventListener("resize", () => renderTeacherView());
initTeacherView();
