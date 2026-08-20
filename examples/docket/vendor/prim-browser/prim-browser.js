/**
 * Prim Browser cockpit.
 *
 * Modes:
 *   framed-preview — iframe stage (NOT arbitrary-site browsing)
 *   companion      — drives local Chromium via extension (product path)
 *
 *   PrimBrowser.mount('#slot', { mode: 'companion', extensionId: '…' })
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PrimBrowser = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const NAME = "prim-browser";
  const VERSION = "0.3.0";

  function el(tag, attrs, kids) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === "className") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.startsWith("on") && typeof attrs[k] === "function")
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      });
    }
    (kids || []).forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function normalizeUrl(raw) {
    const s = String(raw || "").trim();
    if (!s || s === "about:blank") return "about:blank";
    if (/^https?:\/\//i.test(s)) return s;
    if (/^about:/i.test(s)) return s;
    return "https://" + s;
  }

  function mount(target, options) {
    const opts = Object.assign(
      {
        url: "about:blank",
        title: "Prim Browser",
        compact: false,
        mode: "framed-preview", // framed-preview | companion
        extensionId: null,
        onChange: null
      },
      options || {}
    );

    const companion = opts.mode === "companion";
    const host = typeof target === "string" ? document.querySelector(target) : target;
    if (!host) throw new Error("PrimBrowser.mount: target not found");

    const state = {
      stack: [],
      index: -1,
      status: companion ? "starting" : "live",
      controller: "none",
      fidelity: companion ? "local-companion" : "framed-preview",
      lastObserve: null
    };

    const urlInput = el("input", {
      className: "prim-browser__url",
      type: "url",
      spellcheck: "false",
      autocomplete: "off",
      placeholder: "https://"
    });
    const titleEl = el("div", { className: "prim-browser__title", text: opts.title });
    const statusEl = el("div", { className: "prim-browser__status" }, [
      el("span", { className: "pb-status-url", text: "about:blank" }),
      el("span", {
        className: "pb-status-note",
        text: companion ? "companion · local" : "framed preview · not arbitrary-site"
      })
    ]);
    const blank = el("div", {
      className: "prim-browser__blank",
      text: companion
        ? "Connect the Prim Browser Companion extension. Stage shows session state — not a framed target site."
        : "Framed preview only. Sites that forbid framing stay blank. For real browsing use companion mode."
    });
    const stageBody = el("div", { className: "prim-browser__stage-body" });
    const frame = el("iframe", {
      className: "prim-browser__frame",
      title: "Prim Browser framed preview",
      referrerpolicy: "no-referrer-when-downgrade"
    });
    frame.setAttribute(
      "sandbox",
      "allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"
    );

    const btnBack = el("button", { type: "button", title: "Back", "aria-label": "Back", text: "←" });
    const btnFwd = el("button", { type: "button", title: "Forward", "aria-label": "Forward", text: "→" });
    const btnReload = el("button", { type: "button", title: "Reload", "aria-label": "Reload", text: "↻" });
    const btnGo = el("button", { className: "prim-browser__go", type: "button", title: "Go", text: "Go" });
    const btnTake = el("button", {
      className: "prim-browser__go",
      type: "button",
      title: "Take control",
      text: "Take control"
    });

    const stageKids = companion ? [blank, stageBody] : [blank, frame];
    const chromeKids = companion
      ? [el("div", { className: "prim-browser__nav" }, [btnBack, btnFwd, btnReload]), urlInput, btnGo, btnTake]
      : [el("div", { className: "prim-browser__nav" }, [btnBack, btnFwd, btnReload]), urlInput, btnGo];

    const root = el(
      "div",
      {
        className:
          "prim-browser" +
          (opts.compact ? " prim-browser--compact" : "") +
          (companion ? " prim-browser--companion" : " prim-browser--framed"),
        role: "application",
        "aria-label": "Prim Browser",
        "data-mode": opts.mode,
        "data-fidelity": state.fidelity
      },
      [
        el("div", { className: "prim-browser__titlebar" }, [
          el("div", { className: "prim-browser__dots" }, [el("span"), el("span"), el("span")]),
          titleEl
        ]),
        el("div", { className: "prim-browser__chrome", role: "toolbar", "aria-label": "Browser chrome" }, chromeKids),
        el("div", { className: "prim-browser__stage" }, stageKids),
        statusEl
      ]
    );

    host.innerHTML = "";
    host.appendChild(root);

    function emit(type, detail) {
      root.dispatchEvent(new CustomEvent("prim-browser:" + type, { detail: detail || {}, bubbles: true }));
      if (typeof opts.onChange === "function") opts.onChange(type, detail || {});
    }

    function setStatus(s) {
      state.status = s;
      if (companion) {
        stageBody.textContent =
          "status: " +
          state.status +
          " · controller: " +
          state.controller +
          " · fidelity: " +
          state.fidelity;
        blank.hidden = true;
      }
      emit("status", { status: state.status, controller: state.controller, fidelity: state.fidelity });
    }

    function syncChrome() {
      const url = currentUrl();
      urlInput.value = url === "about:blank" ? "" : url;
      statusEl.querySelector(".pb-status-url").textContent = url;
      btnBack.disabled = state.index <= 0;
      btnFwd.disabled = state.index < 0 || state.index >= state.stack.length - 1;
      if (!companion) blank.hidden = url !== "about:blank";
      titleEl.textContent = url === "about:blank" ? opts.title : hostname(url);
    }

    function hostname(url) {
      try {
        return new URL(url).hostname || opts.title;
      } catch {
        return opts.title;
      }
    }

    function currentUrl() {
      if (state.index < 0) return "about:blank";
      return state.stack[state.index] || "about:blank";
    }

    function pushUrl(next) {
      state.stack = state.stack.slice(0, state.index + 1);
      if (state.stack[state.stack.length - 1] !== next) state.stack.push(next);
      state.index = state.stack.length - 1;
    }

    function sendCompanion(cmd) {
      return new Promise((resolve, reject) => {
        if (!opts.extensionId || typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
          reject(new Error("companion extension not available — load Prim Browser Companion and set extensionId"));
          return;
        }
        chrome.runtime.sendMessage(opts.extensionId, cmd, (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!res || !res.ok) reject(new Error((res && res.error) || "companion error"));
          else resolve(res.result);
        });
      });
    }

    async function navigate(url) {
      const next = normalizeUrl(url);
      pushUrl(next);
      syncChrome();
      if (companion) {
        setStatus("live");
        const r = await sendCompanion({ type: "navigate", url: next, as: "agent" });
        state.controller = "agent";
        emit("navigate", { url: next, via: "companion", result: r });
        return observe();
      }
      if (next === "about:blank") {
        frame.removeAttribute("src");
        try {
          frame.srcdoc = "";
        } catch (_) {}
      } else frame.src = next;
      emit("navigate", { url: next, via: "framed-preview" });
      return observe();
    }

    async function back() {
      if (companion) {
        await sendCompanion({ type: "back", as: "agent" });
        if (state.index > 0) state.index -= 1;
        syncChrome();
        return observe();
      }
      if (state.index <= 0) return observe();
      state.index -= 1;
      frame.src = state.stack[state.index];
      syncChrome();
      return observe();
    }

    async function forward() {
      if (companion) {
        await sendCompanion({ type: "forward", as: "agent" });
        if (state.index < state.stack.length - 1) state.index += 1;
        syncChrome();
        return observe();
      }
      if (state.index >= state.stack.length - 1) return observe();
      state.index += 1;
      frame.src = state.stack[state.index];
      syncChrome();
      return observe();
    }

    async function reload() {
      const url = currentUrl();
      if (companion) {
        await sendCompanion({ type: "reload", as: "agent" });
        emit("reload", { url, via: "companion" });
        return observe();
      }
      if (url === "about:blank") return observe();
      frame.src = url;
      emit("reload", { url, via: "framed-preview" });
      return observe();
    }

    async function takeControl() {
      if (!companion) return { ok: false, error: "take_control requires companion mode" };
      const r = await sendCompanion({ type: "take_control" });
      state.controller = "human";
      setStatus("live");
      emit("lease", r);
      return r;
    }

    async function observe() {
      if (companion) {
        try {
          const r = await sendCompanion({ type: "observe" });
          const detail = (r && r.detail) || r;
          state.lastObserve = detail;
          if (detail && detail.url) {
            if (currentUrl() !== detail.url) pushUrl(detail.url);
            syncChrome();
          }
          const card = Object.assign(
            { ok: true, prim: NAME, version: VERSION, mode: "companion", status: state.status },
            detail || {}
          );
          emit("observe", card);
          return card;
        } catch (e) {
          setStatus("reconnecting");
          const card = {
            ok: false,
            prim: NAME,
            version: VERSION,
            mode: "companion",
            status: state.status,
            fidelity: state.fidelity,
            error: String(e.message || e)
          };
          emit("observe", card);
          return card;
        }
      }
      const url = currentUrl();
      let title = null;
      let sameOrigin = false;
      try {
        const doc = frame.contentDocument;
        if (doc) {
          sameOrigin = true;
          title = doc.title || null;
        }
      } catch (_) {
        sameOrigin = false;
      }
      const card = {
        ok: true,
        prim: NAME,
        version: VERSION,
        mode: "framed-preview",
        fidelity: "framed-preview",
        url,
        title,
        sameOrigin,
        canGoBack: state.index > 0,
        canGoForward: state.index >= 0 && state.index < state.stack.length - 1,
        history: state.stack.slice(),
        warning: "Framed preview — not arbitrary-site browsing"
      };
      emit("observe", card);
      return card;
    }

    function tools() {
      return {
        name: NAME,
        version: VERSION,
        description: companion
          ? "Prim Browser companion cockpit — local Chromium-family bridge."
          : "Framed preview cockpit — not the arbitrary-web product path.",
        list: [
          { name: "navigate", args: ["url"] },
          { name: "back", args: [] },
          { name: "forward", args: [] },
          { name: "reload", args: [] },
          { name: "observe", args: [] },
          { name: "url", args: [] },
          { name: "take_control", args: [] },
          { name: "status", args: [] }
        ],
        call(name, args) {
          args = args || {};
          switch (name) {
            case "navigate":
              return navigate(args.url || args[0]);
            case "back":
              return back();
            case "forward":
              return forward();
            case "reload":
              return reload();
            case "observe":
              return observe();
            case "url":
              return { ok: true, url: currentUrl() };
            case "take_control":
              return takeControl();
            case "status":
              return {
                ok: true,
                status: state.status,
                controller: state.controller,
                fidelity: state.fidelity,
                mode: opts.mode
              };
            default:
              throw new Error("unknown tool: " + name);
          }
        }
      };
    }

    btnBack.addEventListener("click", () => {
      takeControl().catch(() => {});
      back().catch((e) => emit("error", { error: String(e.message || e) }));
    });
    btnFwd.addEventListener("click", () => {
      takeControl().catch(() => {});
      forward().catch((e) => emit("error", { error: String(e.message || e) }));
    });
    btnReload.addEventListener("click", () => {
      takeControl().catch(() => {});
      reload().catch((e) => emit("error", { error: String(e.message || e) }));
    });
    btnGo.addEventListener("click", () => navigate(urlInput.value).catch((e) => emit("error", { error: String(e.message || e) })));
    btnTake.addEventListener("click", () => takeControl().catch((e) => emit("error", { error: String(e.message || e) })));
    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        navigate(urlInput.value).catch((err) => emit("error", { error: String(err.message || err) }));
      }
    });
    if (!companion) {
      frame.addEventListener("load", () => {
        syncChrome();
        observe();
      });
    }

    if (opts.url && opts.url !== "about:blank") {
      navigate(opts.url).catch((e) => emit("error", { error: String(e.message || e) }));
    } else {
      syncChrome();
      if (companion) setStatus("starting");
    }

    const api = {
      name: NAME,
      version: VERSION,
      mode: opts.mode,
      root,
      navigate,
      back,
      forward,
      reload,
      observe,
      takeControl,
      tools,
      url: currentUrl,
      destroy() {
        host.innerHTML = "";
      }
    };

    root._primBrowser = api;
    host._primBrowser = api;
    return api;
  }

  function from(element) {
    const node = typeof element === "string" ? document.querySelector(element) : element;
    return (
      (node && (node._primBrowser || (node.querySelector && node.querySelector(".prim-browser")?._primBrowser))) || null
    );
  }

  function defineElement() {
    if (typeof customElements === "undefined" || customElements.get("prim-browser")) return;
    class PrimBrowserElement extends HTMLElement {
      connectedCallback() {
        if (this._mounted) return;
        this._mounted = true;
        const url = this.getAttribute("url") || "about:blank";
        const compact = this.hasAttribute("compact");
        const mode = this.getAttribute("mode") || "framed-preview";
        const extensionId = this.getAttribute("extension-id") || null;
        this.style.display = this.style.display || "block";
        this.style.minHeight = this.style.minHeight || (compact ? "18rem" : "28rem");
        this._api = mount(this, {
          url,
          compact,
          mode,
          extensionId,
          title: this.getAttribute("title") || "Prim Browser"
        });
      }
      get api() {
        return this._api;
      }
    }
    customElements.define("prim-browser", PrimBrowserElement);
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", defineElement);
    else defineElement();
  }

  return { NAME, VERSION, mount, from, defineElement };
});
