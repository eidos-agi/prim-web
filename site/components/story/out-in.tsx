const OUT = [
  { src: "/file-icons/excel-app.svg", label: "Excel", kind: "xls" },
  { src: "/file-icons/word-app.svg", label: "Word", kind: "doc" },
  { src: "/file-icons/ppt-app.svg", label: "PowerPoint", kind: "ppt" },
  { src: "/file-icons/pdf-app.svg", label: "PDF", kind: "pdf" },
];

function Reject() {
  return (
    <svg className="out-badge" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#d1242f" />
      <path
        d="M8 8l8 8M16 8l-8 8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OutIn() {
  return (
    <div className="out-in" aria-label="Excel, Word, PowerPoint, and PDF are out. Prim is in.">
      <ul className="out-in-out">
        {OUT.map((item) => (
          <li key={item.label}>
            <span className={`out-in-icon is-out kind-${item.kind}`}>
              <span className="file-doc">
                <img src={item.src} alt="" />
              </span>
              <Reject />
            </span>
            <span className="out-in-name">{item.label}</span>
          </li>
        ))}
      </ul>
      <p className="out-in-verb" aria-hidden="true">
        out
        <span>in</span>
      </p>
      <figure className="out-in-in">
        <span className="out-in-icon is-in">
          <img src="/mark.png" alt="" />
        </span>
        <figcaption className="out-in-name">Prim</figcaption>
      </figure>
    </div>
  );
}
