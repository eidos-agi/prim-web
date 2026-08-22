import { FileChip } from "@/components/file-icon";

const FILES = [
  ".xlsx",
  ".docx",
  ".pptx",
  ".pdf",
  ".csv",
  ".txt",
  ".eml",
  ".zip",
  ".xls",
  ".doc",
  ".ppt",
  ".mdb",
  ".numbers",
  ".pages",
  ".key",
];

function Row({ reverse = false }: { reverse?: boolean }) {
  const loop = [...FILES, ...FILES];
  return (
    <div className={`file-river-mask ${reverse ? "reverse" : ""}`}>
      <div className="file-river-track">
        {loop.map((ext, i) => (
          <FileChip key={`${ext}-${i}`} ext={ext} />
        ))}
      </div>
    </div>
  );
}

export function FileRiver() {
  return (
    <div className="file-river" aria-hidden="true">
      <Row />
      <Row reverse />
    </div>
  );
}
