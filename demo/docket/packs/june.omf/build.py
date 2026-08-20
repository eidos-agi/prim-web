#!/usr/bin/env python3
"""Zip the fictional June 12 OMF occurrence. No real meetings."""

from __future__ import annotations

import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEST = ROOT.parent.parent / "june.omf.prim"
SKIP = {"build.py"}


def main() -> None:
    files = sorted(
        p for p in ROOT.rglob("*")
        if p.is_file() and p.name not in SKIP and p.suffix != ".pyc"
    )
    with zipfile.ZipFile(DEST, "w", zipfile.ZIP_DEFLATED) as z:
        for path in files:
            z.write(path, path.relative_to(ROOT).as_posix())
    print(f"{DEST.name} {DEST.stat().st_size}B {len(files)} files")


if __name__ == "__main__":
    main()
