import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { WorkScenes } from "@/components/work-scenes";
import { FloorStory } from "@/components/floor-story";
import { NextWork } from "@/components/next-work";
import { LazyImg } from "@/components/lazy-img";
import { Copy, OutIn, Pair, Scene, Screen } from "@/components/story";
import { FileRiver } from "@/components/file-river";
import { FactoryBox } from "@/components/factory-box";
import { FactoryVideo } from "@/components/factory-video";
import { PressStory } from "@/components/press-story";
import { SiteHeader } from "@/components/site-header";
import { Cite } from "@/components/cite";
import { Sources } from "@/components/sources";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

const PROPERTIES = [
  {
    name: "AI-native",
    body: "Agents can read, validate, reason over, and act on them without translation layers.",
  },
  {
    name: "Memory",
    body: "Durable, versioned, supersedable knowledge that persists across sessions and agents.",
  },
  {
    name: "Evidence-first",
    body: "Claims carry provenance, trust tiers, and hashes.",
  },
  {
    name: "Human-readable",
    body: "Still openable and understandable by people.",
  },
  {
    name: "Generative interfaces",
    body: "No fixed UX. Views are rendered on demand — json-render style.",
  },
];

const PHRASES = [
  "Send me the prim.",
  "Don’t send the spreadsheet — just send the prim.",
  "An AI session itself is a type of Prim.",
  "Store the concept. Generate the files.",
];

const AGENTS = [
  {
    name: "They can read it",
    body: "No scraping a deck. No guessing which tab is the source of truth. The file is native — agents reason over it without a translation layer.",
  },
  {
    name: "They can trust it",
    body: "Claims carry evidence, hashes, and provenance. Validation is fail-closed. An agent doesn’t have to hope the spreadsheet is right.",
  },
  {
    name: "They can continue it",
    body: "A session is a Prim. The next agent picks up the same file. Work doesn’t die when the window closes.",
  },
];

const ENTERPRISE = [
  {
    name: "Time capsules",
    body: "The work survives the person, the session, and the vendor. Open it in ten years. It’s still the Prim.",
  },
  {
    name: "Shareable",
    body: "One file. Desk to desk, agent to agent, counsel to the board. You send the prim — not a zip of conflicting sheets.",
  },
  {
    name: "Company property",
    body: "The knowledge is the firm’s. Not trapped in someone’s laptop, a chat log, or a tool that walks out the door.",
  },
];

const TIMELINE = [
  {
    era: "80s",
    year: "1982–89",
    work: "Lotus 1-2-3, WordPerfect, floppy disks",
    note: "One program. One file. One disk.",
  },
  {
    era: "90s",
    year: "1990–99",
    work: "Excel, Word, PowerPoint",
    note: "The suite becomes the job.",
  },
  {
    era: "00s",
    year: "2000–09",
    work: "PDF, email the attachment",
    note: "The file leaves the building.",
  },
  {
    era: "10s",
    year: "2010–19",
    work: "Drive, Dropbox, Slack",
    note: "Cloud copies of the same files.",
  },
  {
    era: "20s",
    year: "2020–",
    work: "Copilot, ChatGPT",
    note: "Agents arrive. Still opening those files.",
  },
];

const PACKAGING = [
  { form: "Directory pack", role: "Canonical source of truth — git, editing, validation." },
  { form: ".prim.zip", role: "Primary interchange. Attach this when you say send me the prim." },
  { form: ".prim.tar.gz", role: "Allowed. Unix and agent workflows." },
  { form: ".prim", role: "Reserved branded container. Zip under the hood." },
];

