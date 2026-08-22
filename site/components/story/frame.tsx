export type Photo = { src: string; alt: string };

export function Frame({
  photos,
  caption,
  eager,
}: {
  photos: Photo[];
  caption?: string;
  eager?: boolean;
}) {
  return (
    <div className="story-stage-frame" data-count={photos.length}>
      {photos.map((img) => (
        <figure key={img.src}>
          <img
            src={img.src}
            alt={img.alt}
            decoding="async"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "low"}
          />
        </figure>
      ))}
      {caption ? <p className="story-stage-cap">{caption}</p> : null}
    </div>
  );
}
