/** Click-through walk: docket → deck → invoice → session. Nothing advances without a button. */

const ORDER = ["docket", "deck", "invoice", "session"];

export function createWalk(host) {
  let index = 0;

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
    index = 0;
    await host.say("Four files. Same split every time: the pack is the work, the editor cites it.");
    beat("I won’t play it for you. Click through all four, in order.", "Start with the docket", line);
  }

  async function line() {
    const id = ORDER[index];
    const r = host.room(id);
    host.setKind(id);
    await host.say(r.open);
    beat(r.offer, `Send ${r.file}`, send);
  }

  async function send() {
    const r = host.room(ORDER[index]);
    host.add("me", host.attachHTML(r.file, "attached"));
    beat("Drop it on the thread. That’s what opening a prim is.", "Drop it on the thread", drop);
  }

  async function drop() {
    const id = ORDER[index];
    const r = host.room(id);
    const parsed = await host.fetchPrim(r.file);
    await host.say("Opened. The editor cites the pack — it isn’t a copy.");
    await host.openEditor(id, parsed);
    if (index >= ORDER.length - 1) {
      await host.say("That’s the category. File + editor. Four times. The other chats are one kind each.");
      return;
    }
    const next = host.room(ORDER[index + 1]);
    beat(r.after, `Next — the ${next.title.toLowerCase()}`, async () => {
      index += 1;
      await line();
    });
  }

  return { start };
}
