import type { ReactNode } from "react";

export function Screen({
  num,
  children,
  size = "lg",
  media,
}: {
  num?: string;
  children: ReactNode;
  size?: "lg" | "xl";
  media?: ReactNode;
}) {
  return (
    <div className={`story-screen story-screen-${size}`}>
      {num ? <p className="beat-num">{num}</p> : null}
      {media}
      <p className="story-screen-line">{children}</p>
    </div>
  );
}
