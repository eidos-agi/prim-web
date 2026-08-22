import { FileIcon } from "@/components/file-icon";
import { LazyImg } from "@/components/lazy-img";

export function WorkScenes() {
  return (
    <div className="lineage">
      <div className="then-photos">
        <figure>
          <LazyImg
            src="/then-excel.jpg"
            alt="1980s office worker at a CRT, trapped in a spreadsheet."
          />
          <figcaption>Spreadsheet</figcaption>
        </figure>
        <figure>
          <LazyImg
            src="/then-word.jpg"
            alt="1980s office worker typing a report."
          />
          <figcaption>Document</figcaption>
        </figure>
        <figure>
          <LazyImg
            src="/then-slides.jpg"
            alt="1980s conference room, overhead projector."
          />
          <figcaption>Deck</figcaption>
        </figure>
      </div>

      <div className="file-into">
        <div className="file-into-col">
          <p className="file-into-label">They made</p>
          <ul>
            <li>
              <FileIcon kind="xls" />
              Spreadsheet
            </li>
            <li>
              <FileIcon kind="doc" />
              Document
            </li>
            <li>
              <FileIcon kind="ppt" />
              Deck
            </li>
          </ul>
        </div>
        <p className="file-into-verb">
          filed
          <span>in</span>
        </p>
        <div className="file-into-col">
          <p className="file-into-label">The cabinet</p>
          <div className="cabinet">
            <div className="cabinet-slot" aria-hidden="true">
              <span className="cabinet-drop d1">
                <FileIcon kind="xls" />
              </span>
              <span className="cabinet-drop d2">
                <FileIcon kind="doc" />
              </span>
              <span className="cabinet-drop d3">
                <FileIcon kind="ppt" />
              </span>
            </div>
            <div className="cabinet-drawer">SharePoint</div>
            <div className="cabinet-drawer">Google Drive</div>
          </div>
        </div>
      </div>
      <p className="lineage-note">
        Their work was the file. Then the file went into the cabinet.
      </p>

      <p className="beat-num" style={{ marginTop: "5.5rem" }}>
        08
      </p>
      <p className="lineage-head">Their grandchildren sit at the table.</p>
      <figure className="now-table">
        <LazyImg
          src="/now-table.jpg"
          alt="Their grandchildren around a table, talking — the work is the meeting."
        />
        <figcaption>They speak. That becomes the next meeting.</figcaption>
      </figure>
      <div className="now-split">
        <figure>
          <LazyImg
            src="/now-speak.jpg"
            alt="Two of them mid-conversation. The idea is spoken, not typed into a format."
          />
        </figure>
        <ol className="intent-list">
          <li>Meeting</li>
          <li>Voice</li>
          <li>Intent</li>
          <li>Output</li>
          <li>Next meeting</li>
        </ol>
      </div>
    </div>
  );
}
