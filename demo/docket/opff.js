/** Household finance surface. Charts cite the OPFF pack. */

function money(n) {
  const v = Number(n) || 0;
  const abs = Math.abs(v).toLocaleString(undefined, { maximumFractionDigits: 0 });
  return (v < 0 ? "−$" : "$") + abs;
}

function pct(n) {
  return `${(Number(n) || 0).toFixed(1)}%`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const PAL = ["#5e6ad2", "#3dd68c", "#f2c14e", "#eb5757", "#5ec8f2", "#c084fc", "#fb923c", "#94a3b8", "#f472b6", "#a3e635"];

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "cash", label: "Cash" },
  { id: "flow", label: "Cash flow" },
  { id: "spend", label: "Spending" },
  { id: "budget", label: "Budget" },
  { id: "invest", label: "Invested" },
  { id: "debt", label: "Debt" },
  { id: "goals", label: "Goals" },
  { id: "activity", label: "Activity" },
];

function modelOf(pack) {
  const snaps = pack.snapshots || [];
  const last = snaps[snaps.length - 1] || {};
  const accounts = pack.accounts || [];
  const budgets = pack.budgets || [];
  const goals = pack.goals || [];
  const txns = (pack.transactions || []).slice().sort((a, b) => String(b.date).localeCompare(a.date));
  const spend = txns.filter((t) => t.amount < 0 && t.category !== "Transfer");
  const byCat = {};
  for (const t of spend) byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount);
  const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const surplus = (last.income || 0) - (last.spend || 0);
  const cash = accounts.filter((a) => a.type === "depository").reduce((n, a) => n + a.balance, 0);
  const invest = accounts.filter((a) => a.type === "investment" || a.type === "retirement").reduce((n, a) => n + a.balance, 0);
  const home = accounts.filter((a) => a.type === "real_estate").reduce((n, a) => n + a.balance, 0);
  const debt = accounts.filter((a) => a.class === "liability").reduce((n, a) => n + a.balance, 0);
  const equity = home + (accounts.find((a) => a.id === "ACC-MTG")?.balance || 0);
  const months = last.spend ? cash / last.spend : 0;
  const rate = last.income ? (surplus / last.income) * 100 : 0;
  const card = accounts.find((a) => a.type === "credit" && a.limit);
  const util = card ? (Math.abs(card.balance) / card.limit) * 100 : 0;
  const alloc = [
    ["Cash", cash],
    ["Investments", accounts.filter((a) => a.type === "investment").reduce((n, a) => n + a.balance, 0)],
    ["Retirement", accounts.filter((a) => a.type === "retirement").reduce((n, a) => n + a.balance, 0)],
    ["Home", home],
  ].filter((r) => r[1] > 0);
  const debts = accounts.filter((a) => a.class === "liability").map((a) => [a.name, Math.abs(a.balance)]);
  return {
    pack, snaps, last, accounts, budgets, goals, txns, catRows, surplus, cash, invest, home, debt, equity, months, rate, card, util, alloc, debts,
  };
}

export function renderOpff(el, pack) {
  const m = modelOf(pack);
  let view = "overview";
  let acct = "";
  const ctl = {
    go(id, account) {
      view = id || view;
      acct = account || (id !== "activity" ? "" : acct);
      draw();
    },
    looking() { return view; },
  };
  const draw = () => {
    el.innerHTML = shell(m, view, acct);
    bind(el, m, {
      go: (id) => ctl.go(id),
      acct: (id) => { acct = id; view = "activity"; draw(); },
    });
    const nav = el.querySelector(".nav");
    const on = nav?.querySelector("button.on");
    if (nav && on) nav.scrollTo({ left: Math.max(0, on.offsetLeft - 12) });
    el._surface = ctl;
  };
  draw();
  return ctl;
}

