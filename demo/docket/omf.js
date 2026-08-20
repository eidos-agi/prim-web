/** Open Meeting Format surface. The occurrence is the pack. */

const SECS = ["people", "capture", "outcomes", "invite"];

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function scalar(value) {
  value = String(value ?? "").trim();
  if (value.length >= 2 && (value[0] === "'" || value[0] === '"') && value.at(-1) === value[0]) {
    value = value.slice(1, -1);
  }
  const low = value.toLowerCase();
  if (low === "null" || low === "~" || low === "none") return null;
  if (low === "true") return true;
  if (low === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (/^-?\d+\.\d+$/.test(value)) return Number(value);
  return value;
}

function splitFlow(value) {
  const out = [];
  let buf = "";
  let depth = 0;
  let quote = "";
  for (const ch of value) {
    if (ch === "'" || ch === '"') quote = quote === ch ? "" : (quote || ch);
    else if (!quote && (ch === "[" || ch === "{")) depth += 1;
    else if (!quote && (ch === "]" || ch === "}")) depth -= 1;
    if (ch === "," && !quote && depth === 0) {
      out.push(buf.trim());
      buf = "";
    } else buf += ch;
  }
  if (buf) out.push(buf.trim());
  return out;
}

function valueOf(raw) {
  const value = String(raw ?? "").trim();
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    return inner ? splitFlow(inner).map(valueOf) : [];
  }
  if (value.startsWith("{") && value.endsWith("}")) {
    const inner = value.slice(1, -1).trim();
    const obj = {};
    for (const item of splitFlow(inner)) {
      const i = item.indexOf(":");
      if (i < 0) continue;
      obj[item.slice(0, i).trim()] = valueOf(item.slice(i + 1));
    }
    return obj;
  }
  return scalar(value);
}

function parseFrontmatter(text) {
  const src = String(text || "");
  if (!src.startsWith("---")) return { fm: {}, body: src.trim() };
  const end = src.indexOf("\n---", 3);
  if (end < 0) return { fm: {}, body: src.trim() };
  const lines = src.slice(3, end).split("\n");
  const body = src.slice(end + 4).replace(/^\n/, "").trim();
  const root = {};
  const stack = [[-1, root]];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    if (!raw.trim() || raw.trimStart().startsWith("#")) { i += 1; continue; }
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    while (stack.length > 1 && indent <= stack.at(-1)[0]) stack.pop();
    const container = stack.at(-1)[1];
    if (line.startsWith("- ")) {
      if (!Array.isArray(container)) { i += 1; continue; }
      const item = line.slice(2).trim();
      if (!item) {
        const child = {};
        container.push(child);
        stack.push([indent, child]);
      } else if (item.includes(":") && !item.startsWith("'") && !item.startsWith('"')) {
        const cut = item.indexOf(":");
        const rest = item.slice(cut + 1).trim();
        const child = { [item.slice(0, cut).trim()]: rest ? valueOf(rest) : {} };
        container.push(child);
        stack.push([indent, child]);
      } else {
        container.push(valueOf(item));
      }
      i += 1;
      continue;
    }
    if (typeof container !== "object" || Array.isArray(container) || !line.includes(":")) {
      i += 1;
      continue;
    }
    const cut = line.indexOf(":");
    const key = line.slice(0, cut).trim();
    const val = line.slice(cut + 1).trim();
    if (val) {
      container[key] = valueOf(val);
      i += 1;
      continue;
    }
    let kind = "map";
    for (const next of lines.slice(i + 1)) {
      if (!next.trim() || next.trimStart().startsWith("#")) continue;
      const nextIndent = next.length - next.trimStart().length;
      if (nextIndent <= indent) { kind = "empty"; break; }
      kind = next.trim().startsWith("- ") ? "list" : "map";
      break;
    }
    if (kind === "list") {
      const child = [];
      container[key] = child;
      stack.push([indent, child]);
    } else if (kind === "map") {
      const child = {};
      container[key] = child;
      stack.push([indent, child]);
    } else {
      container[key] = null;
    }
    i += 1;
  }
  return { fm: root, body };
}

function bytes(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return "—";
  if (v < 1024) return `${v} B`;
  if (v < 1024 * 1024) return `${Math.round(v / 1024)} KB`;
  return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

function clock(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || "—").replace("T", " ");
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  const hm = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  return `${d.getUTCDate()} ${mon} ${d.getUTCFullYear()} · ${hm}Z`;
}

