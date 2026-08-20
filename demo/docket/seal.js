/** Click-through: validate the pack, keep the model blind, then expose via WebMCP. */

export function createSeal(host) {
  let pack = null;

  function disable() {
    host.root().querySelectorAll(".beat button").forEach((b) => { b.disabled = true; });
  }

  function beat(html, label, onClick) {
    disable();
    const row = host.add("them", `${html}<div class="beat"><button type="button">${host.esc(label)}</button></div>`);
    const btn = row.querySelector(".beat button");
    btn.addEventListener("click", async () => {
      if (btn.disabled) return;
      disable();
      host.add("me", host.esc(label));
      await onClick();
    });
    host.scroll();
  }

  async function start() {
    await host.say("This is LastPass for apps. The pack stays the pack. The tool cites it.");
    beat("The chat can check that the file opens. It does not get the work unless you say so.", "Send atlas.docket.prim", send);
  }

  async function send() {
    host.add("me", host.attachHTML("atlas.docket.prim", "attached"));
    beat("Drop it. I will validate. I will not read the titles.", "Drop it on the thread", drop);
  }

  async function drop() {
    pack = await host.fetchPrim("atlas.docket.prim");
    const n = pack.tasks.length;
    await host.say("Readable. The editor can cite it. The model has not seen the contents.");
    host.showSeal({ file: "atlas.docket.prim", records: n });
    beat("Still sealed. Now say you only wanted your AI to look at it.", "Expose via WebMCP", expose);
  }

  async function expose() {
    await host.say("docket-webmcp (webmcp) connector/talk cites docket. Exposed to a local model. The thread still has no copy.");
    host.showExposed(pack);
    beat("The local model can operate the editor now. Ask it what’s blocked.", "Ask what’s blocked", ask);
  }

  async function ask() {
    const blocked = pack.tasks.filter((t) => t.blocked_reason);
    const line = blocked.length
      ? blocked.map((t) => `${t.id} ${t.title} — ${t.blocked_reason}`).join("<br>")
      : "Nothing is blocked.";
    await host.say(`Local model, via the connector:<br>${line}`);
    await host.say("The chat never had the file. The connector did, because you said so.");
  }

  return { start };
}
