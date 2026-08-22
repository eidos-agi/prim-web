import type { ReactNode } from "react";

export function Copy({
  kicker,
  head,
  children,
}: {
  kicker?: string;
  head?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="copy">
      {kicker ? <p className="copy-kicker">{kicker}</p> : null}
      {head ? <p className="copy-head">{head}</p> : null}
      {children ? <div className="copy-body">{children}</div> : null}
    </div>
  );
}
