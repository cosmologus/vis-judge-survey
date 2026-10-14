// Exploration site for the survey corpus: two tabs (Findings, Corpus)
// and a shared paper sheet, on hash routes so GitHub Pages never 404s.
// Reads the flat tables in data/ (written by corpus/analysis/analysis.py).
"use strict";

const DATA = "data/";
const DIMS = [
  { key: "cue_cells", short: "D1 Cue", label: "D1 Prompt cue cell" },
  { key: "task_form", short: "D2 Task", label: "D2 Task form" },
  { key: "model_families", short: "D3 Model family",
    label: "D3 Model family" },
  { key: "chart_source", short: "D4 Chart source",
    label: "D4 Chart source" },
  { key: "ground_truth", short: "D4 Ground truth",
    label: "D4 Ground truth" },
  { key: "input_modality", short: "D5 Input", label: "D5 Input modality" },
  { key: "vis_type", short: "D6 Vis type", label: "D6 Visualization type" },
  { key: "judgment_role", short: "D7 Role",
    label: "D7 Role of the Judgment" },
];
const EXTRA = [
  ["judgment_object", "Judgment object"],
  ["contribution_type", "Contribution type"],
  ["judgment_evaluation", "How the Judgment is evaluated"],
  ["model_adaptation", "Model adaptation"],
  ["reasoning_models", "Reasoning Models"],
  ["application_domain", "Application domain"],
  ["independence_risk", "Independence risk"],
];
const CUE_ORDER = ["none×none", "possible×none", "possible×generic list",
  "possible×actual", "asserted×none", "asserted×generic list",
  "asserted×actual"];
const TASKS = ["verdict", "diagnose", "explain", "score", "compare",
  "advise", "fix", "get-misled"];
const YEARS = ["2023", "2024", "2025", "2026"];
const RQ3 = [
  ["rq3_cue", "Prompt cue"], ["rq3_task", "Task"],
  ["rq3_model_version", "Model version"],
  ["rq3_vis_set", "Visualization set"], ["rq3_ground_truth", "Ground truth"],
  ["rq3_metric_def", "Metric definition"],
  ["rq3_uncertainty", "Uncertainty (CI, SD, tests, runs)"],
];
const STATUS = ["explicit", "inferred", "missing"];
const H1_TEXT = "Holding the Model, task and visualization set fixed, a " +
  "stronger Prompt cue yields better detection of visualization defects.";

const app = document.getElementById("app");
const tip = document.getElementById("tip");
let P = [], A = [], C = [], K = [], H = [];
let byRid, armsBy, condBy, contrBy;

/* ---------------------------------------------------------- helpers */

const split = s => (s || "").split(";").map(x => x.trim()).filter(Boolean);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]));
const has = (p, key, v) => split(p[key]).includes(v);
const isNA = v => v == null || ["", "NA", "n/a", "None"].includes(v);
const show = v => isNA(v) ? "—" : v;
const fmt = n => n.toLocaleString("en");
const pct = (n, d) => d ? 100 * n / d : 0;
const css = name => getComputedStyle(document.documentElement)
  .getPropertyValue(name).trim();
const inkOn = fill => d3.lab(fill).l > 58 ? "#0b0b0b" : "#ffffff";
const plural = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;
// tooltip HTML goes through an attribute: escape the data, then the whole
const tipA = html => `data-tip="${esc(html)}"`;

function uncoded(v) {
  return v.includes("?") || v.split("×").some(x => isNA(x)) ||
    (isNA(v) && v !== "n/a");
}
function valueLabel(key, v) {
  if (key === "cue_cells" && v === "n/a") return "no Arms";
  if (key === "cue_cells") return v.replace("×", " × ");
  return v;
}
function valuesOf(key) {
  const c = new Map();
  for (const p of P) for (const v of split(p[key])) c.set(v, (c.get(v) || 0) + 1);
  const rank = v => key === "cue_cells" && CUE_ORDER.includes(v)
    ? CUE_ORDER.indexOf(v) - 99 : 0;
  return [...c].sort((a, b) =>
    uncoded(a[0]) - uncoded(b[0]) || rank(a[0]) - rank(b[0]) ||
    b[1] - a[1] || a[0].localeCompare(b[0]));
}
const cellOf = a => `${a.cue_assertion}×${a.cue_specificity}`;
const ridsOf = rows => new Set(rows.map(r => r.rid));
function links(p) {
  const l = [];
  if (p.doi) l.push(`<a href="https://doi.org/${esc(p.doi)}" target="_blank"
    rel="noopener">DOI</a>`);
  if (p.arxiv) l.push(`<a href="https://arxiv.org/abs/${esc(p.arxiv)}"
    target="_blank" rel="noopener">arXiv</a>`);
  return l.join(" · ");
}
function prettyValue(v) {
  if (isNA(v)) return "—";
  let s = v;
  try {
    const o = JSON.parse(v);
    if (o && typeof o === "object") {
      s = Object.entries(o).map(([k, x]) =>
        `${k}: ${typeof x === "object" ? JSON.stringify(x) : x}`).join(", ");
    }
  } catch (e) { /* plain text */ }
  return s.length > 160 ? s.slice(0, 157) + "…" : s;
}

