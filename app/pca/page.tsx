import { PcaDemo } from "@/components/PcaDemo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PCA",
  description: "A small side demo: principal components before a regression.",
};

export default function PcaPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Side demo, not the same topic</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink sm:text-6xl">PCA</h1>
        <p className="mt-4 max-w-prose text-lg leading-8 text-ink-soft">
          Principal component analysis does not predict y. It rotates the features so the first new axis holds the most spread. Useful before regression when many inputs repeat each other.
        </p>
      </header>
      <section className="max-w-prose space-y-8 text-[1.05rem] leading-8 text-ink-soft">
        <Block title="Why it sits next to regression">
          A plane in two inputs is easy to see. Twenty inputs are not. If those inputs move together, the weights in ŷ = w·x + b fight each other. PCA builds new axes, the principal components, ordered by variance. You can keep the first few scores and fit the line on those. The prediction is still linear regression. PCA only changed the features.
        </Block>
        <Block title="What the picture is">
          The cloud is stretched. The amber line is the first component, the direction of greatest variance. Terracotta segments are the projection: each point dropped onto that axis. The numbers under the graph are the scores, the new one-dimensional feature. This demo is two axes so the drop is visible. The idea is the same in higher dimension.
        </Block>
      </section>
      <PcaDemo />
      <p className="text-ink-soft">
        Return to <Link href="/linear-regression" className="text-accent">linear regression</Link>.
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
