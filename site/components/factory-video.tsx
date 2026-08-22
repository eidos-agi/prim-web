import { useEffect, useRef } from "react";

export function FactoryVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!el.src && el.querySelector("source")) {
          el.preload = "auto";
          el.load();
        }
        el.play().catch(() => {});
        io.disconnect();
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="aspect-video h-auto w-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      poster="/factory-poster.jpg"
    >
      <source src="/factory.mp4" type="video/mp4" />
    </video>
  );
}
