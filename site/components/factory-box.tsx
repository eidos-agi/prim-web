import { FileIcon } from "@/components/file-icon";

export function FactoryBox() {
  return (
    <div className="factory-stage" aria-hidden="true">
      <p className="legend legend-l">File hell</p>
      <p className="legend legend-r">After</p>
      <div className="rail" />
      <div className="pack pack-in pack-icons">
        <FileIcon kind="xls" />
        <FileIcon kind="doc" />
        <FileIcon kind="ppt" />
        <FileIcon kind="pdf" />
      </div>
      <div className="bin">
        <div className="curtain" />
        <img src="/mark.png" alt="" />
      </div>
      <div className="pack pack-out">.prim</div>
    </div>
  );
}
