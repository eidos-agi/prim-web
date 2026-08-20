/** Prim Arcade — NES via JSNES, N64 via EmulatorJS (iframe). */

let nes = null;
let n64 = null;

const N64_CORE = "mupen64plus_next";

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
  if (n64) {
    try { n64.remove(); } catch {}
    n64 = null;
  }
}

export async function renderArcade(el, pack) {
  stopArcade();
  const system = pack.system === "n64" ? "n64" : "nes";
  const name = pack.project?.name || "cart";
  const keys = system === "n64"
    ? "Play loads the N64 core (EmulatorJS · mupen64plus_next). Lawful carts only."
    : "Arrows move · X A · Z B · Enter start";
  el.innerHTML = `<div class="kind arcade ${system}">
    <p class="kicker">prim-arcade · ${esc(name)} · ${esc(system)}</p>
    <div class="screen"></div>
    <p class="keys">${keys}</p>
  </div>`;
  const screen = el.querySelector(".screen");
  if (system === "n64") return renderN64(screen, pack);
  return renderNes(screen, pack);
}

async function renderNes(screen, pack) {
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

function renderN64(screen, pack) {
  if (!pack.rom || !pack.rom.byteLength) {
    screen.innerHTML = `<p class="empty">Drop a lawful .z64 / .n64 / .v64. Prim Arcade will not fetch a cart for you.</p>`;
    return;
  }
  const go = document.createElement("button");
  go.type = "button";
  go.className = "go";
  go.textContent = "Play";
  go.addEventListener("click", () => bootN64(screen, pack));
  screen.appendChild(go);
}

function bootN64(screen, pack) {
  screen.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.className = "n64";
  iframe.title = "Prim Arcade N64";
  iframe.setAttribute("allow", "autoplay; gamepad; fullscreen");
  iframe.src = "./n64-frame.html";
  n64 = iframe;
  const rom = pack.rom;
  const payload = {
    type: "rom",
    name: pack.project?.cart || pack.project?.name || "cart.z64",
    core: pack.core || N64_CORE,
    rom: rom.buffer.slice(rom.byteOffset, rom.byteOffset + rom.byteLength),
  };
  const send = () => {
    try { iframe.contentWindow.postMessage(payload, "*"); } catch {}
  };
  iframe.addEventListener("load", send);
  window.addEventListener("message", function ready(e) {
    if (e.source !== iframe.contentWindow) return;
    if (e.data && e.data.type === "n64-ready") {
      window.removeEventListener("message", ready);
      send();
    }
  });
  screen.appendChild(iframe);
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
