#!/usr/bin/env python3
"""Local static host with COOP/COEP so EmulatorJS can use threads."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os

ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        super().end_headers()

    def guess_type(self, path):
        if path.endswith(".prim"):
            return "application/zip"
        return super().guess_type(path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8770"))
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
