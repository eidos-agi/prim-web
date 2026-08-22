import { Cite } from "@/components/cite";
import { Beat, Chapter } from "@/components/story";

export function PressStory() {
  return (
    <Chapter>
      <Beat
        id="before"
        num="02"
        title="Before the printing press"
        eager
        photos={[
          {
            src: "/then-scribe.jpg",
            alt: "A monk at a sloped desk, copying a manuscript by hand.",
          },
          {
            src: "/then-scriptorium.jpg",
            alt: "Medieval illumination of a scriptorium — scribes at desks.",
          },
        ]}
      >
        Scribes used a feather to copy every book by hand. A Bible took about a
        year.
        <Cite n={14} />
      </Beat>
      <Beat
        id="after"
        num="03"
        title="After the printing press"
        caption="The press didn’t use a feather."
        photos={[
          {
            src: "/then-press.jpg",
            alt: "A fifteenth-century printing workshop: press, type, stacks of sheets.",
          },
        ]}
      >
        Mainz, 1455.
        <Cite n={13} /> A press could create in a day what a monk copied in
        months.
        <Cite n={14} /> Not a new kind of book. A different rate of making them.
      </Beat>
      <Beat
        id="hundred"
        num="04"
        title="In the span of 20 years, book output increased 100x per worker."
        photos={[
          { src: "/book-one.jpg", alt: "One book." },
          { src: "/book-hundred.jpg", alt: "A stack of about a hundred books." },
        ]}
      >
        By 1500, fifty years of print, Europe had more than nine million books.
        <Cite n={10} />
        <Cite n={14} />
      </Beat>
      <Beat
        id="instrument"
        num="05"
        title="They did not scale the feather to a hundred feathers. The instrument itself changed to a press."
        photos={[
          {
            src: "/hundred-feathers.jpg",
            alt: "A table covered in quills — a hundred feathers.",
          },
          { src: "/one-press.jpg", alt: "A single printing press." },
        ]}
      >
        A feather was for human hands to write every letter. A press was for
        human hands to press a page.
      </Beat>
    </Chapter>
  );
}
