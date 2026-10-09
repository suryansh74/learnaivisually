import Link from "next/link";
import { pages } from "@/lib/pages";

export default function HomePage() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Pages</p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.95] text-ink sm:text-6xl">
        What we are drawing.
      </h1>
      <p className="mt-5 max-w-prose text-lg leading-8 text-ink-soft">
        Each item is a page. The theme stays the same. Right now the working page is linear regression.
      </p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {pages.map((page) => (
          <li key={page.slug}>
            <Link href={page.href} className="grid gap-3 py-6 sm:grid-cols-[160px_1fr] sm:items-baseline">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                {page.status}
              </span>
              <span>
                <span className="block font-display text-3xl text-ink">{page.title}</span>
                <span className="mt-2 block max-w-prose text-ink-soft">{page.summary}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