/* ---------------------------------------------------------- tooltip */

let tipEl = null;
function placeTip(x, y) {
  const w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = Math.max(8, Math.min(x + 14, innerWidth - w - 8)) + "px";
  tip.style.top = (y + 16 + h > innerHeight ? y - h - 12 : y + 16) + "px";
}
function openTip(el) {
  tipEl = el; tip.innerHTML = el.dataset.tip; tip.style.display = "block";
}
function closeTip() { tipEl = null; tip.style.display = "none"; }
document.addEventListener("pointerover", e => {
  const el = e.target.closest("[data-tip]");
  if (el && el !== tipEl) openTip(el);
  if (!el) closeTip();
});
document.addEventListener("pointermove", e => {
  if (tipEl) placeTip(e.clientX, e.clientY);
});
document.addEventListener("focusin", e => {
  const el = e.target.closest("[data-tip]");
  if (!el) return closeTip();
  openTip(el);
  const r = el.getBoundingClientRect();
  placeTip(r.left + r.width / 2, r.bottom);
});
document.addEventListener("focusout", closeTip);
addEventListener("scroll", closeTip, { passive: true });

/* ---------------------------------------------------------- state */

const S = { filters: {}, q: "", sel: null, scroll: {} };
let SELS = new Map();          // selection key -> {label, rids}
let cur = null, prev = null;

function matches(p, skipKey) {
  for (const [k, set] of Object.entries(S.filters)) {
    if (k === skipKey || !set.size) continue;
    if (![...set].some(v => has(p, k, v))) return false;
  }
  if (S.q) {
    const q = S.q.toLowerCase();
    if (!`${p.title} ${p.rid} ${p.venue}`.toLowerCase().includes(q)) {
      return false;
    }
  }
  return true;
}

/* ---------------------------------------------------------- router */

