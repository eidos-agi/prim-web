import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

const NAV = [
  { href: "#press", label: "Printing press" },
  { href: "#factory", label: "Factory" },
  { href: "#enterprise", label: "Enterprise" },
  { href: "#agents", label: "AIs" },
  { href: "#why", label: "Why" },
  { href: "#portable", label: "Portable" },
  { href: "#what", label: "What" },
  { href: "#say", label: "Language" },
  { href: "#sources", label: "Sources" },
];

export function SiteHeader() {
  const { isPending } = useCurrentUserState();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center">
          <img
            src="/logo.png"
            alt="Prim"
            className="h-8 w-auto"
          />
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted transition-colors duration-[var(--motion-quick)] hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/eidos-agi/prim"
            className="hidden text-sm text-muted transition-colors hover:text-ink sm:inline"
          >
            Spec
          </a>
          <div className="h-8 min-w-8">
            {isPending ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-line" />
            ) : (
              <>
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <Link
                    to="/login"
                    className="inline-flex h-10 items-center rounded-[var(--radius-sm)] border border-line px-3 text-sm text-ink hover:bg-raised"
                  >
                    Sign in
                  </Link>
                </SignedOut>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
