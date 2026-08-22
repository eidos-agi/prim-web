import { CITATIONS } from "@/data/citations";

export function Sources() {
  return (
    <section id="sources" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">
        Sources
      </p>
      <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
        Every number and quote on this page has a citation.
      </h2>
      <ol className="cite-list">
        {CITATIONS.map((c) => (
          <li key={c.id} id={`fn-${c.id}`}>
            <p className="cite-label">
              <span className="cite-num">{c.id}</span>
              {c.label}
            </p>
            <p className="cite-src">{c.source}</p>
            <a href={c.href} target="_blank" rel="noreferrer">
              {new URL(c.href).hostname.replace(/^www\./, "")}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
