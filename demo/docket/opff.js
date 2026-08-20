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

export function renderOpff(el, pack) {
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

  el.innerHTML = `<div class="kind opff">
    <p class="kicker">opff-editor · ${esc(pack.project.name)} · cites this file</p>
    <h2>${esc(pack.project.name)}</h2>
    <p class="who">${esc((pack.project.people || []).join(" · ") || "household")} · as of ${esc(pack.project.as_of || last.month || "")} · fictional</p>
    <div class="kpis">
      ${kpi("Net worth", money(last.net_worth), last.net_worth >= 0 ? "up" : "down", "assets − debt")}
      ${kpi("Cash", money(cash), "ok", "checking · savings · HYSA")}
      ${kpi("Invested", money(invest), "ok", "brokerage · 401(k) · Roth · HSA")}
      ${kpi("Home equity", money(equity), equity >= 0 ? "up" : "down", `${money(home)} house`)}
      ${kpi("Debt", money(debt), "down", "mortgage · auto · card")}
      ${kpi("This month", money(surplus), surplus >= 0 ? "up" : "down", `${money(last.income)} in / ${money(last.spend)} out`)}
      ${kpi("Savings rate", pct(rate), rate >= 15 ? "up" : "down", "surplus ÷ income")}
      ${kpi("Emergency", `${months.toFixed(1)} mo`, months >= 6 ? "up" : months >= 3 ? "ok" : "down", "cash ÷ monthly spend")}
    </div>
    <div class="charts">
      <section class="panel">${chartTitle("Net worth")} ${lineChart(snaps.map((s) => ({ label: s.month.slice(2), v: s.net_worth })), "#3dd68c")}</section>
      <section class="panel">${chartTitle("Assets over time")} ${stackArea(snaps, ["cash", "investments", "home"], ["#5ec8f2", "#5e6ad2", "#f2c14e"], ["Cash", "Invested", "Home"])}</section>
      <section class="panel">${chartTitle("Income vs spend")} ${groupBar(snaps.map((s) => ({ label: s.month.slice(5), a: s.income, b: s.spend })), "#3dd68c", "#eb5757")}</section>
      <section class="panel">${chartTitle("Monthly surplus")} ${lineChart(snaps.map((s) => ({ label: s.month.slice(5), v: (s.income || 0) - (s.spend || 0) })), "#5ec8f2")}</section>
      <section class="panel">${chartTitle("Spending by category")} ${donut(catRows)}</section>
      <section class="panel">${chartTitle("Asset allocation")} ${donut(alloc)}</section>
      <section class="panel">${chartTitle("Budget vs actual")} ${hBars(budgets, "budget", "actual")}</section>
      <section class="panel">${chartTitle("Debt mix")} ${donut(debts)}</section>
      <section class="panel">${chartTitle("Goals")} ${goalBars(goals)}</section>
      <section class="panel">${chartTitle("Credit utilization")} ${gauge(util, card ? `${esc(card.name)} ${pct(util)} of ${money(card.limit)} · keep under 30%` : "No card limit in this pack")}</section>
      <section class="panel span">${chartTitle("Accounts")} ${accountTable(accounts)}</section>
      <section class="panel span">${chartTitle("Recent activity")} ${txnTable(txns.slice(0, 16))}</section>
    </div>
  </div>`;
}

function kpi(label, value, tone, sub) {
  return `<div class="kpi ${tone}"><span>${esc(label)}</span><b>${esc(value)}</b>${sub ? `<em>${esc(sub)}</em>` : ""}</div>`;
}
function chartTitle(t) {
  return `<h3>${esc(t)}</h3>`;
}