export function steerOpff(pack, q) {
  q = String(q || "").toLowerCase();
  if (/budget/.test(q)) return { view: "budget" };
  if (/spend|categor|grocer|dining/.test(q)) return { view: "spend" };
  if (/cash flow|surplus|saving.?rate|income vs/.test(q)) return { view: "flow" };
  if (/emergenc/.test(q)) return { view: "cash" };
  if (/cash|checking|saving|hysa/.test(q)) return { view: "cash" };
  if (/invest|401|roth|hsa|allocat/.test(q)) return { view: "invest" };
  if (/debt|loan|mortgage|utiliz|visa/.test(q)) return { view: "debt" };
  if (/goal/.test(q)) return { view: "goals" };
  if (/activit|transaction|recent/.test(q)) return { view: "activity" };
  if (/net.?worth|overview|home equity/.test(q)) return { view: "overview" };
  if (/\bshow\b|\bopen\b|\blook\b/.test(q) && /flow/.test(q)) return { view: "flow" };
  return null;
}

function shell(m, view, acct) {
  const p = m.pack.project;
  return `<div class="kind opff">
    <aside class="rail">
      <p class="kicker">opff-editor</p>
      <h2>${esc(p.name)}</h2>
      <p class="who">${esc((p.people || []).join(" · "))} · fictional</p>
      <nav class="nav">${NAV.map((n) => {
        const extra = n.id === "overview" ? money(m.last.net_worth)
          : n.id === "cash" ? money(m.cash)
          : n.id === "budget" ? `${m.budgets.filter((b) => b.actual > b.budget).length} over`
          : "";
        return `<button type="button" data-go="${n.id}" class="${view === n.id ? "on" : ""}">${esc(n.label)}${extra ? `<em>${esc(extra)}</em>` : ""}</button>`;
      }).join("")}</nav>
      <div class="accts">
        <h3>Accounts</h3>
        ${m.accounts.map((a) => `<button type="button" data-acct="${esc(a.id)}" class="${a.class}${acct === a.id ? " on" : ""}">
          <span>${esc(a.name)}<small>${esc(a.institution)}</small></span>
          <b>${money(a.balance)}</b>
        </button>`).join("")}
      </div>
    </aside>
    <main class="stage" data-view="${esc(view)}">${stage(m, view, acct)}</main>
  </div>`;
}

function stage(m, view, acct) {
  if (view === "cash") return cashView(m);
  if (view === "flow") return flowView(m);
  if (view === "spend") return spendView(m);
  if (view === "budget") return budgetView(m);
  if (view === "invest") return investView(m);
  if (view === "debt") return debtView(m);
  if (view === "goals") return goalsView(m);
  if (view === "activity") return activityView(m, acct);
  return overview(m);
}

function overview(m) {
  return `
    <h2>Overview</h2>
    <p class="lead">As of ${esc(m.pack.project.as_of || m.last.month || "")}. Hover a chart — the number is that month.</p>
    <div class="kpis">
      ${kpi("Net worth", money(m.last.net_worth), m.last.net_worth >= 0 ? "up" : "down", "assets − debt", "overview")}
      ${kpi("Cash", money(m.cash), "ok", "checking · savings · HYSA", "cash")}
      ${kpi("This month", money(m.surplus), m.surplus >= 0 ? "up" : "down", `${money(m.last.income)} in / ${money(m.last.spend)} out`, "flow")}
      ${kpi("Savings rate", pct(m.rate), m.rate >= 15 ? "up" : "down", "surplus ÷ income", "flow")}
    </div>
    <div class="charts">
      <section class="panel">${panelHead("Net worth", `${money(m.last.net_worth)} · ${esc(m.last.month || "")}`)} ${lineChart("nw", m.snaps.map((s) => ({ label: s.month, v: s.net_worth })), "#3dd68c")}</section>
      <section class="panel">${panelHead("Assets", "Cash · invested · house")} ${stackArea("assets", m.snaps)}</section>
      <section class="panel">${panelHead("Income vs spend", `${money(m.last.income)} / ${money(m.last.spend)}`)} ${groupBar("flow", m.snaps)}</section>
      <section class="panel">${panelHead("Spending", money(m.catRows.reduce((n, r) => n + r[1], 0)))} ${donut("cats", m.catRows)}</section>
    </div>`;
}

