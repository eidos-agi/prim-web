export function Cite({ n }: { n: number }) {
  return (
    <a href={`#fn-${n}`} className="cite" aria-label={`Source ${n}`}>
      {n}
    </a>
  );
}