function parse() {
  const [view, arg] = location.hash.replace(/^#\/?/, "").split("/");
  if (view === "paper" && byRid.has(arg)) return { view, arg };
  return { view: view === "corpus" ? "corpus" : "findings" };
}
function route() {
  if (cur && cur.view !== "paper") S.scroll[cur.view] = scrollY;
  prev = cur; cur = parse();
  closeTip();
  document.querySelectorAll(".tabs a").forEach(a => {
    const on = a.dataset.tab === cur.view;
    on ? a.setAttribute("aria-current", "page")
      : a.removeAttribute("aria-current");
  });
  const name = { findings: "Findings", corpus: "Corpus" }[cur.view] ||
    byRid.get(cur.arg).rid;
  document.title = `${name} · Models Judging Visualizations`;
  if (cur.view === "paper") { renderPaper(byRid.get(cur.arg)); scrollTo(0, 0); }
  else {
    (cur.view === "corpus" ? renderCorpus : renderFindings)();
    scrollTo(0, S.scroll[cur.view] || 0);
  }
}
addEventListener("hashchange", route);

/* ---------------------------------------------------------- theme */

const MOON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
  </svg>`;
const SUN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12"
  cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4
  M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const themeBtn = document.getElementById("theme");
const isDark = () => document.documentElement.dataset.theme === "dark";
function paintThemeBtn() {
  themeBtn.innerHTML = isDark() ? `${SUN}Light` : `${MOON}Dark`;
  themeBtn.setAttribute("aria-label",
    `Switch to ${isDark() ? "light" : "dark"} theme`);
}
themeBtn.onclick = () => {
  const dark = !isDark();
  if (dark) document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("theme", dark ? "dark" : "light"); }
  catch (e) { /* storage blocked: the choice lasts this visit */ }
  paintThemeBtn();
  // figure fills are read from the tokens at render time
  if (cur && cur.view !== "corpus") {
    const y = scrollY;
    cur.view === "paper" ? renderPaper(byRid.get(cur.arg)) : renderFindings();
    scrollTo(0, y);
  }
};
paintThemeBtn();

/* ---------------------------------------------------------- findings */

function selectable(fig, key, label, rows) {
  SELS.set(key, { fig, label, rids: ridsOf(rows) });
  const on = S.sel === key ? " on" : "";
  return { attrs: `data-sel="${esc(key)}"`, on };
}
function selBox(fig) {
  return `<div class="selbox" data-fig="${fig}" aria-live="polite"></div>`;
}
function paintSel() {
  document.querySelectorAll("[data-sel]").forEach(el =>
    el.classList.toggle("on", el.dataset.sel === S.sel));
  document.querySelectorAll(".selbox").forEach(box => {
    const s = S.sel && SELS.get(S.sel);
    if (!s || s.fig !== box.dataset.fig) { box.innerHTML = ""; return; }
    const ps = P.filter(p => s.rids.has(p.rid))
      .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
    box.innerHTML = `<div class="sel"><div class="hd">
      <span><b>${plural(ps.length, "paper", "papers")}</b>
        <span class="muted">· ${esc(s.label)}</span></span>
      <button type="button" class="x" aria-label="Close list">✕</button></div>
      <ul>${ps.map(p => `<li><a href="#/paper/${esc(p.rid)}"><span
        class="muted num">${esc(p.year)}</span> ${esc(p.title)}</a></li>`)
        .join("")}</ul></div>`;
    box.querySelector(".x").onclick = () => { S.sel = null; paintSel(); };
  });
}
function bindSel(root) {
  root.querySelectorAll("[data-sel]").forEach(el => el.onclick = () => {
    S.sel = S.sel === el.dataset.sel ? null : el.dataset.sel; paintSel();
  });
}

function figYears() {
  const panels = [["All papers", null], ["Judgment as object", "object"],
    ["Judgment as instrument", "instrument"],
    ["Judgment as component", "component"]];
  const count = (role, y) => P.filter(p => p.year === y &&
    (!role || has(p, "judgment_role", role)));
  const max = d3.max(YEARS, y => count(null, y).length);
  const recent = P.filter(p => p.year >= "2025").length;
  const rows = panels.map(([t, role]) => [t, ...YEARS.map(y =>
    count(role, y).length)]);
  const sm = panels.map(([title, role]) => `<div><h3>${title}</h3>
    <div class="cols">${YEARS.map(y => {
      const ps = count(role, y), n = ps.length, h = 120 * n / max;
      const s = selectable("years", `y:${role}:${y}`,
        `${title}, ${y}`, ps);
      return `<button type="button" class="col${s.on}" ${s.attrs}
        ${tipA(`<b>${n}</b> <span class="lab">papers</span><br>${title},
        ${y}${y === "2026" ? " (to September)" : ""}`)}
        aria-label="${esc(title)}, ${y}: ${n} papers"><i
        style="height:${h}px"></i><span style="bottom:${h + 3}px">${n}</span>
        </button>`;
    }).join("")}</div>
    <div class="xl">${YEARS.map(y => `<span>${y === "2026" ? "2026*" : y}
      </span>`).join("")}</div></div>`).join("");
  return `<section class="find" id="years">
    <div class="eyebrow">RQ1 · landscape</div>
    <h2>${recent} of ${P.length} papers appeared in 2025 or 2026</h2>
    <p>Papers per year of first public version. A paper can play more than
      one role, so the three role panels overlap.</p>
    <div class="fig"><div class="sm">${sm}</div>
      <div class="note">* 2026 up to September (search window 2022-01 to
        2026-09). Click a bar to list its papers.</div>
      ${table(["", ...YEARS], rows)}
    </div>${selBox("years")}</section>`;
}

function figCueTask() {
  const grid = d3.group(A, cellOf, a => a.task_form);
  const noType = A.filter(a => a.cue_specificity === "none").length;
  const rows = [...CUE_ORDER.map(c => [c, c.replace("×", " × ")]),
    ["*", "uncoded (? / NA)"]];
  const armsAt = (c, t) => c === "*"
    ? A.filter(a => !CUE_ORDER.includes(cellOf(a)) && a.task_form === t)
    : grid.get(c)?.get(t) || [];
  const max = d3.max(rows, ([c]) => d3.max(TASKS, t => armsAt(c, t).length));
  const ramp = d3.interpolateLab(css("--seq-lo"), css("--seq-hi"));
  const tableRows = rows.map(([c, lab]) => [lab,
    ...TASKS.map(t => armsAt(c, t).length)]);
  const body = rows.map(([c, lab]) => {
    const tot = d3.sum(TASKS, t => armsAt(c, t).length);
    return `<tr><th scope="row">${esc(lab)}</th>${TASKS.map(t => {
      const arms = armsAt(c, t), n = arms.length;
      if (!n) return "<td></td>";
      const fill = ramp(Math.sqrt(n / max));
      const s = selectable("cue", `c:${c}:${t}`, `${lab}, ${t}`, arms);
      const k = ridsOf(arms).size;
      return `<td class="c${s.on}" ${s.attrs} tabindex="0" role="button"
        style="background:${fill};color:${inkOn(fill)}"
        ${tipA(`<b>${n}</b> <span class="lab">${n === 1 ? "Arm" : "Arms"}
        in ${plural(k, "paper", "papers")}</span><br>${esc(lab)} · ${t}`)}
        aria-label="${esc(lab)}, ${t}: ${n} Arms">${n}</td>`;
    }).join("")}<td class="tot num">${tot}</td></tr>`;
  }).join("");
  return `<section class="find" id="cue">
    <div class="eyebrow">RQ1–RQ2 · Prompt cue</div>
    <h2>${pct(noType, A.length).toFixed(0)}% of Arms name no problem type
      to the Model</h2>
    <p>Each Arm crossed by its Prompt cue (how strongly the input says
      there is a problem × how specific it is) and its task. Rows go from
      no cue to an asserted, item-specific cue.</p>
    <div class="fig"><div class="scrollx"><table class="hm">
      <thead><tr><th></th>${TASKS.map(t => `<th scope="col">${t}</th>`)
        .join("")}<th class="tot">Arms</th></tr></thead>
      <tbody>${body}</tbody></table></div>
      <div class="note">n = ${fmt(A.length)} Arms; color is the Arm count
        (square-root scale). Click a cell to list its papers.</div>
      ${table(["Cue cell", ...TASKS], tableRows)}
    </div>${selBox("cue")}</section>`;
}

function figH1() {
  const pure = H.filter(r => r.factor_varied === "cue");
  const det = pure.filter(r => !r.not_eligible.includes("task"));
  const sens = H.filter(r => r.sensitivity === "True");
  const main = H.filter(r => r.main === "True");
  const stages = [
    ["all within-study contrasts in the corpus", K],
    ["vary only the Prompt cue", pure],
    ["… on a detection task (verdict, diagnose), with the cue rising", det],
    ["… and eligible: the metric has a quality direction and penalizes " +
      "false positives", main],
  ];
  const why = new Map();
  for (const r of sens) for (const x of split(r.excluded)) {
    const w = why.get(x) || { n: 0, rids: new Set() };
    w.n++; w.rids.add(r.rid); why.set(x, w);
  }
  const reason = {
    "fp_penalized = n": "the primary metric cannot penalize false positives",
    "metric_direction target-value":
      "the metric's ideal is a human level, not a maximum",
    "qualitative": "the result is qualitative",
    "metric_direction none": "the metric has no quality direction",
  };
  const byPaper = d3.rollups(sens, v => ({
    n: v.length, up: v.filter(r => r.outcome === "improve").length,
  }), r => r.rid);
  const support = byPaper.filter(([, v]) => v.up > v.n / 2).length;
  const funnel = stages.map(([lab, rows], i) => {
    const s = selectable("h1", `h:${i}`, lab, rows);
    return `<button type="button" class="fu${s.on}" ${s.attrs}
      ${tipA(`<b>${fmt(rows.length)}</b> <span class="lab">contrasts in
      ${plural(ridsOf(rows).size, "paper", "papers")}</span>`)}
      aria-label="${esc(lab)}: ${rows.length} contrasts"><span class="tr"><i
      style="width:${pct(rows.length, K.length)}%"></i></span>
      <b>${fmt(rows.length)}</b><span class="lab">${esc(lab)}</span></button>`;
  }).join("");
  return `<section class="find" id="h1">
    <div class="eyebrow">H1 · declared before the full coding</div>
    <h2>Whether the cue drives detection cannot be tested yet</h2>
    <div class="call"><p>H1: ${H1_TEXT}</p></div>
    <p>No paper in the corpus isolates the cue on a detection metric that
      counts false alarms, so no contrast is eligible and H1 is not
      testable.</p>
    <div class="fig"><div class="funnel">${funnel}</div>
      <div class="note">Why the ${det.length} detection contrasts drop out
        (a contrast can have several reasons):</div>
      <ul class="reasons">${[...why].sort((a, b) => b[1].n - a[1].n)
        .map(([k, w]) => `<li><b class="num">${w.n}</b> ${esc(reason[k] ||
          k)} <span class="muted">(${[...w.rids].join(", ")})</span></li>`)
        .join("")}</ul>
      <div class="note">Sensitivity analysis, with the excluded contrasts
        put back: ${plural(byPaper.length, "paper", "papers")},
        ${support} supporting H1.${byPaper.length < 3 ? ` With
        ${byPaper.length} papers the result is not interpretable.` : ""}
        Click a bar to list its papers.</div>
    </div>${selBox("h1")}</section>`;
}

function figReporting() {
  const full = A.filter(a => a.rq3_cue !== "abstract-only");
  const fill = Object.fromEntries(STATUS.map(s => [s, css(`--s-${s}`)]));
  const rows = RQ3.map(([f, lab]) => {
    const g = d3.group(full, a => a[f]);
    const segs = STATUS.map(s => {
      const arms = g.get(s) || [], p = pct(arms.length, full.length);
      if (!arms.length) return "";
      const sel = selectable("rq3", `r:${f}:${s}`, `${lab}: ${s}`, arms);
      return `<button type="button" class="${sel.on}" ${sel.attrs}
        style="width:${p}%;background:${fill[s]};color:${inkOn(fill[s])}"
        ${tipA(`<b>${p.toFixed(0)}%</b> <span class="lab">${arms.length}
        Arms in ${plural(ridsOf(arms).size, "paper", "papers")}</span><br>
        ${esc(lab)}: ${s}`)} aria-label="${esc(lab)}, ${s}: ${p.toFixed(0)}%"
        >${p >= 9 ? p.toFixed(0) + "%" : ""}</button>`;
    }).join("");
    return `<span>${esc(lab)}</span><div class="stack">${segs}</div>`;
  }).join("");
  const tbl = RQ3.map(([f, lab]) => [lab, ...STATUS.map(s =>
    `${pct(full.filter(a => a[f] === s).length, full.length).toFixed(0)}%`)]);
  const unc = pct(full.filter(a => a.rq3_uncertainty === "missing").length,
    full.length);
  return `<section class="find" id="rq3">
    <div class="eyebrow">RQ3 · reporting</div>
    <h2>Uncertainty is missing in ${unc.toFixed(0)}% of Arms</h2>
    <p>For each reporting item, whether the paper states it (explicit),
      lets a reader recover it (inferred) or leaves it out (missing).</p>
    <div class="fig"><div class="legend">${STATUS.map(s =>
      `<span><i style="background:${fill[s]}"></i>${s}</span>`).join("")}
      </div><div class="rq3">${rows}</div>
      <div class="note">n = ${full.length} Arms from papers read in full
        text. Click a segment to list its papers.</div>
      ${table(["Item", ...STATUS], tbl)}
    </div>${selBox("rq3")}</section>`;
}

function table(head, rows) {
  return `<details class="tbl"><summary>Show as table</summary>
    <div class="scrollx"><table class="dt"><thead><tr>${head.map((h, i) =>
      `<th class="${i ? "r" : ""}">${esc(h)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map((v, i) =>
      `<td class="${i ? "r" : ""}">${esc(v)}</td>`).join("")}</tr>`)
      .join("")}</tbody></table></div></details>`;
}

function renderFindings() {
  SELS = new Map();
  app.innerHTML = `<div class="narrow">
    <section class="hero">
      <div class="eyebrow">Survey · AI for visualization</div>
      <h1>How do (M)LLMs judge data visualizations?</h1>
      <p class="lede">${P.length} papers, ${d3.min(P, p => p.year)}–${
        d3.max(P, p => p.year)}, in which a Model
        judges a visualization: its quality, correctness or honesty. Each
        paper is coded into a seven-dimension Taxonomy, and each experiment
        into Arms and Conditions. Click any mark to see the papers behind
        it.</p>
      <div class="tiles">
        <div class="tile"><b>${P.length}</b>papers</div>
        <div class="tile"><b>${fmt(A.length)}</b>Arms</div>
        <div class="tile"><b>${fmt(C.length)}</b>Conditions</div>
        <div class="tile"><b>${fmt(K.length)}</b>within-study contrasts</div>
      </div>
    </section>
    ${figYears()}${figCueTask()}${figH1()}${figReporting()}
  </div>`;
  bindSel(app);
  paintSel();
}

/* ---------------------------------------------------------- corpus */

function renderCorpus() {
  const cols = DIMS.map(d => ({ ...d, vals: valuesOf(d.key) }));
  app.innerHTML = `<div class="ctl"><h1>Corpus</h1>
      <span id="cnt" class="muted"></span>
      <input type="search" placeholder="Search title, venue or id"
        aria-label="Search papers" value="${esc(S.q)}"></div>
    <div class="act" id="act"></div>
    <div class="mx"><table>
      <thead>
        <tr class="g"><th class="pc"></th>${cols.map(d =>
          `<th colspan="${d.vals.length}" title="${esc(d.label)}">${
            esc(d.short)}</th>`).join("")}</tr>
        <tr class="v"><th class="pc">Paper (${P.length})</th>${cols.map(d =>
          d.vals.map(([v, n], i) => `<th class="${i ? "" : "first"}"><button
            type="button" data-k="${d.key}" data-v="${esc(v)}"
            aria-pressed="false"
            ${tipA(`<b>${n}</b> <span class="lab">papers</span><br>${
              esc(d.label)}: ${esc(valueLabel(d.key, v))}`)}><span
            class="rot">${esc(valueLabel(d.key, v))}</span><span class="cnt"
            style="height:${2 + 34 * n / P.length}px"></span></button></th>`)
            .join("")).join("")}</tr>
      </thead>
      <tbody id="rows"></tbody></table></div>
    <p class="note">Each row is a paper and each column a value of a
      Taxonomy dimension; a dot means the paper has that value (dimensions
      are multi-label). Click a column to filter: values in one dimension
      combine with OR, dimensions with AND. Click a title to open the
      paper.</p>`;
  const updateRows = () => {
    const shown = P.filter(p => matches(p))
      .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
    app.querySelector("#cnt").textContent =
      `${shown.length} of ${P.length} papers`;
    app.querySelector("#rows").innerHTML = shown.length ? shown.map(p =>
      `<tr><td class="pc"><a href="#/paper/${esc(p.rid)}"
        title="${esc(p.title)}"><span class="muted num">${esc(p.year)}</span>
        ${esc(p.title)}</a></td>${cols.map(d => d.vals.map(([v], i) =>
        `<td class="c${i ? "" : " first"}">${has(p, d.key, v)
          ? `<span class="dot" aria-label="${esc(valueLabel(d.key, v))}">
            </span>` : ""}</td>`).join("")).join("")}</tr>`).join("")
      : `<tr><td class="pc empty">No paper matches.</td></tr>`;
    app.querySelectorAll("tr.v button").forEach(b => {
      const k = b.dataset.k, v = b.dataset.v;
      const on = !!S.filters[k]?.has(v);
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
      b.classList.toggle("zero", !on &&
        !P.some(p => matches(p, k) && has(p, k, v)));
    });
    const active = Object.entries(S.filters).flatMap(([k, s]) =>
      [...s].map(v => [k, v]));
    const act = app.querySelector("#act");
    act.innerHTML = active.length
      ? active.map(([k, v]) => `<button type="button" class="f"
          data-k="${k}" data-v="${esc(v)}">${esc(valueLabel(k, v))} ✕
          </button>`).join("") +
        `<button type="button" class="clr">Clear all</button>`
      : `<span class="muted">No filter.</span>`;
    act.querySelectorAll(".f").forEach(b => b.onclick = () =>
      toggle(b.dataset.k, b.dataset.v));
    act.querySelector(".clr")?.addEventListener("click", () => {
      S.filters = {}; updateRows();
    });
  };
  const toggle = (k, v) => {
    const s = S.filters[k] ??= new Set();
    s.has(v) ? s.delete(v) : s.add(v);
    if (!s.size) delete S.filters[k];
    updateRows();
  };
  app.querySelectorAll("tr.v button").forEach(b => b.onclick = () =>
    toggle(b.dataset.k, b.dataset.v));
  app.querySelector("input[type=search]").oninput = e => {
    S.q = e.target.value; updateRows();
  };
  updateRows();
}

/* ---------------------------------------------------------- paper */

function chips(key, value) {
  const vs = split(value);
  if (!vs.length || vs.every(isNA)) return '<span class="muted">—</span>';
  return vs.map(v => `<button type="button" class="chip" data-k="${key}"
    data-v="${esc(v)}" title="Show all papers with this value"
    >${esc(valueLabel(key, v))}</button>`).join("");
}
function plainChips(value) {
  const vs = split(value);
  if (!vs.length || vs.every(isNA)) return '<span class="muted">—</span>';
  return vs.map(v => `<span class="chip">${esc(v)}</span>`).join("");
}

function armSheet(a, conds) {
  const models = [...new Set(conds.map(c => c.model_string))];
  const fill = Object.fromEntries(STATUS.map(s => [s, css(`--s-${s}`)]));
  const kv = [
    ["Visualization set", a.vis_set], ["Input", a.input_modality],
    ["Cue channel", a.cue_channel],
    ["Flawed / control items", `${show(a.n_flawed)} / ${show(a.n_control)}`],
    ["Prompt source", a.prompt_source], ["Chain of thought", a.cot],
    ["Few-shot examples", a.few_shot], ["Pipeline", a.pipeline],
    ["Auxiliary input", a.aux_input],
  ].map(([k, v]) => `<dt>${k}</dt><dd>${esc(show(v))}</dd>`).join("");
  const rep = RQ3.map(([f, lab]) => STATUS.includes(a[f])
    ? `<span><i style="background:${fill[a[f]]}"></i>${esc(lab)}: ${a[f]}
      </span>` : `<span>${esc(lab)}: ${esc(show(a[f]))}</span>`).join("");
  const rows = conds.map(c => `<tr><td>${esc(c.model_string)}</td>
    <td>${esc(prettyValue(c.metric))}</td>
    <td>${esc(prettyValue(c.value))}</td>
    <td>${esc(show(c.vs_chance))}</td>
    <td>${esc(show(c.authors_verdict))}</td></tr>`).join("");
  const quotes = d3.groups(conds.filter(c => !isNA(c.verdict_quote)),
    c => c.verdict_quote);
  return `<details class="arm"><summary><b>${esc(a.arm_id)}</b> ·
      ${esc(a.task_form)} · cue ${esc(a.cue_assertion)} ×
      ${esc(a.cue_specificity)} · ${plural(conds.length, "Condition",
      "Conditions")}<div class="lbl small">${esc(a.label)}</div></summary>
    <div class="body">
      ${isNA(a.cue_quote) ? "" : `<div class="qlab">Prompt, quoted</div>
        <blockquote>${esc(a.cue_quote)}</blockquote>`}
      <dl class="kv small">${kv}</dl>
      <div class="qlab">Reporting (RQ3)</div><div class="rep">${rep}</div>
      <div class="qlab">Conditions (${models.length} Models)</div>
      <div class="scrollx"><table class="dt"><thead><tr><th>Model</th>
        <th>Metric</th><th>Value</th><th>vs chance</th>
        <th>Authors' verdict</th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      ${quotes.length ? `<div class="qlab">Authors' verdict, quoted</div>
        ${quotes.map(([q, cs]) => `<blockquote>${esc(q)}<span class="src">${
          esc(cs[0].verdict_loc)} · ${esc(cs.map(c => c.cond_id).join(", "))}
        </span></blockquote>`).join("")}` : ""}
    </div></details>`;
}

