import { Copy, Scene } from "@/components/story";
import { TvRoom } from "@/components/tv-room";

export function NextWork() {
  return (
    <div className="next-work">
      <Copy head="Knowledge work is becoming idea work and validation work.">
        AI converts the raw material. People choose the idea. People check the
        result.
      </Copy>
      <Copy head="People show up because they want their intent to change the world.">
        In a positive way. Or to help a customer succeed with an outside
        perspective. That is the job.
      </Copy>
      <Copy head="Starting in 2027, we work with our eyes, ears, mouths, and hand signs more than ever.">
        The interface need not be a computer with a mouse and a keyboard any
        longer.
      </Copy>
      <ul className="body-list" aria-label="The body as interface">
        <li>Eyes</li>
        <li>Ears</li>
        <li>Mouths</li>
        <li>Hand signs</li>
      </ul>
      <Copy head="The new floor is a table.">
        Record. Debate. A couple of microphones, and a screen of what you’re
        all discussing. The files come out the other side.
      </Copy>
      <Scene>
        <TvRoom />
      </Scene>
    </div>
  );
}
