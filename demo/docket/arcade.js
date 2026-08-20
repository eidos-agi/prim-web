/** Prim Arcade — NES via JSNES, N64 and Doom via EmulatorJS (iframe). */

let nes = null;
let ejs = null;
let fitWatch = null;
let fitOnResize = null;

const N64_CORE = "mupen64plus_next";
const DOOM_CORE = "prboom";
const FREEDOOM_ZIP = "./vendor/freedoom/freedoom-0.13.0.zip";

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
  if (fitOnResize) {
    window.removeEventListener("resize", fitOnResize);
    fitOnResize = null;
  }
  if (fitWatch) {
    try { fitWatch.disconnect(); } catch {}
    fitWatch = null;
  }
  if (nes) {
    try { nes.destroy(); } catch {}
    nes = null;
  }
  if (ejs) {
    try { ejs.remove(); } catch {}
    ejs = null;
  }
}

export async function renderArcade(el, pack) {
  stopArcade();
  const system = pack.system === "n64" || pack.system === "doom" ? pack.system : "nes";
  const name = pack.project?.name || "cart";
  const keys = system === "doom"
    ? "Play loads prboom on Freedoom Phase 1 — not the id IWAD. WASD, mouse, gamepad."
    : system === "n64"
      ? "Play loads the N64 core (EmulatorJS · mupen64plus_next). Threads + 60 fps. Lawful carts only."
      : "Arrows move · X A · Z B · Enter start";
  el.innerHTML = `<div class="kind arcade ${system}">
    <p class="kicker">prim-arcade · ${esc(name)} · ${esc(system)}</p>
    <div class="fit"><div class="screen"></div></div>
    <p class="keys">${keys}</p>
  </div>`;
  const screen = el.querySelector(".screen");
  if (system === "n64" || system === "doom") return renderEjs(screen, pack);
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
  watchFit(screen, fit);
}

function renderEjs(screen, pack) {
  if (!pack.rom || !pack.rom.byteLength) {
    screen.innerHTML = `<p class="empty">Drop a lawful cart, or ask to play Doom for Freedoom.</p>`;
    return;
  }
  const go = document.createElement("button");
  go.type = "button";
  go.className = "go";
  go.textContent = "Play";
  go.addEventListener("click", () => bootEjs(screen, pack));
  screen.appendChild(go);
}

function bootEjs(screen, pack) {
  screen.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.className = "ejs";
  iframe.title = pack.system === "doom" ? "Prim Arcade Doom" : "Prim Arcade N64";
  iframe.setAttribute("allow", "autoplay; gamepad; fullscreen; cross-origin-isolated");
  iframe.style.background = "#000";
  iframe.style.colorScheme = "dark";
  iframe.src = "./ejs-frame.html";
  ejs = iframe;
  const rom = pack.rom;
  const payload = {
    type: "rom",
    name: pack.project?.cart || pack.project?.name || "cart",
    core: pack.core || (pack.system === "doom" ? DOOM_CORE : N64_CORE),
    rom: rom.buffer.slice(rom.byteOffset, rom.byteOffset + rom.byteLength),
  };
  const send = () => {
    try { iframe.contentWindow.postMessage(payload, "*"); } catch {}
  };
  iframe.addEventListener("load", send);
  window.addEventListener("message", function ready(e) {
    if (e.source !== iframe.contentWindow) return;
    if (e.data && (e.data.type === "ejs-ready" || e.data.type === "n64-ready")) {
      window.removeEventListener("message", ready);
      iframe.dataset.threads = e.data.threads ? "1" : "0";
      iframe.dataset.isolated = e.data.isolated ? "1" : "0";
      send();
    }
  });
  screen.appendChild(iframe);
}

function watchFit(screen, onFit) {
  if (fitWatch) {
    try { fitWatch.disconnect(); } catch {}
    fitWatch = null;
  }
  const box = screen.closest(".fit") || screen;
  const run = () => {
    onFit();
  };
  if (typeof ResizeObserver === "function") {
    fitWatch = new ResizeObserver(run);
    fitWatch.observe(box);
  }
  if (fitOnResize) window.removeEventListener("resize", fitOnResize);
  fitOnResize = run;
  window.addEventListener("resize", fitOnResize, { passive: true });
  queueMicrotask(run);
  requestAnimationFrame(run);
}

export async function loadFreedoom(unzip) {
  const res = await fetch(FREEDOOM_ZIP);
  if (!res.ok) throw new Error("Freedoom zip missing");
  const zip = unzip(new Uint8Array(await res.arrayBuffer()));
  const key = Object.keys(zip).find((k) => k.replace(/^.*\//, "") === "freedoom1.wad");
  const rom = key ? zip[key] : null;
  if (!(rom instanceof Uint8Array) || !rom.byteLength) throw new Error("freedoom1.wad missing");
  return {
    kind: "arcade",
    system: "doom",
    core: DOOM_CORE,
    project: { name: "Freedoom Phase 1", cart: "freedoom1.wad" },
    rom,
  };
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
