type Props = {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
};

export function LazyImg({ src, alt, className, eager = false }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "low"}
    />
  );
}
