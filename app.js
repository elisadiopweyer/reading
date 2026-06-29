const DATA = {
  week: [
    { period: 1, label: "Week 1", n: 29, unadjusted: 0.55441093, pooled_adjusted: 0.55800241, three_leg_adjusted: 0.55665523, vocab_adjusted: 0.55329818, bk_adjusted: 0.55060691, meaning_adjusted: 0.55162829 },
    { period: 2, label: "Week 2", n: 30, unadjusted: 0.52643305, pooled_adjusted: 0.50442761, three_leg_adjusted: 0.49553809, vocab_adjusted: 0.49068972, bk_adjusted: 0.5156424, meaning_adjusted: 0.52332658 },
    { period: 3, label: "Week 3", n: 28, unadjusted: 0.54248166, pooled_adjusted: 0.52131706, three_leg_adjusted: 0.51070881, vocab_adjusted: 0.50481677, bk_adjusted: 0.53499025, meaning_adjusted: 0.54025847 },
    { period: 4, label: "Week 4", n: 27, unadjusted: 0.5922612, pooled_adjusted: 0.57125705, three_leg_adjusted: 0.56628036, vocab_adjusted: 0.5655356, bk_adjusted: 0.58388996, meaning_adjusted: 0.59111732 },
    { period: 5, label: "Week 5", n: 30, unadjusted: 0.55032998, pooled_adjusted: 0.55312449, three_leg_adjusted: 0.56135082, vocab_adjusted: 0.57022297, bk_adjusted: 0.55713773, meaning_adjusted: 0.55510962 },
    { period: 6, label: "Week 6", n: 24, unadjusted: 0.51591492, pooled_adjusted: 0.49340886, three_leg_adjusted: 0.48213679, vocab_adjusted: 0.47569719, bk_adjusted: 0.50725013, meaning_adjusted: 0.5132345 },
    { period: 7, label: "Week 7", n: 29, unadjusted: 0.5203895, pooled_adjusted: 0.49413753, three_leg_adjusted: 0.4834992, vocab_adjusted: 0.47950825, bk_adjusted: 0.51450622, meaning_adjusted: 0.51986331 },
    { period: 8, label: "Week 8", n: 28, unadjusted: 0.59353578, pooled_adjusted: 0.54946297, three_leg_adjusted: 0.54172641, vocab_adjusted: 0.55129862, bk_adjusted: 0.60863173, meaning_adjusted: 0.60676146 },
    { period: 9, label: "Week 9", n: 27, unadjusted: 0.52919549, pooled_adjusted: 0.49998268, three_leg_adjusted: 0.49062037, vocab_adjusted: 0.48637372, bk_adjusted: 0.51425976, meaning_adjusted: 0.52544737 },
    { period: 10, label: "Week 10", n: 25, unadjusted: 0.66854775, pooled_adjusted: 0.66188246, three_leg_adjusted: 0.65875095, vocab_adjusted: 0.65532029, bk_adjusted: 0.65938401, meaning_adjusted: 0.66479963 },
    { period: 11, label: "Week 11", n: 28, unadjusted: 0.53236055, pooled_adjusted: 0.65394258, three_leg_adjusted: 0.68642461, vocab_adjusted: 0.6879186, bk_adjusted: 0.55647302, meaning_adjusted: 0.52886242 },
    { period: 12, label: "Week 12", n: 17, unadjusted: 0.61147636, pooled_adjusted: 0.71256286, three_leg_adjusted: 0.75418651, vocab_adjusted: 0.77316242, bk_adjusted: 0.64551651, meaning_adjusted: 0.61887372 }
  ],
  month: [
    { period: 1, label: "Month 1", n: 34, unadjusted: 0.55205268, pooled_adjusted: 0.53764743, three_leg_adjusted: 0.53378683, vocab_adjusted: 0.52977693, bk_adjusted: 0.54124242, meaning_adjusted: 0.55188185 },
    { period: 2, label: "Month 2", n: 31, unadjusted: 0.54675144, pooled_adjusted: 0.53219521, three_leg_adjusted: 0.52834678, vocab_adjusted: 0.52124965, bk_adjusted: 0.54213977, meaning_adjusted: 0.5467487 },
    { period: 3, label: "Month 3", n: 28, unadjusted: 0.55204159, pooled_adjusted: 0.57467979, three_leg_adjusted: 0.57704753, vocab_adjusted: 0.58424628, bk_adjusted: 0.55526233, meaning_adjusted: 0.55178916 },
    { period: 4, label: "Month 4", n: 27, unadjusted: 0.67509884, pooled_adjusted: 0.7043457, three_leg_adjusted: 0.70825195, vocab_adjusted: 0.71569514, bk_adjusted: 0.68574423, meaning_adjusted: 0.67498046 },
    { period: 5, label: "Month 5", n: 27, unadjusted: 0.66009128, pooled_adjusted: 0.662117, three_leg_adjusted: 0.6631555, vocab_adjusted: 0.66459322, bk_adjusted: 0.66145116, meaning_adjusted: 0.66013181 },
    { period: 6, label: "Month 6", n: 27, unadjusted: 0.66976887, pooled_adjusted: 0.63147497, three_leg_adjusted: 0.63366824, vocab_adjusted: 0.63673592, bk_adjusted: 0.6536113, meaning_adjusted: 0.67017138 },
    { period: 7, label: "Month 7", n: 23, unadjusted: 0.53076386, pooled_adjusted: 0.49244422, three_leg_adjusted: 0.49464959, vocab_adjusted: 0.49773091, bk_adjusted: 0.5146063, meaning_adjusted: 0.53116739 },
    { period: 8, label: "Month 8", n: 27, unadjusted: 0.67345399, pooled_adjusted: 0.72449392, three_leg_adjusted: 0.7223019, vocab_adjusted: 0.71346116, bk_adjusted: 0.70693779, meaning_adjusted: 0.67326558 }
  ]
};

