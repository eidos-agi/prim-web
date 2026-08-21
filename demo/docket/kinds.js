/** Parse a prim zip and render kind editors. Docket board stays in the host. */

import { answerOpff, steerOpff } from "./opff.js";
import { answerOmf, parseOmf, steerOmf } from "./omf.js";

export function jsonl(s) {
  return String(s || "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

const CART = /\.(nes|z64|n64|v64|wad)$/i;

export function detectSystem(name, buf) {
  const n = String(name || "").toLowerCase();
  if (n.endsWith(".nes")) return "nes";
  if (/\.(z64|n64|v64)$/.test(n)) return "n64";
  if (n.endsWith(".wad")) return "doom";
  if (buf && buf[0] === 0x4E && buf[1] === 0x45 && buf[2] === 0x53) return "nes";
  if (buf && buf[0] === 0x80 && buf[1] === 0x37 && buf[2] === 0x12 && buf[3] === 0x40) return "n64";
  if (buf && buf[0] === 0x37 && buf[1] === 0x80 && buf[2] === 0x40 && buf[3] === 0x12) return "n64";
  if (buf && buf[0] === 0x37 && buf[1] === 0x12 && buf[2] === 0x40 && buf[3] === 0x80) return "n64";
  if (buf && buf[0] === 0x49 && buf[1] === 0x57 && buf[2] === 0x41 && buf[3] === 0x44) return "doom";
  if (buf && buf[0] === 0x50 && buf[1] === 0x57 && buf[2] === 0x41 && buf[3] === 0x44) return "doom";
  return "";
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
  if (has("arcade.json") || Object.keys(files).some((k) => CART.test(k.replace(/^.*\//, "")))) {
    return "arcade";
  }
  if (has("accounts.jsonl") || has("transactions.jsonl") || has("finance.json")) return "opff";
  const face = files["index.md"] || files[Object.keys(files).find((k) => k.endsWith("index.md")) || ""] || "";
  const m = String(face).match(/profile:\s*(\w+)/);
  return m ? m[1] : "";
}

function faceMatter(md) {
  const text = String(md || "");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const body = m ? m[2] : text;
  const title = (text.match(/title:\s*(.+)/) || [])[1] || "";
  return { title: title.trim(), body: body.trim() };
}

export function parseKind(files) {
  const get = (name) => files[name] || files[Object.keys(files).find((k) => k.endsWith("/" + name) || k === name)] || "";
  const kind = detectKind(files);
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
  if (kind === "arcade") {
    let meta = { name: "cart", system: "" };
    try {
      const raw = get("arcade.json");
      if (typeof raw === "string" && raw.trim()) meta = { name: "cart", ...JSON.parse(raw) };
    } catch {}
    const key = Object.keys(files).find((k) => CART.test(k.replace(/^.*\//, ""))) || meta.cart || "";
    const raw = (key && files[key]) || get(key) || get("cart.nes") || get("cart.z64") || get("freedoom1.wad");
    const rom = raw instanceof Uint8Array ? raw : new Uint8Array(0);
    const system = meta.system || detectSystem(key, rom) || "nes";
    return { kind, project: { name: meta.name || "cart", ...meta }, system, core: meta.core, rom };
  }
  if (kind === "opff") {
    let meta = { name: "household" };
    try { meta = { name: "household", ...JSON.parse(get("finance.json") || "{}") }; } catch {}
    if (!meta.title) {
      const face = faceMatter(get("index.md"));
      meta.title = face.title || "household";
    }
    return {
      kind: "opff",
      project: { ...meta, name: meta.title || meta.name || "household" },
      accounts: jsonl(get("accounts.jsonl")),
      transactions: jsonl(get("transactions.jsonl")),
      budgets: jsonl(get("budgets.jsonl")),
      snapshots: jsonl(get("snapshots.jsonl")),
      goals: jsonl(get("goals.jsonl")),
    };
  }
  if (kind === "omf") return parseOmf(files);
  if (kind === "obif" || has("identity.json")) {
    let identity = {};
    try { identity = JSON.parse(get("identity.json") || "{}"); } catch {}
    const face = faceMatter(get("index.md"));
    return {
      kind: "obif",
      project: { name: identity.brand?.display_name || face.title || "brand" },
      identity,
      files,
      face,
      names: Object.keys(files).map((k) => k.replace(/^.*\//, "")).filter(Boolean),
    };
  }
  const face = faceMatter(get("index.md"));
  const names = Object.keys(files).map((k) => k.replace(/^.*\//, "")).filter((n) => n && n !== ".");
  return {
    kind,
    project: { name: face.title || kind },
    okf: true,
    face: face.body,
    files: names,
  };
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export async function renderKind(el, pack, onChange) {
  if (pack.kind === "deck") return renderDeck(el, pack, onChange);
  if (pack.kind === "invoice") return renderInvoice(el, pack, onChange);
  if (pack.kind === "session") return renderSession(el, pack, onChange);
  if (pack.kind === "arcade") {
    const { renderArcade } = await import("./arcade.js");
    return renderArcade(el, pack);
  }
  if (pack.kind === "opff") {
    const { renderOpff } = await import("./opff.js");
    return renderOpff(el, pack);
  }
  if (pack.kind === "omf") {
    const { renderOmf } = await import("./omf.js");
    return renderOmf(el, pack, onChange);
  }
  if (pack.kind === "obif") {
    const { renderObif } = await import("./showprim.js");
    return renderObif(el, pack);
  }
  return renderFace(el, pack);
}

function renderFace(el, pack) {
  const body = (pack.face || "").split(/\n/).map((line) => {
    if (line.startsWith("# ")) return `<h2>${esc(line.slice(2))}</h2>`;
    if (!line.trim()) return "";
    return `<p>${esc(line)}</p>`;
  }).join("");
  el.innerHTML = `<div class="kind paper">
    <p class="kicker">${esc(pack.kind)} · the file is the prim</p>
    ${body}
    <ol class="pack-files">${(pack.files || []).map((n) => `<li>${esc(n)}</li>`).join("")}</ol>
  </div>`;
}

function slidePoints(body) {
  const raw = String(body || "").trim();
  if (!raw) return [];
  if (raw.includes("\n")) return raw.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return raw.split(/(?<=\.)\s+/).map((s) => s.trim()).filter(Boolean);
}

function renderDeck(el, pack, onChange) {
  let i = 0;
  const go = (n) => {
    i = (n + pack.slides.length) % pack.slides.length;
    draw();
  };
  const save = (field, value) => {
    if (!pack.slides[i]) return;
    pack.slides[i][field] = value;
    onChange?.(pack);
  };
  const draw = () => {
    const s = pack.slides[i] || { title: "", body: "" };
    const points = slidePoints(s.body);
    el.innerHTML = `<div class="kind deck" tabindex="0">
      <div class="deck-stage">
        <article class="slide">
          <span class="slide-no">${String(i + 1).padStart(2, "0")}</span>
          <p class="kicker">${esc(pack.project.name)} · ${esc(s.id || "")}</p>
          <h2 contenteditable="true" data-f="title">${esc(s.title)}</h2>
          <ul>${points.map((p) => `<li contenteditable="true">${esc(p)}</li>`).join("")}</ul>
        </article>
        <div class="deck-bar">
          <button type="button" data-go="-1" aria-label="Previous slide">←</button>
          <span>${i + 1} / ${pack.slides.length}</span>
          <button type="button" data-go="1" aria-label="Next slide">→</button>
          <ol class="ticks" aria-hidden="true">${pack.slides.map((_, n) => `<li class="${n === i ? "on" : ""}"></li>`).join("")}</ol>
        </div>
      </div>
      <nav class="film">${pack.slides.map((sl, n) => `
        <button type="button" class="pick ${n === i ? "on" : ""}" data-i="${n}">
          <em>${String(n + 1).padStart(2, "0")}</em>
          <strong>${esc(sl.title)}</strong>
          <small>${esc(slidePoints(sl.body)[0] || "")}</small>
        </button>`).join("")}</nav>
    </div>`;
    const root = el.querySelector(".kind.deck");
    root?.focus({ preventScroll: true });
    el.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => go(+b.dataset.i)));
    el.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(i + +b.dataset.go)));
    const title = el.querySelector("[data-f=title]");
    title?.addEventListener("blur", () => {
      save("title", title.textContent.trim());
      const cap = el.querySelector(".pick.on strong");
      if (cap) cap.textContent = title.textContent.trim();
    });
    el.querySelectorAll(".slide li").forEach((li) => {
      li.addEventListener("blur", () => {
        const next = [...el.querySelectorAll(".slide li")].map((n) => n.textContent.trim()).filter(Boolean);
        save("body", next.join("\n"));
      });
    });
    if (el._deckKey) document.removeEventListener("keydown", el._deckKey);
    el._deckKey = (e) => {
      if (!el.isConnected) {
        document.removeEventListener("keydown", el._deckKey);
        return;
      }
      if (e.target.closest("input, textarea, [contenteditable=true]")) return;
      const card = el.closest(".editor-card");
      if (card && !card.closest("#app-rail-body") && !el.contains(document.activeElement)) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(i + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    };
    document.addEventListener("keydown", el._deckKey);
  };
  draw();
}

function money(n, cur = "USD") {
  const v = Number(n || 0);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v);
  } catch {
    return `${cur} ${v.toLocaleString()}`;
  }
}

function renderInvoice(el, pack, onChange) {
  const total = () => pack.lines.reduce((n, l) => n + Number(l.qty || 0) * Number(l.rate || 0), 0);
  const draw = () => {
    const m = pack.project;
    const cur = m.currency || "USD";
    const house = (m.from || "Invoice").trim();
    const mark = house.charAt(0) || "I";
    const tag = /harbor/i.test(house) ? "Identity for launches" : "";
    el.innerHTML = `<div class="kind bill">
      <div class="bill-sheet">
        <header class="bill-top">
          <div class="studio">
            <span class="harbor-mark" aria-hidden="true">${esc(mark)}</span>
            <div>
              <p class="studio-name">${esc(house)}</p>
              ${tag ? `<p class="studio-line">${esc(tag)}</p>` : ""}
            </div>
          </div>
          <div class="bill-id">
            <p class="kicker">Invoice</p>
            <h2>${esc(m.number)}</h2>
          </div>
        </header>
        <section class="parties">
          <label>From<input data-m="from" value="${esc(m.from || "")}"></label>
          <label>Bill to<input data-m="to" value="${esc(m.to || "")}"></label>
        </section>
        <section class="dates">
          <label>Issued<input data-m="date" value="${esc(m.date || "")}"></label>
          <label>Due<input data-m="due" value="${esc(m.due || "")}"></label>
        </section>
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>${pack.lines.map((l, n) => `<tr>
            <td><input data-l="${n}" data-f="desc" value="${esc(l.desc)}"></td>
            <td><input data-l="${n}" data-f="qty" value="${esc(l.qty)}"></td>
            <td><input data-l="${n}" data-f="rate" value="${esc(l.rate)}"></td>
            <td class="amt">${money(Number(l.qty || 0) * Number(l.rate || 0), cur)}</td>
          </tr>`).join("")}</tbody>
        </table>
        <footer class="bill-foot">
          <p class="note">${esc(m.note || "The pack is the bill.")}</p>
          <p class="total"><span>Amount due</span><b>${money(total(), cur)}</b></p>
        </footer>
      </div>
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
  const voice = (who) => (who === "agent" ? "Agent" : "Human");
  const draw = () => {
    const n = pack.turns.length;
    el.innerHTML = `<div class="kind sess">
      <header class="sess-top">
        <div>
          <p class="kicker">Session</p>
          <h2>${esc(pack.project.title || "Session")}</h2>
          <p class="sess-meta">${esc(pack.project.started || "")} · next window opens this file</p>
        </div>
        <p class="sess-count"><b>${n}</b> ${n === 1 ? "turn" : "turns"}</p>
      </header>
      <ol>${pack.turns.map((t) => `<li class="${esc(t.who || "human")}">
        <time datetime="${esc(t.at || "")}">${esc(t.at || "")}</time>
        <div class="turn"><b>${esc(voice(t.who))}</b><p>${esc(t.text)}</p></div>
      </li>`).join("")}</ol>
      <form class="add-turn">
        <input name="text" placeholder="Log the next turn…" required>
        <button type="submit">Log</button>
      </form>
    </div>`;
    const tape = el.querySelector("ol");
    if (tape) tape.scrollTop = tape.scrollHeight;
    el.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = new FormData(e.target).get("text").trim();
      if (!text) return;
      const i = pack.turns.length + 1;
      pack.turns.push({
        id: "T-" + String(i).padStart(2, "0"),
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

export function steerKind(pack, q) {
  if (pack?.kind === "opff") return steerOpff(pack, q);
  if (pack?.kind === "omf") return steerOmf(pack, q);
  return null;
}

export function answerKind(pack, q) {
  q = q.toLowerCase();
  if (pack.kind === "deck") {
    if (/slide|how many|what/.test(q)) return `${pack.slides.length} slides in ${pack.project.name}. Arrows move. Click a line to edit.`;
    return "The deck is a view of this file. Ask how many slides.";
  }
  if (pack.kind === "invoice") {
    const t = pack.lines.reduce((n, l) => n + Number(l.qty || 0) * Number(l.rate || 0), 0);
    if (/total|due|how much|amount/.test(q)) return `${pack.project.number} due ${pack.project.due || "—"}. Total ${pack.project.currency || "USD"} ${t.toLocaleString()}.`;
    return "The pack is the bill. Ask for the total.";
  }
  if (pack.kind === "opff") return answerOpff(pack, q);
  if (pack.kind === "omf") return answerOmf(pack, q);
  if (pack.kind === "arcade") {
    if (pack.system === "doom") {
      return `${pack.project.name} is Freedoom — a free IWAD, not the id Software dump. Play loads EmulatorJS (prboom).`;
    }
    if (pack.system === "n64") {
      return `${pack.project.name} is an N64 cart. Play loads EmulatorJS (mupen64plus_next). Lawful carts only.`;
    }
    return `${pack.project.name} is a ${pack.system || "nes"} cart. Prim Arcade cites this file. Arrows move, X is A, Z is B.`;
  }
  if (pack.face) {
    return `${pack.project.name} is a ${pack.kind} prim. The face cites this file.`;
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
