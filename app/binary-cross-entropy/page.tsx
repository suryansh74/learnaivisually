import { BinaryBench } from "@/components/BinaryBench";
import { NextPage } from "@/components/NextPage";
import { Term } from "@/components/Term";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Binary cross-entropy", description: "Sigmoid, two classes, table, and training." };

export default function BinaryCrossEntropyPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">After the line</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink sm:text-6xl">Binary cross-entropy</h1>
        <p className="mt-4 max-w-prose text-lg leading-8 text-ink-soft">Two classes. The label is 0 or 1. The model must output a probability.</p>
      </header>
      <section className="max-w-prose space-y-8 text-[1.05rem] leading-8 text-ink-soft">
        <Block title="Two-class classification">
          <Term>Classification</Term> predicts a category. <Term>Binary</Term> means two categories. A linear score z = w x + b can be any real number. A <Term>probability</Term> must sit between 0 and 1.
        </Block>
        <Block title="Sigmoid and logistic regression">
          The <Term>sigmoid</Term> is σ(z) = 1 / (1 + e^(−z)). <Term>Logistic regression</Term> is a linear score passed through that sigmoid. The usual <Term>threshold</Term> is 0.5. In 3D the height is that probability, and x2 is the second feature.
        </Block>
        <Block title="Loss and cost">
          <Term>Binary cross-entropy</Term>, also called <Term>log loss</Term>, is the penalty on one row: −[ y log p + (1 − y) log(1 − p) ]. The <Term>cost</Term> is the average of those penalties. A confident wrong answer makes the log large.
        </Block>
      </section>
      <BinaryBench />
      <NextPage href="/categorical-cross-entropy" label="Categorical cross-entropy" />
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h2 className="font-display text-3xl text-ink">{title}</h2><div className="mt-2">{children}</div></div>;
}