function renderPaper(p) {
  const arms = armsBy.get(p.rid) || [], conds = condBy.get(p.rid) || [];
  const contr = contrBy.get(p.rid) || [];
  const cls = p.class === "IN-MISLED"
    ? "Included: the Model gets misled by a misleading chart"
    : "Included: core (the Model judges the visualization)";
  const yrs = p.model_year_min === p.model_year_max ? show(p.model_year_min)
    : `${show(p.model_year_min)}–${show(p.model_year_max)}`;
  const contrRows = contr.map(c => `<tr><td>${esc(c.factor_varied)}</td>
    <td>${esc(c.model)}</td><td>${esc(c.from)} → ${esc(c.to)}</td>
    <td>${esc(c.direction)}</td><td>${esc(c.significance)}</td>
    <td>${esc(c.loc)}</td></tr>`).join("");
  app.innerHTML = `<article class="paper">
    <button type="button" class="back">← Back</button>
    <h1>${esc(p.title)}</h1>
    <div class="meta">${esc(p.year)} · ${esc(show(p.venue))}${
      links(p) ? " · " + links(p) : ""}</div>
    <div class="badges"><span class="chip">${esc(p.rid)}</span>
      <span class="chip">${cls}</span>
      <span class="chip">${p.fulltext === "abstract-only"
        ? "coded from the abstract only" : "coded from the full text"}</span>
      <span class="chip">found by ${p.found_by === "search"
        ? "database search" : "snowballing"}</span></div>
    <h2>Taxonomy</h2>
    <dl class="kv">${DIMS.map(d => `<dt>${d.label}</dt><dd>${
      chips(d.key, p[d.key])}</dd>`).join("")}</dl>
    <h2>Other coded fields</h2>
    <dl class="kv">${EXTRA.map(([k, lab]) => `<dt>${lab}</dt><dd>${
      plainChips(p[k])}</dd>`).join("")}
      <dt>Model release years</dt><dd>${esc(yrs)}</dd></dl>
    <h2>Evidence</h2>
    <div class="counts">
      <span><b>${arms.length}</b> Arms</span>
      <span><b>${conds.length}</b> Conditions</span>
      <span><b>${contr.length}</b> within-study contrasts</span>
      <span><b>${esc(show(p.reporting_inconsistencies))}</b> reporting
        inconsistencies</span></div>
    ${arms.length ? arms.map(a => armSheet(a,
      conds.filter(c => c.arm_id === a.arm_id))).join("")
      : `<p class="muted">No Arms: ${esc(show(p.no_arms_reason))}</p>`}
    ${contr.length ? `<details class="arm"><summary><b>Within-study
      contrasts</b> · ${contr.length}</summary><div class="body scrollx">
      <table class="dt"><thead><tr><th>Factor varied</th><th>Model</th>
      <th>From → to</th><th>Direction</th><th>Significance</th>
      <th>Where</th></tr></thead><tbody>${contrRows}</tbody></table>
      </div></details>` : ""}
  </article>`;
  app.querySelector(".back").onclick = () => {
    if (prev && prev.view !== "paper") history.back();
    else location.hash = "#/corpus";
  };
  app.querySelectorAll("button.chip").forEach(b => b.onclick = () => {
    S.filters = { [b.dataset.k]: new Set([b.dataset.v]) }; S.q = "";
    S.scroll.corpus = 0;
    location.hash = "#/corpus";
  });
}

