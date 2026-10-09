import { theme } from "@/lib/theme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theme",
  description: "The shared visual system for every Learn AI Visually essay.",
};

export default function ThemePage() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">Design system</p>
      <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">{theme.name}</h1>
      <p className="mt-5 max-w-prose text-lg leading-8 text-ink-soft">{theme.description}</p>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(theme.colors).map(([name, value]) => (
          <div key={name} className="flex items-center gap-4 rounded-2xl border border-line bg-paper-raised p-4">
            <div className="h-14 w-14 shrink-0 rounded-xl border border-line" style={{ background: value }} />
            <div>
              <p className="font-display text-xl text-ink">{name}</p>
              <p className="font-mono text-sm text-muted">{value}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">bg-{name} / text-{name}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        <TypeSample name="Display" sample="Fraunces" className="font-display text-4xl" use="Titles and essay names" />
        <TypeSample name="Body" sample="Source Serif 4" className="font-body text-2xl" use="Explanation and prose" />
        <TypeSample name="Mono" sample="IBM Plex Mono" className="font-mono text-xl" use="Equations, labels, meta" />
      </section>

      <section className="mt-12 rounded-[1.25rem] border border-line bg-paper-raised p-6">
        <h2 className="font-display text-3xl text-ink">Rules for the next essay</h2>
        <ol className="mt-4 space-y-3 text-ink-soft">
          {theme.rules.map((rule, index) => (
            <li key={rule} className="grid grid-cols-[2rem_1fr] gap-2 leading-7">
              <span className="font-mono text-sm text-accent">{index + 1}</span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 space-y-2 font-mono text-sm text-ink-soft">
          <p>1. Add the essay to lib/posts.ts.</p>
          <p>2. Create app/blog/<slug>/page.tsx and wrap it in PostLayout.</p>
          <p>3. Use Equation, Callout, and the token classes. No new colors or fonts.</p>
        </div>
      </section>
    </div>
  );
}

function TypeSample({
  name,
  sample,
  className,
  use,
}: {
  name: string;
  sample: string;
  className: string;
  use: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{name}</p>
      <p className={`mt-3 text-ink ${className}`}>{sample}</p>
      <p className="mt-3 text-ink-soft">{use}</p>
    </div>
  );
}
