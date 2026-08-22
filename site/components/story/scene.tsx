import type { ReactNode } from "react";
import { Copy } from "@/components/story/copy";
import { Frame } from "@/components/story/frame";

export function Scene({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className ? `scene ${className}` : "scene"}>{children}</div>;
}

export function Pair({
  src,
  alt,
  kicker,
  head,
  children,
}: {
  src: string;
  alt: string;
  kicker?: string;
  head?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <article className="hand-row">
      <Frame photos={[{ src, alt }]} />
      <Copy kicker={kicker} head={head}>
        {children}
      </Copy>
    </article>
  );
}
