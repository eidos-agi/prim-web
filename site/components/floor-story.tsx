import { Beat, Chapter } from "@/components/story";

export function FloorStory() {
  return (
    <Chapter>
      <Beat
        id="floor-not-product"
        title="Pre-AI, most files were not the finished product."
        photos={[
          {
            src: "/then-excel.jpg",
            alt: "A spreadsheet on a CRT — the factory floor, not the product.",
          },
          {
            src: "/then-word.jpg",
            alt: "A document being typed — another station on the same floor.",
          },
        ]}
      >
        They were part of the factory floor.
      </Beat>
      <Beat
        id="floor-sheet"
        title="A spreadsheet became an insight."
        photos={[
          {
            src: "/then-excel.jpg",
            alt: "1980s office worker at a CRT, trapped in a spreadsheet.",
          },
        ]}
      >
        A person sat in Excel until a number meant something.
      </Beat>
      <Beat
        id="floor-deck"
        title="A deck became a board pack."
        photos={[
          {
            src: "/then-slides.jpg",
            alt: "A 1980s conference room, overhead projector, a deck on the wall.",
          },
        ]}
      >
        The slides were how the meeting ran.
      </Beat>
      <Beat
        id="floor-firm"
        title="A week of both became a firm."
        photos={[
          {
            src: "/then-board.jpg",
            alt: "A boardroom table of printed decks — the week’s files, become advice.",
          },
        ]}
      >
        Deloitte. IBM Consulting. People converting raw data into advice, one
        file at a time.
      </Beat>
    </Chapter>
  );
}
