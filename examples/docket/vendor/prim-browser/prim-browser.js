/**
 * Prim Browser — EmulatorJS shape.
 * A prim tool runs in the browser. Not a cloud Chromium client.
 *
 *   PrimBrowser.mount('#slot', { url: 'https://example.com' })
 *   instance.navigate(url) / back() / forward() / reload() / observe() / tools()
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PrimBrowser = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const NAME = "prim-browser";
  const VERSION = "0.2.0";

  function el(tag, attrs, kids) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === "className") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.startsWith("on") && typeof attrs[k] === "function") node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
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
        onChange: null
      },
      options || {}
    );

    const host = typeof target === "string" ? document.querySelector(target) : target;
    if (!host) throw new Error("PrimBrowser.mount: target not found");

    const state = {
      stack: [],
      index: -1,
      loading: false
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
      el("span", { className: "pb-status-note", text: "embedded · not cloud" })
    ]);
    const blank = el("div", {
      className: "prim-browser__blank",
      text: "Enter a URL. Sites that forbid framing stay blank — that’s the embed tradeoff, not a cloud jar."
    });
    const frame = el("iframe", {
      className: "prim-browser__frame",
      title: "Prim Browser document",
      referrerpolicy: "no-referrer-when-downgrade"
    });
    // sandbox: allow scripts/forms/same-origin for usable browsing; no top-nav
    frame.setAttribute(
      "sandbox",
      "allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads"
    );

    const btnBack = el("button", { type: "button", title: "Back", "aria-label": "Back", text: "←" });
    const btnFwd = el("button", { type: "button", title: "Forward", "aria-label": "Forward", text: "→" });
    const btnReload = el("button", { type: "button", title: "Reload", "aria-label": "Reload", text: "↻" });
    const btnGo = el("button", { className: "prim-browser__go", type: "button", title: "Go", text: "Go" });

    const root = el("div", {
      className: "prim-browser" + (opts.compact ? " prim-browser--compact" : ""),
      role: "application",
      "aria-label": "Prim Browser"
    }, [
      el("div", { className: "prim-browser__titlebar" }, [
        el("div", { className: "prim-browser__dots" }, [el("span"), el("span"), el("span")]),
        titleEl
      ]),
      el("div", { className: "prim-browser__chrome", role: "toolbar", "aria-label": "Browser chrome" }, [
        el("div", { className: "prim-browser__nav" }, [btnBack, btnFwd, btnReload]),
        urlInput,
        btnGo
      ]),
      el("div", { className: "prim-browser__stage" }, [blank, frame]),
      statusEl
    ]);

    host.innerHTML = "";
    host.appendChild(root);

    function emit(type, detail) {
      root.dispatchEvent(new CustomEvent("prim-browser:" + type, { detail: detail || {}, bubbles: true }));
      if (typeof opts.onChange === "function") opts.onChange(type, detail || {});
    }

    function syncChrome() {
      const url = currentUrl();
      urlInput.value = url === "about:blank" ? "" : url;
      statusEl.querySelector(".pb-status-url").textContent = url;
      btnBack.disabled = state.index <= 0;
      btnFwd.disabled = state.index < 0 || state.index >= state.stack.length - 1;
      blank.hidden = url !== "about:blank";
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

    function load(url, push) {
      const next = normalizeUrl(url);
      state.loading = true;
      if (push) {
        state.stack = state.stack.slice(0, state.index + 1);
        if (state.stack[state.stack.length - 1] !== next) state.stack.push(next);
        state.index = state.stack.length - 1;
      }
      if (next === "about:blank") {
        frame.removeAttribute("src");
        try {
          frame.srcdoc = "";
        } catch (_) {}
      } else {
        frame.src = next;
      }
      syncChrome();
      emit("navigate", { url: next });
      state.loading = false;
      return observe();
    }

    function navigate(url) {
      return load(url, true);
    }

    function back() {
      if (state.index <= 0) return observe();
      state.index -= 1;
      return load(state.stack[state.index], false);
    }

    function forward() {
      if (state.index >= state.stack.length - 1) return observe();
      state.index += 1;
      return load(state.stack[state.index], false);
    }

    function reload() {
      const url = currentUrl();
      if (url === "about:blank") return observe();
      frame.src = url;
      emit("reload", { url });
      return observe();
    }

    function observe() {
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
        url,
        title,
        sameOrigin,
        canGoBack: state.index > 0,
        canGoForward: state.index >= 0 && state.index < state.stack.length - 1,
        history: state.stack.slice()
      };
      emit("observe", card);
      return card;
    }

    /** Tool surface for a chat bot / agent in the same page. */
    function tools() {
      return {
        name: NAME,
        version: VERSION,
        description: "Embedded browser prim. Runs in the page like EmulatorJS — not cloud Chromium.",
        list: [
          { name: "navigate", args: ["url"] },
          { name: "back", args: [] },
          { name: "forward", args: [] },
          { name: "reload", args: [] },
          { name: "observe", args: [] },
          { name: "url", args: [] }
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
            default:
              throw new Error("unknown tool: " + name);
          }
        }
      };
    }

    btnBack.addEventListener("click", () => back());
    btnFwd.addEventListener("click", () => forward());
    btnReload.addEventListener("click", () => reload());
    btnGo.addEventListener("click", () => navigate(urlInput.value));
    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        navigate(urlInput.value);
      }
    });
    frame.addEventListener("load", () => {
      syncChrome();
      emit("load", observe());
    });

    // initial
    if (opts.url && opts.url !== "about:blank") navigate(opts.url);
    else syncChrome();

    const api = {
      name: NAME,
      version: VERSION,
      root,
      navigate,
      back,
      forward,
      reload,
      observe,
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
    return (node && (node._primBrowser || (node.querySelector && node.querySelector(".prim-browser")?._primBrowser))) || null;
  }

  // <prim-browser url="…">
  function defineElement() {
    if (typeof customElements === "undefined" || customElements.get("prim-browser")) return;
    class PrimBrowserElement extends HTMLElement {
      connectedCallback() {
        if (this._mounted) return;
        this._mounted = true;
        const url = this.getAttribute("url") || "about:blank";
        const compact = this.hasAttribute("compact");
        this.style.display = this.style.display || "block";
        this.style.minHeight = this.style.minHeight || (compact ? "18rem" : "28rem");
        this._api = mount(this, { url, compact, title: this.getAttribute("title") || "Prim Browser" });
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