const SERIES = {
  unadjusted: {
    label: "Unadjusted",
    tooltip: "Observed student-period average score before difficulty adjustment.",
    stroke: "#111",
    width: 2.5,
    dash: ""
  },
  pooled_adjusted: {
    label: "Pooled D",
    tooltip: "Adjusted by holding the pooled text difficulty score D at its sample mean.",
    stroke: "#111",
    width: 2.5,
    dash: "7 5"
  },
  three_leg_adjusted: {
    label: "V/BK/M",
    tooltip: "Adjusted by holding vocabulary, background knowledge, and meaning difficulty at their sample means.",
    stroke: "#111",
    width: 3.6,
    dash: ""
  },
  vocab_adjusted: {
    label: "Vocab",
    tooltip: "Adjusted by holding vocabulary difficulty at its sample mean.",
    stroke: "#111",
    width: 2.3,
    dash: "2 5"
  },
  bk_adjusted: {
    label: "BK",
    tooltip: "Adjusted by holding background knowledge difficulty at its sample mean.",
    stroke: "#111",
    width: 2.3,
    dash: "12 4 2 4"
  },
  meaning_adjusted: {
    label: "Meaning",
    tooltip: "Adjusted by holding meaning difficulty at its sample mean.",
    stroke: "#111",
    width: 3.2,
    dash: "5 4"
  }
};

const state = {
  period: "week",
  selected: new Set(["unadjusted", "pooled_adjusted", "three_leg_adjusted"])
};

const svg = document.getElementById("chart");
const summary = document.getElementById("summary");
const chartTitle = document.getElementById("chartTitle");
const modelEquation = document.getElementById("modelEquation");
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");

document.querySelectorAll("[data-period]").forEach((button) => {
  button.addEventListener("click", () => {
    state.period = button.dataset.period;
    document.querySelectorAll("[data-period]").forEach((node) => {
      const isActive = node.dataset.period === state.period;
      node.classList.toggle("active", isActive);
      node.setAttribute("aria-selected", String(isActive));
    });
    render();
  });
});

document.querySelectorAll("[data-series]").forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) {
      state.selected.add(input.dataset.series);
    } else {
      state.selected.delete(input.dataset.series);
    }
    render();
  });
});

window.addEventListener("resize", render);

function render() {
  const rows = DATA[state.period];
  const selected = [...state.selected];
  chartTitle.textContent = state.period === "week" ? "Week" : "Month";
  summary.innerHTML = `${rows.length} periods<br>${totalStudents(rows)} observations`;
  modelEquation.innerHTML = equationMarkup(state.period);
  renderChart(rows, selected);
  renderTable(rows, selected);
}

