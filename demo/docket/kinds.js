/** Parse a prim zip and render kind editors. Docket board stays in the host. */

export function jsonl(s) {
  return String(s || "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

export function detectKind(files) {
  const has = (name) => {
    const key = Object.keys(files).find((k) => k.replace(/^.*\//, "") === name);
    return !!(key && String(files[key] || "").trim());
  };
  if (has("tasks.jsonl")) return "docket";
  if (has("slides.jsonl")) return "deck";
  if (has("lines.jsonl")) return "invoice";
  if (has("turns.jsonl")) return "session";
  const face = files["index.md"] || files[Object.keys(files).find((k) => k.endsWith("index.md")) || ""] || "";
  const m = String(face).match(/profile:\s*(\w+)/);
  return m ? m[1] : "";
}

export function parseKind(files) {
  const get = (name) => files[name] || files[Object.keys(files).find((k) => k.endsWith("/" + name) || k === name)] || "";
  const kind = detectKind({
    "index.md": get("index.md"),
    "tasks.jsonl": get("tasks.jsonl"),
    "slides.jsonl": get("slides.jsonl"),
    "lines.jsonl": get("lines.jsonl"),
    "turns.jsonl": get("turns.jsonl"),
  });
  if (kind === "docket") {
    let project = { name: "docket" };
    try { project = { name: "docket", ...JSON.parse(get("docket.json") || "{}") }; } catch {}
    return { kind, project, tasks: jsonl(get("tasks.jsonl")), milestones: jsonl(get("milestones.jsonl")) };
  }
  if (kind === "deck") {
    let meta = { name: "deck" };
    try { meta = { name: "deck", ...JSON.parse(get("deck.json") || "{}") }; } catch {}
    return { kind, project: meta, slides: jsonl(get("slides.jsonl")) };
  }
  if (kind === "invoice") {
    let meta = { number: "INV" };
    try { meta = JSON.parse(get("invoice.json") || "{}"); } catch {}
    return { kind, project: { name: meta.number || "invoice", ...meta }, lines: jsonl(get("lines.jsonl")) };
  }
  if (kind === "session") {
    let meta = { title: "session" };
    try { meta = JSON.parse(get("session.json") || "{}"); } catch {}
    return { kind, project: { name: meta.title || "session", ...meta }, turns: jsonl(get("turns.jsonl")) };
  }
  throw new Error("unknown prim kind");
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export function renderKind(el, pack, onChange) {
  if (pack.kind === "deck") return renderDeck(el, pack, onChange);
  if (pack.kind === "invoice") return renderInvoice(el, pack, onChange);
  if (pack.kind === "session") return renderSession(el, pack, onChange);
}

function renderDeck(el, pack, onChange) {
  let i = 0;
  const draw = () => {
    const s = pack.slides[i] || { title: "", body: "" };
    el.innerHTML = `<div class="kind deck">
      <nav>${pack.slides.map((sl, n) => `<button type="button" class="pick ${n===i?"on":""}" data-i="${n}"><b>${esc(sl.id)}</b>${esc(sl.title)}</button>`).join("")}</nav>
      <article>
        <p class="kicker">${esc(pack.project.name)} · ${esc(s.id || "")}</p>
        <textarea class="slide-title" data-f="title">${esc(s.title)}</textarea>
        <textarea class="slide-body" data-f="body">${esc(s.body)}</textarea>
      </article>
    </div>`;
    el.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => { i = +b.dataset.i; draw(); }));
    el.querySelectorAll("[data-f]").forEach((f) => {
      f.addEventListener("blur", () => {
        if (!pack.slides[i]) return;
        pack.slides[i][f.dataset.f] = f.value;
        onChange?.(pack);
        draw();
      });
    });
  };
  draw();
}

function renderInvoice(el, pack, onChange) {
  const total = () => pack.lines.reduce((n, l) => n + Number(l.qty || 0) * Number(l.rate || 0), 0);
  const draw = () => {
    const m = pack.project;
    el.innerHTML = `<div class="kind bill">
      <header>
        <p class="kicker">Invoice</p>
        <h2>${esc(m.number)}</h2>
        <div class="pair"><span>From</span><input data-m="from" value="${esc(m.from || "")}"></div>
        <div class="pair"><span>To</span><input data-m="to" value="${esc(m.to || "")}"></div>
        <div class="pair"><span>Due</span><input data-m="due" value="${esc(m.due || "")}"></div>
      </header>
      <table>
        <thead><tr><th>Line</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody>${pack.lines.map((l, n) => `<tr>
          <td><input data-l="${n}" data-f="desc" value="${esc(l.desc)}"></td>
          <td><input data-l="${n}" data-f="qty" value="${esc(l.qty)}"></td>
          <td><input data-l="${n}" data-f="rate" value="${esc(l.rate)}"></td>
          <td>${(Number(l.qty||0)*Number(l.rate||0)).toLocaleString()}</td>
        </tr>`).join("")}</tbody>
      </table>
      <p class="total">${esc(m.currency || "USD")} ${total().toLocaleString()}</p>
    </div>`;
    el.querySelectorAll("[data-m]").forEach((f) => {
      f.addEventListener("blur", () => { pack.project[f.dataset.m] = f.value; onChange?.(pack); draw(); });
    });
    el.querySelectorAll("[data-l]").forEach((f) => {
      f.addEventListener("blur", () => {
        const row = pack.lines[+f.dataset.l];
        if (!row) return;
        row[f.dataset.f] = f.dataset.f === "desc" ? f.value : Number(f.value);
        onChange?.(pack);
        draw();
      });
    });
  };
  draw();
}

function renderSession(el, pack, onChange) {
  const draw = () => {
    el.innerHTML = `<div class="kind sess">
      <p class="kicker">${esc(pack.project.title)} · ${esc(pack.project.started || "")}</p>
      <ol>${pack.turns.map((t) => `<li class="${t.who}"><b>${esc(t.who)}</b> <time>${esc(t.at || "")}</time><p>${esc(t.text)}</p></li>`).join("")}</ol>
      <form class="add-turn"><input name="text" placeholder="Add a turn…" required><button type="submit">Log</button></form>
    </div>`;
    el.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = new FormData(e.target).get("text").trim();
      if (!text) return;
      const n = pack.turns.length + 1;
      pack.turns.push({
        id: "T-" + String(n).padStart(2, "0"),
        who: "human",
        at: new Date().toTimeString().slice(0, 5),
        text,
      });
      onChange?.(pack);
      draw();
    });
  };
  draw();
}

export function answerKind(pack, q) {
  q = q.toLowerCase();
  if (pack.kind === "deck") {
    if (/slide|how many|what/.test(q)) return `${pack.slides.length} slides in ${pack.project.name}. Click a slide to edit.`;
    return "The deck is a view of this file. Ask how many slides.";
  }
  if (pack.kind === "invoice") {
    const t = pack.lines.reduce((n, l) => n + Number(l.qty || 0) * Number(l.rate || 0), 0);
    if (/total|due|how much|amount/.test(q)) return `${pack.project.number} due ${pack.project.due || "—"}. Total ${pack.project.currency || "USD"} ${t.toLocaleString()}.`;
    return "The pack is the bill. Ask for the total.";
  }
  if (pack.kind === "session") {
    if (/last|what|who|turn/.test(q)) {
      const last = pack.turns[pack.turns.length - 1];
      return last ? `Last turn: ${last.who} — ${last.text}` : "Empty session.";
    }
    return "This file is the session. Log a turn in the editor, or ask what was last said.";
  }
  return "";
}
