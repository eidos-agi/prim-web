/** Prim Arcade — JSNES surface on an arcade prim. */

let nes = null;

function loadJsnes() {
  if (window.jsnes) return Promise.resolve(window.jsnes);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "./vendor/jsnes.min.js";
    s.onload = () => (window.jsnes ? resolve(window.jsnes) : reject(new Error("jsnes missing")));
    s.onerror = () => reject(new Error("jsnes failed to load"));
    document.head.appendChild(s);
  });
}

export function stopArcade() {
  if (nes) {
    try { nes.destroy(); } catch {}
    nes = null;
  }
}

export async function renderArcade(el, pack) {
  stopArcade();
  const name = pack.project?.name || "cart";
  el.innerHTML = `<div class="kind arcade">
    <p class="kicker">prim-arcade · ${esc(name)} · ${esc(pack.system || "nes")}</p>
    <div class="screen"></div>
    <p class="keys">Arrows move · X A · Z B · Enter start</p>
  </div>`;
  const screen = el.querySelector(".screen");
  const jsnes = await loadJsnes();
  nes = new jsnes.Browser({
    container: screen,
    onError: (e) => { screen.dataset.err = String(e && e.message ? e.message : e); },
  });
  nes.loadROM(pack.rom);
  const fit = () => { try { nes.fitInParent(); } catch {} };
  queueMicrotask(fit);
  requestAnimationFrame(fit);
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
