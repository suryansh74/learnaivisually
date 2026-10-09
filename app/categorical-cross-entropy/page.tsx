import { CategoricalBench } from "@/components/CategoricalBench";
import { Term } from "@/components/Term";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Categorical cross-entropy", description: "Softmax and multi-class training." };

export default function CategoricalCrossEntropyPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">After binary</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink sm:text-6xl">Categorical cross-entropy</h1>
        <p className="mt-4 max-w-prose text-lg leading-8 text-ink-soft">More than two classes. One label, one probability for each class, and those probabilities add to 1.</p>
      </header>
      <section className="max-w-prose space-y-8 text-[1.05rem] leading-8 text-ink-soft">
        <Block title="Multi-class">
          <Term>Multi-class</Term> means more than two labels. A <Term>one-hot</Term> label has a 1 on the true class and 0 elsewhere. In the table, y is 0, 1, or 2.
        </Block>
        <Block title="Softmax">
          Each class gets a score, a <Term>logit</Term>. <Term>Softmax</Term> turns those scores into probabilities that add to 1. It is the multi-class partner of the sigmoid.
        </Block>
        <Block title="Loss and cost">
          <Term>Categorical cross-entropy</Term> is −log(p of the true class). The <Term>cost</Term> is the average over the table. Do not use binary cross-entropy on a three-way label unless you deliberately train one-versus-rest models.
        </Block>
      </section>
      <CategoricalBench />
      <p className="text-ink-soft">Back to <Link href="/linear-regression" className="text-accent">linear regression</Link>.</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h2 className="font-display text-3xl text-ink">{title}</h2><div className="mt-2">{children}</div></div>;
}