function lineChart(pts, color) {
  if (!pts.length) return "";
  const w = 420, h = 160, p = 28;
  const vs = pts.map((d) => d.v);
  const min = Math.min(...vs, 0);
  const max = Math.max(...vs, 0);
  const span = max - min || 1;
  const x = (i) => p + (i / Math.max(pts.length - 1, 1)) * (w - p * 2);
  const y = (v) => h - p - ((v - min) / span) * (h - p * 2);
  const d = pts.map((pt, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(pt.v).toFixed(1)}`).join(" ");
  const zero = min < 0 && max > 0 ? `<line x1="${p}" x2="${w - p}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" stroke="#232326"/>` : "";
  const ticks = pts.filter((_, i) => i % 2 === 0).map((pt, i) => {
    const idx = i * 2;
    return `<text x="${x(idx).toFixed(1)}" y="${h - 6}" text-anchor="middle">${esc(pt.label)}</text>`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    ${zero}
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2"/>
    ${pts.map((pt, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(pt.v).toFixed(1)}" r="2.2" fill="${color}"/>`).join("")}
    ${ticks}
  </svg>`;
}

function stackArea(snaps, keys, colors, labels) {
  if (!snaps.length) return "";
  const w = 420, h = 160, p = 28;
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
  const legend = labels.map((name, i) => `<i style="background:${colors[i]}"></i>${esc(name)}`).join(" ");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}">${layers}${ticks}</svg><p class="legend">${legend}</p>`;
}

function groupBar(rows, c1, c2) {
  const w = 420, h = 160, p = 28;
  const max = Math.max(...rows.flatMap((r) => [r.a, r.b]), 1);
  const slot = (w - p * 2) / rows.length;
  const bars = rows.map((r, i) => {
    const x = p + i * slot;
    const h1 = (r.a / max) * (h - p * 2);
    const h2 = (r.b / max) * (h - p * 2);
    return `<rect x="${x + 3}" y="${h - p - h1}" width="${slot / 2 - 4}" height="${h1}" fill="${c1}"/>
      <rect x="${x + slot / 2}" y="${h - p - h2}" width="${slot / 2 - 4}" height="${h2}" fill="${c2}"/>
      <text x="${x + slot / 2}" y="${h - 6}" text-anchor="middle">${esc(r.label)}</text>`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}">${bars}</svg>
    <p class="legend"><i style="background:${c1}"></i>Income <i style="background:${c2}"></i>Spend</p>`;
}

function donut(rows) {
  const total = rows.reduce((n, r) => n + r[1], 0) || 1;
  let a = -Math.PI / 2;
  const cx = 70, cy = 70, r = 52, ir = 30;
  const slices = rows.map(([name, v], i) => {
    const sweep = (v / total) * Math.PI * 2;
    const b = a + sweep;
    const large = sweep > Math.PI ? 1 : 0;
    const p = `M ${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} A ${r} ${r} 0 ${large} 1 ${cx + Math.cos(b) * r} ${cy + Math.sin(b) * r} L ${cx + Math.cos(b) * ir} ${cy + Math.sin(b) * ir} A ${ir} ${ir} 0 ${large} 0 ${cx + Math.cos(a) * ir} ${cy + Math.sin(a) * ir} Z`;
    a = b;
    return `<path d="${p}" fill="${PAL[i % PAL.length]}"><title>${esc(name)} ${money(v)}</title></path>`;
  }).join("");
  const legend = rows.slice(0, 8).map(([name, v], i) => `<li><i style="background:${PAL[i % PAL.length]}"></i>${esc(name)} <b>${money(v)}</b></li>`).join("");
  return `<div class="donut"><svg viewBox="0 0 140 140">${slices}</svg><ol>${legend}</ol></div>`;
}

function hBars(rows, budgetKey, actualKey) {
  const max = Math.max(...rows.flatMap((r) => [r[budgetKey], r[actualKey]]), 1);
  return `<div class="hbars">${rows.map((r) => {
    const over = r[actualKey] > r[budgetKey];
    return `<div class="hbar">
      <span>${esc(r.category)}</span>
      <div class="track">
        <i class="budget" style="width:${(r[budgetKey] / max) * 100}%"></i>
        <i class="actual ${over ? "over" : ""}" style="width:${(r[actualKey] / max) * 100}%"></i>
      </div>
      <em>${money(r[actualKey])} / ${money(r[budgetKey])}</em>
    </div>`;
  }).join("")}</div>`;
}

function goalBars(rows) {
  if (!rows.length) return "<p class='empty'>No goals in this pack.</p>";
  return `<div class="hbars goals">${rows.map((r) => {
    const t = Number(r.target) || 1;
    const c = Number(r.current) || 0;
    const done = c >= t;
    return `<div class="hbar">
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
