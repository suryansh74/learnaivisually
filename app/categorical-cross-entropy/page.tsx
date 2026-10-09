import { CategoricalLesson } from "@/components/CategoricalLesson";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Categorical cross-entropy",
  description: "Softmax and multi-class classification.",
};

export default function CategoricalCrossEntropyPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">After binary</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink sm:text-6xl">Categorical cross-entropy</h1>
        <p className="mt-4 max-w-prose text-lg leading-8 text-ink-soft">
          More than two classes. The label is one class, often stored as a one-hot vector. The model must share one probability across all classes.
        </p>
      </header>
      <section className="max-w-prose space-y-8 text-[1.05rem] leading-8 text-ink-soft">
        <Block title="Multi-class">
          Binary cross-entropy has one probability, p, and its opposite, 1 − p. Categorical cross-entropy has a probability for every class, and they must add to 1. A one-hot label is a vector with a 1 on the true class and 0 elsewhere.
        </Block>
        <Block title="Softmax">
          Each class gets a score, a logit. Softmax is e^(score) divided by the sum of those exponentials. The largest score takes most of the probability. The others share what remains. This is the multi-class partner of the sigmoid. Sigmoid is the two-class special case.
        </Block>
        <Block title="The cost">
          Categorical cross-entropy is −Σ y_k log(p_k). Because y is one-hot, that sum is just −log(p_true). A confident wrong class makes p_true tiny and the cost large. Do not use binary cross-entropy on a three-way label unless you deliberately train one-versus-rest models.
        </Block>
      </section>
      <CategoricalLesson />
      <p className="text-ink-soft">
        Back to the line, or the side demo for many axes: <Link href="/linear-regression" className="text-accent">linear regression</Link>, <Link href="/pca" className="text-accent">PCA</Link>.
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