/* ---------------------------------------------------------- about */

function renderAbout() {
  const m = location.hostname.match(/^([^.]+)\.github\.io$/);
  const repo = m ? `https://github.com/${m[1]}/${
    location.pathname.split("/")[1]}` : null;
  const codebook = repo ? `${repo}/blob/main/codebook.md` : "codebook.md";
  const files = ["papers", "arms", "conditions", "contrasts", "h1_contrasts"]
    .map(f => `<a href="${DATA}${f}.csv" download>${f}.csv</a>`).join(" · ");
  document.getElementById("about").innerHTML = `<h2>About</h2>
    <p>This site accompanies an MSc dissertation (in preparation) at the
      National University of Science and Technology POLITEHNICA Bucharest:
      a survey of studies in which a (multimodal) large language model
      judges a data visualization. The corpus was collected from OpenAlex
      and arXiv (window 2022-01 to 2026-09, snapshot 2026-10-04) plus
      backward and forward snowballing, and coded with the frozen codebook
      v1.7. A language model made the first coding pass; the author coded
      a blind sample, checked every exclusion and arbitrated the
      disagreements.</p>
    <dl>
      <dt>Model</dt><dd>an (M)LLM, VLM or foundation model</dd>
      <dt>Judgment</dt><dd>what a Model says about the visualization
        itself: its quality, correctness, honesty or rule conformance</dd>
      <dt>Prompt cue</dt><dd>how much the Model's input says that the
        visualization has a problem: assertion (none, possible, asserted)
        × specificity (none, generic list, actual)</dd>
      <dt>Arm</dt><dd>Prompt cue × task × set of visualizations, applied to
        one or more Models</dd>
      <dt>Condition</dt><dd>Arm × Model, with the reported result</dd>
      <dt>Contrast</dt><dd>a within-study pair of Conditions that differ in
        one factor</dd>
    </dl>
    <p><b>Data:</b> ${files} · <a href="${codebook}">codebook</a>${
      repo ? ` · <a href="${repo}">repository</a>` : ""}</p>
    <p class="muted">Quoted prompts and verdicts are short excerpts from
      the papers, reproduced for analysis with their source and location.
      Copyright in them stays with their authors. The coded data and the
      codebook are licensed under
      <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>,
      the site code under MIT.</p>`;
}

/* ---------------------------------------------------------- load */

Promise.all(["papers", "arms", "conditions", "contrasts", "h1_contrasts"]
  .map(f => d3.csv(`${DATA}${f}.csv`))).then(([p, a, c, k, h]) => {
  P = p; A = a; C = c; K = k; H = h;
  byRid = new Map(P.map(x => [x.rid, x]));
  armsBy = d3.group(A, d => d.rid);
  condBy = d3.group(C, d => d.rid);
  contrBy = d3.group(K, d => d.rid);
  renderAbout();
  route();
}).catch(err => {
  app.innerHTML = `<p style="padding:24px 0">Could not load the data
    (${esc(err.message)}).</p>`;
});