function cashView(m) {
  const rows = m.accounts.filter((a) => a.type === "depository");
  return `
    <h2>Cash</h2>
    <p class="lead">${money(m.cash)} across ${rows.length} accounts · ${m.months.toFixed(1)} months of spend.</p>
    <div class="kpis">
      ${kpi("Cash", money(m.cash), "ok", "liquid", "cash")}
      ${kpi("Emergency", `${m.months.toFixed(1)} mo`, m.months >= 6 ? "up" : m.months >= 3 ? "ok" : "down", "cash ÷ monthly spend", "goals")}
      ${kpi("Checking", money(rows.find((a) => a.id === "ACC-CHK")?.balance), "ok", "Harbor Credit Union", "activity")}
      ${kpi("HYSA", money(rows.find((a) => a.id === "ACC-HYSA")?.balance), "ok", "North Cash", "activity")}
    </div>
    <div class="charts">
      <section class="panel">${panelHead("Cash over time", money(m.last.cash))} ${lineChart("cash", m.snaps.map((s) => ({ label: s.month, v: s.cash })), "#5ec8f2")}</section>
      <section class="panel">${panelHead("Emergency fund", `${money(m.cash)} / $66,900`)} ${goalBars(m.goals.filter((g) => g.id === "G-EF"))}</section>
      <section class="panel span">${chartTitle("Cash accounts")} ${accountTable(rows)}</section>
    </div>`;
}

function flowView(m) {
  return `
    <h2>Cash flow</h2>
    <p class="lead">Hover a month. Income, spend, and surplus replace the header.</p>
    <div class="kpis">
      ${kpi("Income", money(m.last.income), "up", m.last.month, "flow")}
      ${kpi("Spend", money(m.last.spend), "down", "this month", "spend")}
      ${kpi("Surplus", money(m.surplus), m.surplus >= 0 ? "up" : "down", pct(m.rate), "flow")}
      ${kpi("Savings rate", pct(m.rate), m.rate >= 15 ? "up" : "down", "surplus ÷ income", "flow")}
    </div>
    <div class="charts">
      <section class="panel">${panelHead("Income vs spend", `${money(m.last.income)} in · ${money(m.last.spend)} out`)} ${groupBar("flow", m.snaps)}</section>
      <section class="panel">${panelHead("Monthly surplus", money(m.surplus))} ${lineChart("surplus", m.snaps.map((s) => ({ label: s.month, v: (s.income || 0) - (s.spend || 0) })), "#5ec8f2")}</section>
    </div>`;
}

function spendView(m) {
  const total = m.catRows.reduce((n, r) => n + r[1], 0);
  return `
    <h2>Spending</h2>
    <p class="lead">Twelve months in the pack. Hover a slice — the hole is that category.</p>
    <div class="charts">
      <section class="panel">${panelHead("By category", money(total))} ${donut("cats", m.catRows)}</section>
      <section class="panel">${panelHead("Budget this month", "actual / plan")} ${hBars(m.budgets)}</section>
      <section class="panel span">${chartTitle("Recent spend")} ${txnTable(m.txns.filter((t) => t.amount < 0 && t.category !== "Transfer").slice(0, 16))}</section>
    </div>`;
}

function budgetView(m) {
  const over = m.budgets.filter((b) => b.actual > b.budget);
  return `
    <h2>Budget</h2>
    <p class="lead">${over.length ? over.length + " categories over this month." : "Every category is inside the plan."} Hover a row.</p>
    <div class="charts">
      <section class="panel span">${panelHead("Budget vs actual", over.length ? over.map((b) => b.category).join(" · ") : "on plan")} ${hBars(m.budgets)}</section>
    </div>`;
}

function investView(m) {
  const rows = m.accounts.filter((a) => a.type === "investment" || a.type === "retirement");
  return `
    <h2>Invested</h2>
    <p class="lead">${money(m.invest)} in brokerage, 401(k), Roth, and HSA. House is on the allocation chart.</p>
    <div class="charts">
      <section class="panel">${panelHead("Allocation", money(m.cash + m.invest + m.home))} ${donut("alloc", m.alloc)}</section>
      <section class="panel">${panelHead("Invested over time", money(m.last.investments))} ${lineChart("inv", m.snaps.map((s) => ({ label: s.month, v: s.investments })), "#5e6ad2")}</section>
      <section class="panel span">${chartTitle("Investment accounts")} ${accountTable(rows)}</section>
    </div>`;
}

