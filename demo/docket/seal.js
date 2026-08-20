/** Auto-walk: validate the pack, keep the model blind, then expose via WebMCP. */

export function createSeal(host) {
  let pack = null;

  async function start() {
    await host.say("This is LastPass for apps. The pack stays the pack. The tool cites it.");
    await host.say("The chat can check that the file opens. It does not get the work unless you say so.");
    if (!host.alive()) return;
    host.add("me", host.attachHTML("atlas.docket.prim", "attached"));
    pack = await host.fetchPrim("atlas.docket.prim");
    if (!host.alive()) return;
    await finish(pack, "atlas.docket.prim");
  }

  async function fromDrop(parsed, name) {
    pack = parsed;
    await finish(pack, name);
  }

  async function finish(parsed, name) {
    const n = parsed.tasks ? parsed.tasks.length : 0;
    await host.say("Readable. The editor can cite it. The model has not seen the contents.");
    host.showSeal({ file: name, records: n });
    await host.say("Still sealed. Now say you only wanted your AI to look at it.");
    await host.say("docket-webmcp (webmcp) connector/talk cites docket. Exposed to a local model. The thread still has no copy.");
    host.showExposed(parsed);
    const blocked = (parsed.tasks || []).filter((t) => t.blocked_reason);
    const line = blocked.length
      ? blocked.map((t) => `${t.id} ${t.title} — ${t.blocked_reason}`).join("<br>")
      : "Nothing is blocked.";
    await host.say(`Local model, via the connector:<br>${line}`);
    await host.say("The chat never had the file. The connector did, because you said so.");
    host.tryYourself();
  }

  return { start, fromDrop };
}
