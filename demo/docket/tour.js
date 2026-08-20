/** Auto-walk: docket → deck → invoice → session. A try-yourself button resets to a real drop. */

const ORDER = ["docket", "deck", "invoice", "session"];

export function createWalk(host) {
  async function start() {
    await host.say("Four files. Same split every time: the pack is the work, the editor cites it.");
    await host.say("Watch it once. Then you can do the file yourself.");
    for (let i = 0; i < ORDER.length; i++) {
      if (!host.alive()) return;
      const id = ORDER[i];
      const r = host.room(id);
      host.setKind(id);
      await host.say(r.open);
      await host.say(r.offer);
      if (!host.alive()) return;
      host.add("me", host.attachHTML(r.file, "attached"));
      const parsed = await host.fetchPrim(r.file);
      if (!host.alive()) return;
      await host.say("Opened. The editor cites the pack — it isn’t a copy.");
      await host.openEditor(id, parsed);
      await host.say(r.after);
    }
    if (!host.alive()) return;
    await host.say("That’s the category. File + editor. Four times. The other chats are one kind each.");
    host.tryYourself();
  }

  return { start };
}