function debtView(m) {
  return `
    <h2>Debt</h2>
    <p class="lead">${money(m.debt)} · mortgage, Civic loan, Harbor Visa. Hover the mix.</p>
    <div class="kpis">
      ${kpi("Debt", money(m.debt), "down", "liabilities", "debt")}
      ${kpi("Home equity", money(m.equity), "up", `${money(m.home)} house`, "invest")}
      ${kpi("Utilization", pct(m.util), m.util >= 30 ? "down" : "ok", m.card ? `${money(Math.abs(m.card.balance))} / ${money(m.card.limit)}` : "", "debt")}
    </div>
    <div class="charts">
      <section class="panel">${panelHead("Debt mix", money(Math.abs(m.debt)))} ${donut("debt", m.debts)}</section>
      <section class="panel">${panelHead("Credit utilization", pct(m.util))} ${gauge(m.util, m.card ? `${esc(m.card.name)} ${pct(m.util)} of ${money(m.card.limit)} · keep under 30%` : "")}</section>
      <section class="panel span">${chartTitle("Liabilities")} ${accountTable(m.accounts.filter((a) => a.class === "liability"))}</section>
    </div>`;
}

function goalsView(m) {
  return `
    <h2>Goals</h2>
    <p class="lead">Four targets in the pack. Hover a bar for leftover.</p>
    <div class="charts">
      <section class="panel span">${panelHead("Progress", `${m.goals.length} goals`)} ${goalBars(m.goals)}</section>
    </div>`;
}

function activityView(m, acct) {
  const rows = acct ? m.txns.filter((t) => t.account === acct) : m.txns;
  const name = m.accounts.find((a) => a.id === acct)?.name;
  return `
    <h2>Activity</h2>
    <p class="lead">${name ? esc(name) + " · " : ""}${rows.length} lines in this view.</p>
    <div class="charts">
      <section class="panel span">${chartTitle(name || "Recent activity")} ${txnTable(rows.slice(0, 28))}</section>
    </div>`;
}

function kpi(label, value, tone, sub, go) {
  return `<button type="button" class="kpi ${tone}" data-go="${go || "overview"}"><span>${esc(label)}</span><b>${esc(value)}</b>${sub ? `<em>${esc(sub)}</em>` : ""}</button>`;
}
function chartTitle(t) {
  return `<div class="head"><h3>${esc(t)}</h3></div>`;
}
function panelHead(title, readout) {
  return `<div class="head"><h3>${esc(title)}</h3><p class="readout mute" data-readout>${esc(readout)}</p></div>`;
}