const FAMILY = [
  { id: "OKF", domain: "Base knowledge + trust", href: "https://github.com/eidos-agi/okflify" },
  { id: "EMF", domain: "Human intent + durable memory", href: "https://github.com/eidos-agi/emf" },
  { id: "ORF", domain: "Research / investigation", href: "https://github.com/eidos-agi/orf" },
  { id: "OPF", domain: "Product graph", href: "https://github.com/eidos-agi/opf" },
  { id: "ODFW", domain: "Spreadsheet → bronze proof", href: "https://github.com/eidos-agi/odwf" },
  { id: "OPFF", domain: "Personal finance packs", href: "https://github.com/eidos-agi/opff" },
  { id: "OMF", domain: "Meeting occurrences", href: "https://github.com/eidos-agi/omf" },
  { id: "OCSF", domain: "Corporate structure & capital", href: "https://github.com/eidos-agi/ocsf" },
];

function Diagram({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="mt-12 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-raised">
      <LazyImg src={src} alt={alt} className="h-auto w-full" />
      <figcaption className="border-t border-line px-5 py-3 text-sm text-muted sm:px-8">
        {caption}
      </figcaption>
    </figure>
  );
}

function Home() {
  return (
    <div id="top" className="min-h-dvh bg-paper text-ink">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-28">
          <p className="text-sm font-medium tracking-wide text-muted">
            The primitive unit of knowledge and memory for AI
          </p>
          <img
            src="/logo.png"
            alt="Prim"
            fetchPriority="high"
            decoding="async"
            className="mt-10 h-auto w-full max-w-xl sm:mt-14 sm:max-w-2xl"
          />
          <h1 className="sr-only">Prim</h1>
          <p className="mt-14 max-w-3xl font-display text-3xl font-medium tracking-tight sm:text-5xl">
            Prims are files for AI + Human collaboration.
          </p>
        </section>

        <section id="press" className="mx-auto max-w-6xl px-5 pb-28 sm:px-8 sm:pb-36">
          <Screen
            num="01"
            size="xl"
            media={<OutIn />}
          >
            <>
              Please join us for three minutes.
              <br />
              As we journey into Prims, a brand new file system necessary for
              the AI age.
            </>
          </Screen>
          <Screen>
            To understand why AI and humans need Prims, not PDFs, we have to
            understand why the printing press needed movable type, not
            feathers.
          </Screen>
          <PressStory />

          <Screen>How will AI change how humans interact with data?</Screen>
          <Copy>
            Knowledge work is a factory.
            <Cite n={2} /> Raw material in, finished idea out. Since Turing
            described a machine that could compute anything,
            <Cite n={1} /> a person sat with it and did that conversion. The
            tools changed. The factory did not.
          </Copy>
          <Scene className="hand-list">
            <Pair
              src="/then-punch.jpg"
              alt="1950s operator feeding punch cards into a room-sized computer."
              kicker="1940s–50s"
              head="Punch cards"
            >
              You punched every hole. Overnight, the machine tabulated. You
              read the listing.
            </Pair>
            <Pair
              src="/then-keys.jpg"
              alt="A person at a keyboard, waiting on a printout."
              kicker="1960s–70s"
              head="Command line"
            >
              You typed every line. A cursor, a command, a wait. One
              instruction at a time.
            </Pair>
            <Pair
              src="/then-excel.jpg"
              alt="1980s office worker at a CRT spreadsheet."
              kicker="1979–"
              head="Mouse and sheet"
            >
              VisiCalc put a ledger on the glass.
              <Cite n={3} /> Then Word. Then slides. You clicked every cell.
              The file was the work.
            </Pair>
            <Pair
              src="/now-speak.jpg"
              alt="Two people talking. The work is spoken, not typed into a format."
              kicker="Now"
              head="Chat"
            >
              You ask. It drafts the whole thing.
            </Pair>
          </Scene>
          <Copy head="Every decade, humans improved the tools they used to refine raw data into knowledge." />
          <Copy head="Now, AI refines raw data into knowledge with near autonomy." />
          <FileRiver />
          <FloorStory />
          <NextWork />

          <Screen num="06">PDFs are the feather. Prims are the press.</Screen>
          <Screen num="07">
            Those feathers went into a cabinet. SharePoint. Drive. Then we
            started the next file.
          </Screen>
          <WorkScenes />
          <p className="mt-16 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            The press didn’t give the monk’s children more feathers. It gave
            them books. Prim is that, for their grandchildren: a meeting,
            spoken; intents; outputs that shape the next time they sit down.
            The instrument changed.
          </p>
        </section>

        <section id="factory" className="mx-auto max-w-6xl px-5 pb-32 pt-12 sm:px-8 sm:pb-40 sm:pt-20">
          <div className="grid gap-6 lg:grid-cols-2">
            <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper">
              <LazyImg
                src="/then-excel.jpg"
                alt="1980s office worker at a CRT, trapped in a spreadsheet."
                className="aspect-[4/3] h-auto w-full object-cover lg:aspect-auto lg:h-full"
              />
              <figcaption className="border-t border-line px-5 py-3 text-sm text-muted">
                A format for a person at a machine.
              </figcaption>
            </figure>
            <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper">
              <LazyImg
                src="/after-collab.jpg"
                alt="Two people working together with a Prim on their screens."
                className="aspect-[4/3] h-auto w-full object-cover lg:aspect-auto lg:h-full"
              />
              <figcaption className="border-t border-line px-5 py-3 text-sm text-muted">
                Humans and AIs contribute to the same file.
              </figcaption>
            </figure>
          </div>
          <div className="mt-8">
            <FactoryBox />
          </div>
          <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-20">
            <p className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
              Those formats were not designed for agents. They were designed
              before agents existed.
            </p>
            <p className="text-base leading-relaxed text-muted">
              We made each file to represent a single concept. Prim reverses
              the order: store the concept, generate the files. Same Excel. Same
              deck. Different century of format.
            </p>
          </div>
          <figure className="mt-20 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-ink">
            <FactoryVideo />
            <figcaption className="border-t border-white/10 px-5 py-3 text-sm text-paper/60">
              A factory exists so a person isn’t the machine. Prim is that, for
              knowledge.
            </figcaption>
          </figure>

          <div id="enterprise" className="mt-28">
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
              Enterprises love Prims because the work lasts, moves, and belongs
              to the company.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-3">
              {ENTERPRISE.map((item) => (
                <article key={item.name} className="bg-paper p-6 sm:p-8">
                  <h3 className="font-display text-xl font-medium tracking-tight">
                    {item.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div id="agents" className="mt-28">
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
              AIs love Prims because they can finally hold the work.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-3">
              {AGENTS.map((item) => (
                <article key={item.name} className="bg-ink p-6 text-paper sm:p-8">
                  <h3 className="font-display text-xl font-medium tracking-tight">
                    {item.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-paper/70">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="https://github.com/eidos-agi/prim">
                Read the spec
                <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#why">Pre-AI</a>
            </Button>
          </div>
        </section>

        <section
          id="why"
          className="border-y border-line bg-raised/60 py-24 sm:py-36"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="font-display text-6xl font-medium tracking-tight sm:text-8xl">
              Pre-AI
            </h2>

            <ol className="mt-10 grid gap-8 border-t border-ink pt-6 sm:mt-14 sm:grid-cols-5 sm:gap-4">
              {TIMELINE.map((tick) => (
                <li key={tick.era}>
                  <p className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
                    {tick.era}
                  </p>
                  <p className="mt-1 font-mono text-xs text-subtle">{tick.year}</p>
                  <p className="mt-4 text-sm font-medium leading-snug text-ink">
                    {tick.work}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{tick.note}</p>
                </li>
              ))}
            </ol>

            <p className="mt-14 max-w-4xl font-display text-2xl font-medium tracking-tight text-ink sm:mt-16 sm:text-4xl">
              We made each file to represent a single concept.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Spreadsheets for structure. Documents for decisions. Decks for the
              story. Notes for memory. Each file was a projection we had to
              author by hand — on whatever machine held that format.
            </p>

            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              {[
                {
                  src: "/then-excel.jpg",
                  format: "Spreadsheet",
                  job: "structure",
                  alt: "1980s office worker at a beige PC, green spreadsheet on a CRT.",
                },
                {
                  src: "/then-word.jpg",
                  format: "Document",
                  job: "decisions",
                  alt: "1980s office worker typing a report on an early word processor.",
                },
                {
                  src: "/then-slides.jpg",
                  format: "Slides",
                  job: "the story",
                  alt: "1980s conference room watching an overhead projector.",
                },
                {
                  src: "/then-notes.jpg",
                  format: "Notes",
                  job: "memory",
                  alt: "1980s desk with a legal pad, floppy disks, and a CRT.",
                },
              ].map((shot) => (
                <figure
                  key={shot.format}
                  className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper"
                >
                  <LazyImg
                    src={shot.src}
                    alt={shot.alt}
                    className="aspect-[4/3] h-auto w-full object-cover"
                  />
                  <figcaption className="flex items-baseline justify-between gap-4 border-t border-line px-5 py-3">
                    <span className="font-display text-base font-medium tracking-tight">
                      {shot.format}
                    </span>
                    <span className="text-sm text-muted">{shot.job}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="font-display text-6xl font-medium tracking-tight sm:text-8xl">
                  Now
                </h3>
                <p className="mt-6 max-w-xl font-display text-2xl font-medium tracking-tight sm:text-4xl">
                  Store the concept. Generate the files.
                </p>
                <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
                  Reverse the order. The Prim holds the idea once. Excel, Word,
                  the deck, the notes — those come out of it. Same four files.
                  The arrow flipped.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-ink bg-ink p-6 text-paper sm:p-8">
                <p className="font-mono text-xs tracking-[0.16em] text-paper/50">
                  ONE FILE
                </p>
                <p className="mt-4 font-display text-2xl font-medium tracking-tight">
                  The Prim is the concept.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-paper/75">
                  <li className="border-b border-paper/15 pb-3">
                    Spreadsheet — generated
                  </li>
                  <li className="border-b border-paper/15 pb-3">
                    Document — generated
                  </li>
                  <li className="border-b border-paper/15 pb-3">
                    Deck — generated
                  </li>
                  <li>Notes — generated</li>
                </ul>
              </div>
            </div>

            <Diagram
              src="/diagram-inversion.png"
              alt="Then: Excel, Word, Slides, and Notes point into a reconstructed idea. Now: a Prim holds the concept and generates those same files."
              caption="Same four files. The arrow flipped."
            />
          </div>
        </section>

        <section id="portable" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
            Portable
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Agent to agent. Agent to human. Human to agent.
          </h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line lg:grid-cols-3">
            <article className="bg-paper p-6 sm:p-8">
              <h3 className="font-display text-lg font-medium tracking-tight">
                Like PDF, for AI work
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Adobe cracked portable documents. A Prim is a portable package of
                knowledge — the same file moves between people and agents without
                translation.
              </p>
            </article>
            <article className="bg-paper p-6 sm:p-8">
              <h3 className="font-display text-lg font-medium tracking-tight">
                A session is a Prim
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                An AI session itself is a type of Prim. What people call the model
                “dreaming” is the raw work. The Prim is what it packages.
              </p>
            </article>
            <article className="bg-ink p-6 text-paper sm:p-8">
              <h3 className="font-display text-lg font-medium tracking-tight">
                Schema first, then autonomy
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">
                Define great schemas for Prims up front and agents can finish the
                work. The spreadsheet is no longer the job — it is an export.
              </p>
            </article>
          </div>
        </section>

        <section id="what" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
            What a Prim is
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
            A self-contained pack of knowledge — not an app, not a document, not a
            database dump.
          </h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {PROPERTIES.map((item) => (
              <article key={item.name} className="bg-paper p-6 sm:p-8">
                <h3 className="font-display text-lg font-medium tracking-tight">
                  {item.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            ))}
            <article className="bg-ink p-6 text-paper sm:p-8">
              <h3 className="font-display text-lg font-medium tracking-tight">
                Raw data, then package
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">
                A Prim is not the dream. It is what the dream becomes when it is
                packaged so the next agent — or person — can pick it up.
              </p>
            </article>
          </div>
          <Diagram
            src="/diagram-views.png"
            alt="Prim as the source of truth, with arrows out to sheet, deck, interface, and agent views."
            caption="The Prim stays put. Sheets, decks, UIs, and agent reads are projections."
          />
        </section>

        <section id="say" className="border-y border-line bg-raised/60 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
              How to say it
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
              If it needs a long explanation, it has not landed yet.
            </h2>
            <ol className="mt-12 space-y-0">
              {PHRASES.map((line, i) => (
                <li
                  key={line}
                  className="flex gap-6 border-t border-line py-6 last:border-b sm:gap-10"
                >
                  <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-subtle">
                    0{i + 1}
                  </span>
                  <p className="font-display text-xl font-medium tracking-tight sm:text-2xl">
                    {line}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted">
              Technical names — OKF, ORF, OCSF — belong in specs. Everyday speech
              stays on Prim. Success is when “send me the prim” feels as ordinary
              as “send me the link.”
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
            Packaging
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
            A Prim is a pack. Sending one should be one file.
          </h2>
          <div className="mt-12 overflow-hidden rounded-[var(--radius-lg)] border border-line">
            {PACKAGING.map((row) => (
              <div
                key={row.form}
                className="grid gap-2 border-b border-line px-6 py-5 last:border-b-0 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:items-baseline sm:px-8"
              >
                <p className="font-mono text-sm text-ink">{row.form}</p>
                <p className="text-sm leading-relaxed text-muted">{row.role}</p>
              </div>
            ))}
          </div>
          <Diagram
            src="/diagram-pack.png"
            alt="Contents of a .prim.zip: index.md, log.md, structure.json, evidence, and docs.json."
            caption="A .prim.zip is a zip whose root is the pack. Attach that file."
          />
        </section>

        <section
          id="family"
          className="border-t border-line bg-raised/60 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
              The family
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Prim is the name. OKF is the grammar.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              Under the hood, Prims are additive Open Knowledge Format profiles
              from Eidos. A renderer that understands only OKF can still display
              the pack.
            </p>
            <Diagram
              src="/diagram-family.png"
              alt="Tree from Prim to OKF to additive profiles EMF, ORF, OPF, ODFW, OPFF, OMF, and OCSF."
              caption="New domains arrive as profiles. Existing Prims keep validating."
            />
            <ul className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line sm:grid-cols-2">
              {FAMILY.map((item) => (
                <li key={item.id} className="bg-paper">
                  <a
                    href={item.href}
                    className="flex items-baseline justify-between gap-4 px-6 py-5 transition-colors hover:bg-raised sm:px-8"
                  >
                    <span className="font-mono text-sm text-ink">{item.id}</span>
                    <span className="text-right text-sm text-muted">{item.domain}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="rounded-[var(--radius-xl)] bg-ink px-6 py-14 text-paper sm:px-14 sm:py-20">
            <p className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
              Don’t send the spreadsheet.
              <br />
              Send the prim.
            </p>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-paper/65">
              The category specification, family map, and packaging rules live in
              the open. MIT. Early.
            </p>
            <div className="mt-10">
              <a
                href="https://github.com/eidos-agi/prim"
                className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] bg-paper px-6 text-base font-medium text-ink hover:opacity-90"
              >
                github.com/eidos-agi/prim
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </section>
        <Sources />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Prim · Eidos AGI · MIT</p>
          <div className="flex flex-wrap gap-6">
            <a href="https://github.com/eidos-agi/prim" className="hover:text-ink">
              Spec
            </a>
            <a href="https://github.com/eidos-agi" className="hover:text-ink">
              Eidos
            </a>
            <a href="https://github.com/eidos-agi/prim-web" className="hover:text-ink">
              This site
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
