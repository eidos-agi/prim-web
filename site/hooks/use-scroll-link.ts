import { useLayoutEffect, type RefObject } from "react";

function clamp(n: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, n));
}

/** Map each [data-beat] through the viewport onto --p / --vis. */
export function useScrollLink(
  root: RefObject<HTMLElement | null>,
  onActive?: (id: string) => void,
) {
  useLayoutEffect(() => {
    const pin = root.current;
    if (!pin) return;
    let raf = 0;
    let lastId = "";

    const tick = () => {
      raf = 0;
      const beats = [
        ...pin.querySelectorAll<HTMLElement>("[data-beat]"),
      ];
      if (!beats.length) return;

      const vh = window.innerHeight;
      const sweet = vh * 0.42;
      const firstBox = beats[0].getBoundingClientRect();
      const lastBox = beats[beats.length - 1].getBoundingClientRect();

      const setVis = (el: HTMLElement, vis: number, p: number) => {
        el.style.setProperty("--vis", vis.toFixed(4));
        el.style.setProperty("--p", p.toFixed(4));
      };

      if (firstBox.top > sweet) {
        beats.forEach((el, i) => setVis(el, i === 0 ? 1 : 0, 0));
        const id = beats[0].dataset.beat ?? "";
        if (id && id !== lastId) {
          lastId = id;
          onActive?.(id);
        }
        return;
      }

      if (lastBox.bottom < sweet) {
        beats.forEach((el, i) =>
          setVis(el, i === beats.length - 1 ? 1 : 0, 1),
        );
        const id = beats[beats.length - 1].dataset.beat ?? "";
        if (id && id !== lastId) {
          lastId = id;
          onActive?.(id);
        }
        return;
      }

      let bestId = "";
      let bestVis = -1;
      beats.forEach((el) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const range = Math.max(r.height * 0.55, vh * 0.38);
        const vis = clamp(1 - Math.abs(sweet - center) / range);
        const p = clamp((sweet - r.top) / Math.max(r.height, 1));
        setVis(el, vis, p);
        const id = el.dataset.beat ?? "";
        if (vis > bestVis) {
          bestVis = vis;
          bestId = id;
        }
      });

      if (bestId && bestId !== lastId) {
        lastId = bestId;
        onActive?.(bestId);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    const mo = new MutationObserver(onScroll);
    mo.observe(pin, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [root, onActive]);
}
