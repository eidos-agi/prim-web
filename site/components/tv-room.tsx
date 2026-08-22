import { LazyImg } from "@/components/lazy-img";

export function TvRoom() {
  return (
    <figure className="tv-stage">
      <div className="tv-frame">
        <LazyImg
          src="/now-room.jpg"
          alt="People at a table with microphones. A television on the wall shows the discussion."
        />
        <div className="tv-screen" aria-hidden="true">
          <div className="tv-feed">
            <p className="tv-kicker">On the table</p>
            <ol>
              <li>Meeting</li>
              <li>Voice</li>
              <li>Intent</li>
              <li>Output</li>
            </ol>
            <p className="tv-line">The files come out the other side.</p>
          </div>
        </div>
      </div>
      <figcaption>
        Idea work and validation work. The files come out the other side.
      </figcaption>
    </figure>
  );
}
