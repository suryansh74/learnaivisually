import { posts } from "@/lib/posts";
import { theme } from "@/lib/theme";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">A visual notebook</p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.95] text-ink sm:text-7xl">
        Machine learning, drawn before it is named.
      </h1>
      <p className="mt-6 max-w-prose text-lg leading-8 text-ink-soft">
        Each essay is an interactive demonstration. Color, type, and layout come from one theme,
        so a new post reads as the next page of the same notebook — not a new website.
      </p>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {Object.entries(theme.colors)
          .slice(0, 6)
          .map(([name, value]) => (
            <div key={name} className="rounded-2xl border border-line bg-paper-raised p-4">
              <div className="h-10 rounded-lg border border-line" style={{ background: value }} />
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{name}</p>
              <p className="font-mono text-sm text-ink">{value}</p>
            </div>
          ))}
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-ink">Essays</h2>
          <Link href="/theme" className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            Theme rules
          </Link>
        </div>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="grid gap-3 py-6 sm:grid-cols-[140px_1fr] sm:items-baseline">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{post.date}</span>
                <span>
                  <span className="block font-display text-3xl text-ink">{post.title}</span>
                  <span className="mt-2 block max-w-prose text-ink-soft">{post.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