function equationMarkup(period) {
  const suffix = period === "week" ? "iw" : "im";
  const periodIndex = period === "week" ? "w" : "m";
  const periodName = period === "week" ? "relative week" : "relative month";
  return `
    <div class="equation-line">
      <span class="equation-name">Pooled</span>
      <div class="math-equation">
        <span class="math-var">Score</span><sub>${suffix}</sub>
        =
        <span class="math-var">α</span>
        +
        <span class="math-var">γ</span><sub>${periodIndex}</sub>
        +
        <span class="math-var">β</span><span class="math-var">D</span><sub>${suffix}</sub>
        +
        <span class="math-var">ε</span><sub>${suffix}</sub>
      </div>
    </div>
    <div class="equation-line">
      <span class="equation-name">Three-leg</span>
      <div class="math-equation">
        <span class="math-var">Score</span><sub>${suffix}</sub>
        =
        <span class="math-var">α</span>
        +
        <span class="math-var">γ</span><sub>${periodIndex}</sub>
        +
        <span class="math-var">β</span><sub>V</sub><span class="math-var">V</span><sub>${suffix}</sub>
        +
        <span class="math-var">β</span><sub>B</sub><span class="math-var">B</span><sub>${suffix}</sub>
        +
        <span class="math-var">β</span><sub>M</sub><span class="math-var">M</span><sub>${suffix}</sub>
        +
        <span class="math-var">ε</span><sub>${suffix}</sub>
      </div>
    </div>
    <div class="equation-line">
      <span class="equation-name">Adjusted D</span>
      <div class="math-equation">
        <span class="math-var">Score</span><sup>adj</sup><sub>${suffix}</sub>
        =
        <span class="math-var">Score</span><sub>${suffix}</sub>
        -
        <span class="math-hat">β</span>(<span class="math-var">D</span><sub>${suffix}</sub> - <span class="math-bar">D</span>)
      </div>
    </div>
    <div class="equation-line">
      <span class="equation-name">Adjusted V/BK/M</span>
      <div class="math-equation">
        <span class="math-var">Score</span><sup>adj</sup><sub>${suffix}</sub>
        =
        <span class="math-var">Score</span><sub>${suffix}</sub>
        -
        <span class="math-hat">β</span><sub>V</sub>(<span class="math-var">V</span><sub>${suffix}</sub> - <span class="math-bar">V</span>)
        -
        <span class="math-hat">β</span><sub>B</sub>(<span class="math-var">B</span><sub>${suffix}</sub> - <span class="math-bar">B</span>)
        -
        <span class="math-hat">β</span><sub>M</sub>(<span class="math-var">M</span><sub>${suffix}</sub> - <span class="math-bar">M</span>)
      </div>
    </div>
    <div class="equation-note">
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
    </div>
  `;
}

function renderChart(rows, selected) {
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

  const values = rows.flatMap((row) => selected.map((key) => row[key]));
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
    const path = rows.map((row, i) => `${i === 0 ? "M" : "L"} ${x(row.period)} ${y(row[key])}`).join(" ");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", path);
    line.setAttribute("class", "data-line");
    line.setAttribute("stroke", def.stroke);
    line.setAttribute("stroke-width", def.width);
    if (def.dash) line.setAttribute("stroke-dasharray", def.dash);
    svg.appendChild(line);

    rows.forEach((row) => {
      const point = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      point.setAttribute("cx", x(row.period));
      point.setAttribute("cy", y(row[key]));
      point.setAttribute("r", index === 0 ? 3.5 : 3);
      point.setAttribute("class", "data-point");
      point.setAttribute("stroke", def.stroke);
      svg.appendChild(point);
    });
  });

  renderLegend(selected, margin.left, 28);
}

function renderLegend(selected, startX, startY) {
  let xCursor = startX;
  selected.forEach((key) => {
    const def = SERIES[key];
    appendLine(svg, xCursor, startY, xCursor + 28, startY, "data-line", def.stroke, def.width, def.dash);
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
          const text = typeof value === "number" && column.key !== "n" ? value.toFixed(3) : value;
          return `<td>${text}</td>`;
        })
        .join("")}</tr>`;
    })
    .join("");
}

function headerLabel(column) {
  if (!column.tooltip) return column.label;
  return `<span class="hint" tabindex="0" data-tooltip="${column.tooltip}">${column.label}</span>`;
}

function totalStudents(rows) {
  return rows.reduce((sum, row) => sum + row.n, 0);
}

function makeTicks(min, max, count) {
  const ticks = [];
  const step = (max - min) / Math.max(1, count - 1);
  for (let i = 0; i < count; i += 1) {
    ticks.push(min + step * i);
  }
  return ticks;
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

render();