function span(start, end) {
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime())) return clock(start);
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][a.getUTCMonth()];
  const t = (d) => `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  if (Number.isNaN(b.getTime())) return `${a.getUTCDate()} ${mon} ${a.getUTCFullYear()} · ${t(a)}Z`;
  return `${a.getUTCDate()} ${mon} ${a.getUTCFullYear()} · ${t(a)}–${t(b)} UTC`;
}

function quoteOf(doc) {
  const q = doc?.quotes;
  if (!Array.isArray(q) || !q.length) return "";
  return String(q[0].text || q[0].speaker || "").trim();
}

function personName(pack, ref) {
  const raw = String(ref || "");
  const id = raw.includes(":") ? raw.split(":")[1] : raw;
  const people = pack.participants || [];
  const hit = people.find((p) => {
    const mail = String(p.identity || "").split("@")[0];
    return mail === id || String(p.title || "").toLowerCase().includes(id.toLowerCase());
  });
  return hit?.title || (id ? id.charAt(0).toUpperCase() + id.slice(1) : raw);
}

function firstName(title) {
  return String(title || "").split(/\s+/)[0] || title;
}

function logLines(log) {
  return String(log || "").split(/\n/).map((l) => l.replace(/^-+\s*/, "").trim()).filter((l) => l && !l.startsWith("#"));
}

function rsvpOf(p) {
  return String(p?.invited?.partstat || "—").toUpperCase();
}

function attendedOf(p) {
  if (p?.attended?.observed === true) return "observed";
  if (p?.attended && Object.keys(p.attended).length) return "recorded";
  return "unknown";
}

export function parseOmf(files) {
  const faceRaw = files["index.md"]
    || files[Object.keys(files).find((k) => k.endsWith("/index.md") && !k.includes("/outcomes/") && !k.includes("/transcript/")) || ""]
    || files[Object.keys(files).find((k) => k === "index.md" || k.endsWith("index.md")) || ""]
    || "";
  const face = parseFrontmatter(faceRaw).fm;
  const participants = [];
  const artifacts = [];
  const agenda = [];
  const decisions = [];
  const commitments = [];
  const questions = [];
  const conflicts = [];
  const extracts = [];
  let calendar = {};
  let series = {};
  let ics = "";
  let log = "";
  for (const [path, raw] of Object.entries(files)) {
    if (typeof raw !== "string") continue;
    if (/\.ics$/i.test(path)) { ics = raw; continue; }
    if (/(^|\/)log\.md$/i.test(path)) { log = raw; continue; }
    if (!/\.md$/i.test(path)) continue;
    if (/(^|\/)index\.md$/i.test(path) && !path.includes("outcomes/") && !path.includes("transcript/")) continue;
    const { fm, body } = parseFrontmatter(raw);
    const type = String(fm.type || "");
    const doc = { ...fm, body, path };
    if (type === "participant") participants.push(doc);
    else if (type === "artifact") artifacts.push(doc);
    else if (type === "agenda_item") agenda.push(doc);
    else if (type === "decision") decisions.push(doc);
    else if (type === "commitment") commitments.push(doc);
    else if (type === "question") questions.push(doc);
    else if (type === "conflict") conflicts.push(doc);
    else if (type === "evidence") extracts.push(doc);
    else if (type === "calendar_event") calendar = doc;
    else if (type === "series") series = doc;
  }
  participants.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  agenda.sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
  return {
    kind: "omf",
    project: { name: face.title || "meeting", ...face },
    face,
    calendar,
    series,
    ics,
    log,
    participants,
    artifacts,
    agenda,
    decisions,
    commitments,
    questions,
    conflicts,
    extracts,
  };
}

export function renderOmf(el, pack, onChange) {
  let view = "people";
  const ctl = {
    go(id) {
      view = SECS.includes(id) ? id : (id === "record" ? "capture" : view);
      draw();
      el.querySelector(`[data-sec="${view}"]`)?.scrollIntoView({ block: "nearest" });
    },
    looking() { return view; },
  };
  const draw = () => {
    el.innerHTML = folio(pack, view);
    el.querySelectorAll("[data-view]").forEach((b) => {
      b.addEventListener("click", () => ctl.go(b.dataset.view));
    });
    el.querySelector("form.add-q")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = new FormData(e.target).get("title")?.toString().trim();
      if (!title) return;
      pack.questions.push({ type: "question", title, status: "open" });
      onChange?.(pack);
      view = "outcomes";
      draw();
    });
    el._surface = ctl;
  };
  draw();
  return ctl;
}

export function steerOmf(_pack, q) {
  q = String(q || "").toLowerCase();
  if (/rsvp|invite|calendar|accepted|partstat|sequence|ics/.test(q)) return { view: "invite" };
  if (/attend|who was there|who showed|observed|sam/.test(q)) return { view: "people" };
  if (/recording|transcript|notes|capture|pointer/.test(q)) return { view: "capture" };
  if (/decid|commit|question|outcome|owe|owner|said/.test(q)) return { view: "outcomes" };
  return null;
}

export function answerOmf(pack, q) {
  q = String(q || "").toLowerCase();
  const people = pack.participants || [];
  const accepted = people.filter((p) => rsvpOf(p) === "ACCEPTED");
  const there = people.filter((p) => attendedOf(p) === "observed");
  const unknown = people.filter((p) => attendedOf(p) === "unknown");
  const capture = pack.face?.capture || {};
  const extracts = (pack.extracts || []).flatMap((e) => e.quotes || []);
  if (/attend|who was there|who showed|observed/.test(q)) {
    const miss = unknown.map((p) => p.title).join(", ");
    return `There: ${there.map((p) => p.title).join(", ") || "nobody observed"}. Accepted: ${accepted.map((p) => p.title).join(", ") || "nobody"}.${miss ? ` ${miss}: accepted, attendance unknown.` : ""}`;
  }
  if (/rsvp|accepted|invite|who.?s coming/.test(q)) {
    return people.map((p) => `${p.title}: ${rsvpOf(p)}`).join("; ") + ". That is the invite, not the record.";
  }
  if (/said|quote|extract/.test(q) && extracts.length) {
    return extracts.map((x) => `${x.speaker}: “${x.text}”`).join(" ");
  }
  if (/decid|binding/.test(q)) {
    const rows = pack.decisions || [];
    if (!rows.length) return "No decisions in this occurrence.";
    return rows.map((d) => {
      const quote = quoteOf(d);
      return `${d.title} — ${personName(pack, d.decided_by)}${d.binding ? ", binding" : ""}${quote ? `. “${quote}”` : ""}`;
    }).join("; ");
  }
  if (/commit|owe|owner|due/.test(q)) {
    const rows = pack.commitments || [];
    if (!rows.length) return "No commitments in this occurrence.";
    return rows.map((c) => `${c.title} — ${personName(pack, c.owner)}, ${c.state || "open"}${c.due ? `, due ${c.due}` : ""}`).join("; ");
  }
  if (/question|open/.test(q)) {
    const rows = (pack.questions || []).filter((x) => (x.status || "open") === "open");
    return rows.length ? rows.map((x) => x.title).join("; ") : "No open questions.";
  }
  if (/transcript/.test(q)) {
    return `Transcript is ${capture.transcript || "unspecified"}. Absent is not the same as not attempted.`;
  }
  if (/record|capture|notes|recording/.test(q)) {
    return `Recording ${capture.recording || "—"}; notes ${capture.notes || "—"}; transcript ${capture.transcript || "—"}. Pointers only — no media in the pack.`;
  }
  return `${pack.project.name} is one occurrence. Ask who was there, what was decided, or what they said.`;
}

function stamp(kind, text, tone) {
  return `<span class="stamp ${esc(kind)} ${esc(tone)}">${esc(text)}</span>`;
}

function folio(pack, view) {
  const f = pack.face || {};
  const series = pack.series || {};
  const capture = f.capture || {};
  const extracts = (pack.extracts || []).flatMap((e) => e.quotes || []);
  const there = (pack.participants || []).filter((p) => attendedOf(p) === "observed").length;
  const unknown = (pack.participants || []).filter((p) => attendedOf(p) === "unknown").length;
  return `<div class="kind omf" data-view="${esc(view)}">
    <header class="omf-mast">
      <p class="kicker">omf-editor · one occurrence</p>
      <h2>${esc(f.title || pack.project.name)}</h2>
      <p class="when">${esc(span(f.starts_at_utc, f.ends_at_utc))}</p>
      <p class="series">${esc(series.title || "One-off")}${series.occurrences ? ` · ${esc(series.occurrences)} on record` : ""}</p>
    </header>
    <div class="omf-sheet">
      ${peopleSec(pack, view, there, unknown)}
      ${captureSec(pack, view, capture, extracts)}
      ${outcomeSec(pack, view)}
      ${conflictSec(pack)}
      ${inviteSec(pack, view)}
      ${logSec(pack)}
    </div>
  </div>`;
}

function peopleSec(pack, view, there, unknown) {
  return `<section class="omf-sec ${view === "people" ? "on" : ""}" data-sec="people">
    <div class="sec-h">
      <p class="class-label">People</p>
      <p class="tally">${there} observed · ${unknown} unknown</p>
    </div>
    <p class="hint">Invite is RSVP. Record is who was there. They are not the same column.</p>
    <table class="roll">
      <thead><tr><th>Name</th><th>Invite</th><th>Record</th></tr></thead>
      <tbody>${(pack.participants || []).map((p) => {
        const seen = attendedOf(p);
        const rsvp = rsvpOf(p);
        const mismatch = rsvp === "ACCEPTED" && seen === "unknown";
        return `<tr class="${mismatch ? "mismatch" : ""}">
          <th><b>${esc(p.title)}</b><small>${esc(p.role || "attendee")}</small></th>
          <td>${stamp("invite", rsvp.toLowerCase(), rsvp.toLowerCase())}</td>
          <td>${stamp("record", seen === "observed" ? "there" : seen, seen)}${seen === "unknown" ? "<small>no evidence</small>" : ""}</td>
        </tr>`;
      }).join("")}</tbody>
    </table>
  </section>`;
}

function captureSec(pack, view, capture, extracts) {
  const art = Object.fromEntries((pack.artifacts || []).map((a) => [a.kind, a]));
  const slots = [
    ["recording", capture.recording, art.recording],
    ["notes", capture.notes, art.notes],
    ["transcript", capture.transcript, art.transcript],
  ];
  return `<section class="omf-sec ${view === "capture" ? "on" : ""}" data-sec="capture">
    <div class="sec-h">
      <p class="class-label">Capture</p>
      <p class="tally">pointers, not media</p>
    </div>
    <ul class="slots">${slots.map(([name, state, a]) => `
      <li class="${esc(state || "unknown")}">
        <b>${esc(name)}</b>
        <em>${esc((state || "—").replace("_", " "))}</em>
        <span>${a ? `${esc(bytes(a.bytes))} · pointer` : (state === "not_attempted" ? "never enabled" : "—")}</span>
      </li>`).join("")}</ul>
    ${extracts.length ? `<ol class="said">${extracts.map((x) => `
      <li><b>${esc(x.speaker)}</b><q>${esc(x.text)}</q></li>`).join("")}</ol>
      <p class="hint">Extract from notes. The recording stays outside the pack.</p>` : ""}
  </section>`;
}

function outcomeSec(pack, view) {
  return `<section class="omf-sec ${view === "outcomes" ? "on" : ""}" data-sec="outcomes">
    <div class="sec-h">
      <p class="class-label">The room</p>
      <p class="tally">humans decide</p>
    </div>
    ${(pack.decisions || []).map((d) => {
      const quote = quoteOf(d);
      return `<article class="verdict">
        ${quote ? `<q>${esc(quote)}</q>` : ""}
        <h3>${esc(d.title)}</h3>
        <p>${esc(personName(pack, d.decided_by))}${d.binding ? " · binding" : ""}</p>
      </article>`;
    }).join("") || "<p class='empty'>No decisions.</p>"}
    <ul class="owed">${(pack.commitments || []).map((c) => `
      <li>
        <b>${esc(firstName(personName(pack, c.owner)))} owes</b>
        <strong>${esc(c.title)}</strong>
        <small>${esc(c.state || "open")}${c.due ? ` · due ${esc(c.due)}` : ""}${c.tracked_as ? ` · ${esc(c.tracked_as)}` : ""}</small>
      </li>`).join("")}</ul>
    <ul class="openq">${(pack.questions || []).map((x) => `
      <li><b>Open</b><strong>${esc(x.title)}</strong></li>`).join("")}</ul>
    <form class="add-q">
      <input name="title" placeholder="Log an open question…" required>
      <button type="submit">Log</button>
    </form>
  </section>`;
}

function conflictSec(pack) {
  if (!(pack.conflicts || []).length) return "";
  return `<section class="omf-sec" data-sec="conflict">
    <div class="sec-h">
      <p class="class-label">Kept</p>
      <p class="tally">not resolved</p>
    </div>
    ${(pack.conflicts || []).map((c) => `
      <div class="split">
        <p class="hint">${esc(c.title)}</p>
        <ul>${(c.positions || []).map((p) => `
          <li><b>${esc(p.value)}</b><small>${esc(String(p.source || "").replace(/^.*\//, ""))}${p.note ? ` · ${esc(p.note)}` : ""}</small></li>`).join("")}</ul>
      </div>`).join("")}
  </section>`;
}

function inviteSec(pack, view) {
  const f = pack.face || {};
  const src = f.source || {};
  const cal = pack.calendar || {};
  return `<details class="omf-sec invite ${view === "invite" ? "on" : ""}" data-sec="invite" ${view === "invite" ? "open" : ""}>
    <summary>
      <span class="class-label">Invite</span>
      <span class="tally">${esc(cal.calendar_status || "calendar")} · seq ${esc(src.sequence ?? cal.sequence ?? "—")}</span>
    </summary>
    <p class="hint">${(pack.agenda || []).map((a) => a.title).join(" · ") || "No agenda."}</p>
    <dl>
      <div><dt>UID</dt><dd class="mono">${esc(src.icalendar_uid || cal.uid || "—")}</dd></div>
      <div><dt>Authority</dt><dd>${esc(src.authority || "—")}</dd></div>
      <div><dt>Original</dt><dd>${pack.ics ? "original.ics preserved" : "no calendar file"}</dd></div>
    </dl>
  </details>`;
}

function logSec(pack) {
  const lines = logLines(pack.log);
  if (!lines.length) return "";
  return `<footer class="omf-log"><p class="class-label">Log</p><ol>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ol></footer>`;
}