function lineChart(id, pts, color) {
  if (!pts.length) return "";
  const w = 420, h = 200, p = 28;
  const vs = pts.map((d) => d.v);
  const min = Math.min(...vs, 0);
  const max = Math.max(...vs, 0);
  const span = max - min || 1;
  const x = (i) => p + (i / Math.max(pts.length - 1, 1)) * (w - p * 2);
  const y = (v) => h - p - ((v - min) / span) * (h - p * 2);
  const d = pts.map((pt, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(pt.v).toFixed(1)}`).join(" ");
  const zero = min < 0 && max > 0 ? `<line x1="${p}" x2="${w - p}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" stroke="#232326"/>` : "";
  const ticks = pts.filter((_, i) => i % 2 === 0).map((pt, i) =>
    `<text x="${x(i * 2).toFixed(1)}" y="${h - 6}" text-anchor="middle">${esc(String(pt.label).slice(2))}</text>`
  ).join("");
  const hits = pts.map((pt, i) => {
    const left = i === 0 ? p : (x(i) + x(i - 1)) / 2;
    const right = i === pts.length - 1 ? w - p : (x(i) + x(i + 1)) / 2;
    return `<rect class="hit" data-i="${i}" x="${left}" y="${p}" width="${Math.max(right - left, 4)}" height="${h - p * 2}"/>`;
  }).join("");
  return `<svg class="chart" data-line="${id}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    ${zero}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2"/>
    ${pts.map((pt, i) => `<circle data-pt="${i}" cx="${x(i).toFixed(1)}" cy="${y(pt.v).toFixed(1)}" r="2.2" fill="${color}"/>`).join("")}
    <line class="rule" x1="0" x2="0" y1="${p}" y2="${h - p}" hidden/>
    <circle class="dot" r="4.5" fill="${color}" hidden/>
    ${ticks}
    ${hits}
  </svg>`;
}

function stackArea(id, snaps) {
  const keys = ["cash", "investments", "home"];
  const colors = ["#5ec8f2", "#5e6ad2", "#f2c14e"];
  const labels = ["Cash", "Invested", "Home"];
  if (!snaps.length) return "";
  const w = 420, h = 200, p = 28;
  const totals = snaps.map((s) => keys.reduce((n, k) => n + (Number(s[k]) || 0), 0));
  const max = Math.max(...totals, 1);
  const x = (i) => p + (i / Math.max(snaps.length - 1, 1)) * (w - p * 2);
  const y = (v) => h - p - (v / max) * (h - p * 2);
  const layers = keys.map((key, li) => {
    const top = snaps.map((s, i) => {
      const v = keys.slice(0, li + 1).reduce((n, k) => n + (Number(s[k]) || 0), 0);
      return `${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    });
    const bot = snaps.map((s, i) => {
      const v = keys.slice(0, li).reduce((n, k) => n + (Number(s[k]) || 0), 0);
      return `${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    }).reverse();
    return `<path d="M${top.join("L")}L${bot.join("L")}Z" fill="${colors[li]}" opacity="0.88"/>`;
  }).join("");
  const ticks = snaps.filter((_, i) => i % 2 === 0).map((s, i) =>
    `<text x="${x(i * 2).toFixed(1)}" y="${h - 6}" text-anchor="middle">${esc(s.month.slice(2))}</text>`
  ).join("");
  const hits = snaps.map((_, i) => {
    const left = i === 0 ? p : (x(i) + x(i - 1)) / 2;
    const right = i === snaps.length - 1 ? w - p : (x(i) + x(i + 1)) / 2;
    return `<rect class="hit" data-i="${i}" x="${left}" y="${p}" width="${Math.max(right - left, 4)}" height="${h - p * 2}"/>`;
  }).join("");
  return `<svg class="chart" data-stack="${id}" viewBox="0 0 ${w} ${h}">${layers}${ticks}
    <line class="rule" x1="0" x2="0" y1="${p}" y2="${h - p}" hidden/>
    ${hits}
  </svg><p class="legend">${labels.map((name, i) => `<i style="background:${colors[i]}"></i>${esc(name)}`).join(" ")}</p>`;
}

function groupBar(id, snaps) {
  const w = 420, h = 200, p = 28;
  const max = Math.max(...snaps.flatMap((s) => [s.income, s.spend]), 1);
  const slot = (w - p * 2) / snaps.length;
  const bars = snaps.map((s, i) => {
    const x = p + i * slot;
    const h1 = (s.income / max) * (h - p * 2);
    const h2 = (s.spend / max) * (h - p * 2);
    return `<g class="bar" data-i="${i}">
      <rect x="${x + 3}" y="${h - p - h1}" width="${slot / 2 - 4}" height="${h1}" fill="#3dd68c"/>
      <rect x="${x + slot / 2}" y="${h - p - h2}" width="${slot / 2 - 4}" height="${h2}" fill="#eb5757"/>
      <rect class="hit" data-i="${i}" x="${x}" y="${p}" width="${slot}" height="${h - p * 2}"/>
      <text x="${x + slot / 2}" y="${h - 6}" text-anchor="middle">${esc(s.month.slice(5))}</text>
    </g>`;
  }).join("");
  return `<svg class="chart" data-bars="${id}" viewBox="0 0 ${w} ${h}">${bars}</svg>
    <p class="legend"><i style="background:#3dd68c"></i>Income <i style="background:#eb5757"></i>Spend</p>`;
}

function donut(id, rows) {
  const total = rows.reduce((n, r) => n + r[1], 0) || 1;
  let a = -Math.PI / 2;
  const cx = 84, cy = 84, r = 62, ir = 38;
  const slices = rows.map(([name, v], i) => {
    const sweep = (v / total) * Math.PI * 2;
    const b = a + sweep;
    const large = sweep > Math.PI ? 1 : 0;
    const p = `M ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} A ${r} ${r} 0 ${large} 1 ${cx + Math.cos(b) * r} ${cy + Math.sin(b) * r} L ${cx + Math.cos(b) * ir} ${cy + Math.sin(b) * ir} A ${ir} ${ir} 0 ${large} 0 ${cx + Math.cos(a) * ir} ${cy + Math.sin(a) * ir} Z`;
    a = b;
    return `<path data-i="${i}" d="${p}" fill="${PAL[i % PAL.length]}"></path>`;
  }).join("");
  const legend = rows.map(([name, v], i) => `<li data-i="${i}"><i style="background:${PAL[i % PAL.length]}"></i>${esc(name)} <b>${money(v)}</b></li>`).join("");
  return `<div class="donut" data-donut="${id}" data-total="${total}">
    <div class="donut-wrap">
      <svg viewBox="0 0 168 168">${slices}</svg>
      <div class="hole"><b>${money(total)}</b><span>twelve months</span></div>
    </div>
    <ol>${legend}</ol>
  </div>`;
}

function hBars(rows) {
  const max = Math.max(...rows.flatMap((r) => [r.budget, r.actual]), 1);
  return `<div class="hbars">${rows.map((r) => {
    const over = r.actual > r.budget;
    const left = (r.budget || 0) - (r.actual || 0);
    return `<div class="hbar" data-tip="${esc(r.category)} · ${money(r.actual)} of ${money(r.budget)} · ${left >= 0 ? money(left) + " left" : money(-left) + " over"}">
      <span>${esc(r.category)}</span>
      <div class="track">
        <i class="budget" style="width:${(r.budget / max) * 100}%"></i>
        <i class="actual ${over ? "over" : ""}" style="width:${(r.actual / max) * 100}%"></i>
      </div>
      <em>${money(r.actual)} / ${money(r.budget)}</em>
    </div>`;
  }).join("")}</div>`;
}

function goalBars(rows) {
  if (!rows.length) return "<p class='lead'>No goals in this pack.</p>";
  return `<div class="hbars goals">${rows.map((r) => {
    const t = Number(r.target) || 1;
    const c = Number(r.current) || 0;
    const done = c >= t;
    return `<div class="hbar" data-tip="${esc(r.name)} · ${money(c)} of ${money(t)} · ${done ? "met" : money(t - c) + " to go"}">
      <span>${esc(r.name)}</span>
      <div class="track"><i class="actual ${done ? "met" : ""}" style="width:${Math.min(100, (c / t) * 100)}%"></i></div>
      <em>${money(c)} / ${money(t)}</em>
    </div>`;
  }).join("")}</div>`;
}

function gauge(util, caption) {
  return `<div class="gauge">
    <div class="track">
      <i class="fill ${util >= 30 ? "over" : ""}" style="width:${Math.min(100, util)}%"></i>
      <em style="left:30%"></em>
    </div>
    <p>${caption}</p>
  </div>`;
}

function accountTable(accounts) {
  return `<table class="acct"><thead><tr><th>Account</th><th>Type</th><th>Balance</th></tr></thead><tbody>
    ${accounts.map((a) => `<tr class="${a.class}">
      <td>${esc(a.name)}<small>${esc(a.institution)}</small></td>
      <td>${esc(a.type.replace("_", " "))}</td>
      <td>${money(a.balance)}</td>
    </tr>`).join("")}
  </tbody></table>`;
}

function txnTable(rows) {
  return `<table class="txn"><thead><tr><th>Date</th><th>Payee</th><th>Category</th><th>Amount</th></tr></thead><tbody>
    ${rows.map((t) => `<tr class="${t.amount < 0 ? "out" : "in"}">
      <td>${esc(t.date)}</td><td>${esc(t.payee)}</td><td>${esc(t.category)}</td><td>${money(t.amount)}</td>
    </tr>`).join("")}
  </tbody></table>`;
}

function setReadout(box, text, live) {
  const el = box.querySelector("[data-readout]");
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("mute", !live);
}

function bind(root, m, actions) {
  root.querySelectorAll("[data-go]").forEach((b) => {
    b.addEventListener("click", () => actions.go(b.dataset.go));
  });
  root.querySelectorAll("[data-acct]").forEach((b) => {
    b.addEventListener("click", () => actions.acct(b.dataset.acct));
  });
  root.querySelectorAll("[data-line]").forEach((svg) => {
    const box = svg.closest(".panel");
    const id = svg.dataset.line;
    const pts = id === "nw" ? m.snaps.map((s) => ({ label: s.month, v: s.net_worth }))
      : id === "cash" ? m.snaps.map((s) => ({ label: s.month, v: s.cash }))
      : id === "inv" ? m.snaps.map((s) => ({ label: s.month, v: s.investments }))
      : m.snaps.map((s) => ({ label: s.month, v: (s.income || 0) - (s.spend || 0) }));
    const rule = svg.querySelector(".rule");
    const dot = svg.querySelector(".dot");
    const rest = box.querySelector("[data-readout]")?.textContent || "";
    svg.querySelectorAll(".hit").forEach((hit) => {
      hit.addEventListener("pointerenter", () => {
        const i = +hit.dataset.i;
        const pt = pts[i];
        const c = svg.querySelector(`[data-pt="${i}"]`);
        if (rule && c) {
          rule.setAttribute("x1", c.getAttribute("cx"));
          rule.setAttribute("x2", c.getAttribute("cx"));
          rule.removeAttribute("hidden");
        }
        if (dot && c) {
          dot.setAttribute("cx", c.getAttribute("cx"));
          dot.setAttribute("cy", c.getAttribute("cy"));
          dot.removeAttribute("hidden");
        }
        setReadout(box, `${money(pt.v)} · ${pt.label}`, true);
      });
      hit.addEventListener("pointerleave", () => {
        rule?.setAttribute("hidden", "");
        dot?.setAttribute("hidden", "");
        setReadout(box, rest, false);
      });
    });
  });
  root.querySelectorAll("[data-stack]").forEach((svg) => {
    const box = svg.closest(".panel");
    const rest = box.querySelector("[data-readout]")?.textContent || "";
    const rule = svg.querySelector(".rule");
    svg.querySelectorAll(".hit").forEach((hit) => {
      hit.addEventListener("pointerenter", () => {
        const s = m.snaps[+hit.dataset.i];
        const c = svg.querySelectorAll(".hit")[+hit.dataset.i];
        const x = Number(c.getAttribute("x")) + Number(c.getAttribute("width")) / 2;
        if (rule) {
          rule.setAttribute("x1", x);
          rule.setAttribute("x2", x);
          rule.removeAttribute("hidden");
        }
        setReadout(box, `${s.month} · cash ${money(s.cash)} · invested ${money(s.investments)} · home ${money(s.home)}`, true);
      });
      hit.addEventListener("pointerleave", () => {
        rule?.setAttribute("hidden", "");
        setReadout(box, rest, false);
      });
    });
  });
  root.querySelectorAll("[data-bars]").forEach((svg) => {
    const box = svg.closest(".panel");
    const rest = box.querySelector("[data-readout]")?.textContent || "";
    svg.querySelectorAll(".hit").forEach((hit) => {
      hit.addEventListener("pointerenter", () => {
        const s = m.snaps[+hit.dataset.i];
        svg.classList.add("dim");
        svg.querySelector(`.bar[data-i="${hit.dataset.i}"]`)?.classList.add("on");
        const sur = (s.income || 0) - (s.spend || 0);
        setReadout(box, `${s.month} · in ${money(s.income)} · out ${money(s.spend)} · ${money(sur)}`, true);
      });
      hit.addEventListener("pointerleave", () => {
        svg.classList.remove("dim");
        svg.querySelectorAll(".bar.on").forEach((g) => g.classList.remove("on"));
        setReadout(box, rest, false);
      });
    });
  });
  root.querySelectorAll("[data-donut]").forEach((wrap) => {
    const box = wrap.closest(".panel");
    const rest = box.querySelector("[data-readout]")?.textContent || "";
    const hole = wrap.querySelector(".hole");
    const holeRest = hole ? hole.innerHTML : "";
    const rows = wrap.dataset.donut === "cats" ? m.catRows
      : wrap.dataset.donut === "alloc" ? m.alloc
      : m.debts;
    const total = Number(wrap.dataset.total) || rows.reduce((n, r) => n + r[1], 0);
    const paint = (i) => {
      wrap.classList.toggle("dim", i != null);
      wrap.querySelectorAll("path, li").forEach((n) => n.classList.toggle("on", n.dataset.i === String(i)));
      if (i == null) {
        setReadout(box, rest, false);
        if (hole) hole.innerHTML = holeRest;
        return;
      }
      const [name, v] = rows[i];
      setReadout(box, `${name} · ${money(v)} · ${pct((v / total) * 100)}`, true);
      if (hole) hole.innerHTML = `<b>${money(v)}</b><span>${esc(name)}</span>`;
    };
    wrap.querySelectorAll("path, li").forEach((n) => {
      n.addEventListener("pointerenter", () => paint(+n.dataset.i));
      n.addEventListener("pointerleave", () => paint(null));
    });
  });
  root.querySelectorAll(".hbar[data-tip]").forEach((row) => {
    const box = row.closest(".panel");
    const rest = box?.querySelector("[data-readout]")?.textContent || "";
    row.addEventListener("pointerenter", () => setReadout(box, row.dataset.tip, true));
    row.addEventListener("pointerleave", () => setReadout(box, rest, false));
  });
}

export function answerOpff(pack, q) {
  const snaps = pack.snapshots || [];
  const last = snaps[snaps.length - 1] || {};
  const accounts = pack.accounts || [];
  const cash = last.cash ?? accounts.filter((a) => a.type === "depository").reduce((n, a) => n + a.balance, 0);
  const home = last.home ?? accounts.filter((a) => a.type === "real_estate").reduce((n, a) => n + a.balance, 0);
  const mtg = accounts.find((a) => a.id === "ACC-MTG")?.balance || 0;
  const surplus = (last.income || 0) - (last.spend || 0);
  const rate = last.income ? (surplus / last.income) * 100 : 0;
  const months = last.spend ? cash / last.spend : 0;
  const card = accounts.find((a) => a.type === "credit" && a.limit);
  if (/net.?worth|worth/.test(q)) return `Net worth ${money(last.net_worth)} as of ${last.month || "this pack"}. Twelve months are in the file, house included.`;
  if (/emergenc|runway|months of/.test(q)) return `Emergency fund is ${months.toFixed(1)} months of spend (${money(cash)} cash ÷ ${money(last.spend)}). Target in goals.jsonl is six months.`;
  if (/saving.?rate|savings rate/.test(q)) return `Savings rate ${pct(rate)} this month. Surplus ${money(surplus)} on income ${money(last.income)}.`;
  if (/allocat|401|roth|hsa|invest/.test(q)) return `Invested ${money(last.investments)}. Brokerage, 401(k), Roth, and HSA are in accounts.jsonl.`;
  if (/equity|house|home|pier/.test(q)) return `12 Pier Street is ${money(home)}. Equity ${money(home + mtg)} after the mortgage.`;
  if (/utiliz|visa|credit card/.test(q)) return card ? `${card.name} is ${pct((Math.abs(card.balance) / card.limit) * 100)} of a ${money(card.limit)} limit.` : "No card limit in this pack.";
  if (/goal/.test(q)) {
    const g = (pack.goals || []).map((r) => `${r.name} ${money(r.current)} / ${money(r.target)}`).join("; ");
    return g ? `Goals: ${g}.` : "No goals in this pack.";
  }
  if (/cash|checking|saving/.test(q)) return `Cash accounts total ${money(cash)}. Checking, savings, HYSA, and the trip sinking fund are in accounts.jsonl.`;
  if (/debt|loan|mortgage/.test(q)) return `Debt ${money(last.debt)}. Mortgage and the Civic loan are the large liabilities.`;
  if (/budget/.test(q)) {
    const over = (pack.budgets || []).filter((b) => b.actual > b.budget);
    return over.length ? `Over budget: ${over.map((b) => `${b.category} ${money(b.actual)} / ${money(b.budget)}`).join("; ")}.` : "Every category is inside the budget in this pack.";
  }
  if (/spend|categor|grocer/.test(q)) return `Last twelve months of spend are in transactions.jsonl. Housing and groceries are the large slices.`;
  if (/income|surplus|month/.test(q)) return `This month income ${money(last.income)}, spend ${money(last.spend)}, surplus ${money(surplus)}.`;
  return `${pack.project.name} is the household pack. Ask for net worth, savings rate, emergency fund, or the budget.`;
}
