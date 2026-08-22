import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useScrollLink } from "@/hooks/use-scroll-link";
import { Frame, type Photo } from "@/components/story/frame";

type ChapterCtx = {
  activeId: string;
  photos: Record<string, { photos: Photo[]; caption?: string }>;
  register: (
    id: string,
    payload: { photos: Photo[]; caption?: string },
  ) => void;
};

const ChapterContext = createContext<ChapterCtx | null>(null);

function useChapter() {
  const ctx = useContext(ChapterContext);
  if (!ctx) throw new Error("Beat must sit inside Chapter");
  return ctx;
}

export function Chapter({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState("");
  const [photos, setPhotos] = useState<ChapterCtx["photos"]>({});

  const register = useCallback<ChapterCtx["register"]>((id, payload) => {
    setPhotos((cur) => {
      const prev = cur[id];
      if (
        prev &&
        prev.caption === payload.caption &&
        prev.photos === payload.photos
      ) {
        return cur;
      }
      return { ...cur, [id]: payload };
    });
  }, []);

  const onActive = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  useScrollLink(rootRef, onActive);

  useEffect(() => {
    const first =
      rootRef.current?.querySelector<HTMLElement>("[data-beat]")?.dataset
        .beat;
    if (first) setActiveId((cur) => cur || first);
  }, []);

  const order = Object.keys(photos);

  return (
    <ChapterContext.Provider value={{ activeId, photos, register }}>
      <div className="story-pin" ref={rootRef}>
        <div className="story-copy">{children}</div>
        <div className="story-stage" aria-hidden="true">
          {order.map((id) => (
            <div
              key={id}
              data-stage={id}
              className={`story-stage-slide${id === activeId ? " is-on" : ""}`}
            >
              {photos[id] ? (
                <Frame
                  photos={photos[id].photos}
                  caption={photos[id].caption}
                  eager={id === order[0] || id === activeId}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </ChapterContext.Provider>
  );
}

export function Beat({
  id,
  num,
  title,
  children,
  photos,
  caption,
  eager,
}: {
  id?: string;
  num?: string;
  title: string;
  children: ReactNode;
  photos: Photo[];
  caption?: string;
  eager?: boolean;
}) {
  const autoId = useId();
  const beatId = id ?? autoId;
  const { activeId, register } = useChapter();

  useEffect(() => {
    register(beatId, { photos, caption });
  }, [beatId, photos, caption, register]);

  return (
    <article
      id={id}
      data-beat={beatId}
      className={`story-beat${activeId === beatId ? " is-on" : ""}`}
    >
      {num ? <p className="beat-num">{num}</p> : null}
      <h2>{title}</h2>
      <div className="story-body">{children}</div>
      <div className="story-mobile-stage">
        <Frame photos={photos} caption={caption} eager={eager} />
      </div>
    </article>
  );
}
