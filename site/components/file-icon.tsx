type Kind = "xls" | "doc" | "ppt" | "pdf" | "txt" | "mail" | "zip" | "data";

const KIND: Record<string, Kind> = {
  ".xls": "xls",
  ".xlsx": "xls",
  ".csv": "xls",
  ".ods": "xls",
  ".numbers": "xls",
  ".wk1": "xls",
  ".doc": "doc",
  ".docx": "doc",
  ".odt": "doc",
  ".pages": "doc",
  ".rtf": "doc",
  ".wpd": "doc",
  ".txt": "txt",
  ".ppt": "ppt",
  ".pptx": "ppt",
  ".odp": "ppt",
  ".key": "ppt",
  ".pdf": "pdf",
  ".eml": "mail",
  ".msg": "mail",
  ".zip": "zip",
  ".mdb": "data",
};

export function kindFromExt(ext: string): Kind {
  return KIND[ext.toLowerCase()] ?? "txt";
}

export function FileIcon({
  kind,
  className = "file-glyph",
}: {
  kind: Kind;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 32 32",
    "aria-hidden": true as const,
  };

  if (kind === "xls") {
    return (
      <svg {...common}>
        <rect width="32" height="32" rx="7" fill="#2f6b4a" />
        <path
          d="M10 9.5h12M10 16h12M10 22.5h12M13.5 9.5v13M18.5 9.5v13"
          stroke="#f4f3ef"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  if (kind === "doc") {
    return (
      <svg {...common}>
        <rect width="32" height="32" rx="7" fill="#2c4a7c" />
        <path
          d="M9 11h14M9 16h14M9 21h10"
          stroke="#f4f3ef"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "ppt") {
    return (
      <svg {...common}>
        <rect width="32" height="32" rx="7" fill="#b4532a" />
        <rect x="8" y="11" width="16" height="10" rx="1.5" fill="#f4f3ef" />
      </svg>
    );
  }
  if (kind === "pdf") {
    return (
      <svg {...common}>
        <rect width="32" height="32" rx="7" fill="#9b2c2c" />
        <path d="M11 8h8l5 5v11H11z" fill="#f4f3ef" />
        <path d="M19 8v5h5" fill="none" stroke="#9b2c2c" strokeWidth="1.4" />
      </svg>
    );
  }
  if (kind === "mail") {
    return (
      <svg {...common}>
        <rect width="32" height="32" rx="7" fill="#4a4a46" />
        <rect x="7" y="11" width="18" height="12" rx="1.5" fill="none" stroke="#f4f3ef" strokeWidth="1.6" />
        <path d="M7 13l9 6 9-6" fill="none" stroke="#f4f3ef" strokeWidth="1.6" />
      </svg>
    );
  }
  if (kind === "zip") {
    return (
      <svg {...common}>
        <rect width="32" height="32" rx="7" fill="#5a5348" />
        <path d="M16 8v16M13 11h6M13 15h6M13 19h6" stroke="#f4f3ef" strokeWidth="1.6" />
      </svg>
    );
  }
  if (kind === "data") {
    return (
      <svg {...common}>
        <rect width="32" height="32" rx="7" fill="#3d5c5c" />
        <ellipse cx="16" cy="11" rx="7" ry="3" fill="none" stroke="#f4f3ef" strokeWidth="1.5" />
        <path d="M9 11v10c0 1.7 3.1 3 7 3s7-1.3 7-3V11" fill="none" stroke="#f4f3ef" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect width="32" height="32" rx="7" fill="#6a6a66" />
      <path
        d="M10 12h12M10 16.5h12M10 21h8"
        stroke="#f4f3ef"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FileChip({ ext }: { ext: string }) {
  return (
    <span className="file-chip">
      <FileIcon kind={kindFromExt(ext)} />
      {ext}
    </span>
  );
}
