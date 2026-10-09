import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line/80">
      <div className="mx-auto flex max-w-sheet items-center justify-between gap-6 px-5 py-5 sm:px-8">
        <Link href="/" className="group">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
            Learn AI Visually
          </span>
          <span className="mt-1 block font-display text-lg leading-none text-ink group-hover:text-accent">
            ink & paper
          </span>
        </Link>
        <nav className="flex items-center gap-5 font-mono text-[12px] uppercase tracking-[0.16em] text-muted">
          <Link href="/theme" className="hover:text-ink">
            Theme
          </Link>
          <Link href="/blog/linear-regression" className="hover:text-ink">
            First essay
          </Link>
        </nav>
      </div>
    </header>
  );
}
