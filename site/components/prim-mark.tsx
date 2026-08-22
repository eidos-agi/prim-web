export function PrimMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 112"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <polygon points="0,54 0,112 46,83" />
      <polygon points="28,0 72,54 10,78" />
    </svg>
  );
}

export function PrimWordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <img
        src="/logo.png"
        alt="Prim"
        className="h-10 w-auto sm:h-12"
      />
    </span>
  );
}
