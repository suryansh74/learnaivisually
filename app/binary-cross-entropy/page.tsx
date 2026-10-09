import { BinaryLesson } from "@/components/BinaryLesson";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Binary cross-entropy",
  description: "Sigmoid, two-class classification, and logistic regression.",
};

export default function BinaryCrossEntropyPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">After the line</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink sm:text-6xl">Binary cross-entropy</h1>
        <p className="mt-4 max-w-prose text-lg leading-8 text-ink-soft">
          Two classes only. The label is 0 or 1. The model must output a probability, not a line that can run past 0 and 1.
        </p>
      </header>
      <section className="max-w-prose space-y-8 text-[1.05rem] leading-8 text-ink-soft">
        <Block title="Two-class classification">
          Classification predicts a category. Binary means two categories: yes or no, class 1 or class 0. A linear score z = w x + b can be any real number. A probability has to sit between 0 and 1. That is why the score is passed through a sigmoid.
        </Block>
        <Block title="Sigmoid">
          σ(z) = 1 / (1 + e^(−z)). Large positive z becomes a probability near 1. Large negative z becomes a probability near 0. z = 0 gives 0.5. The threshold is usually 0.5: at or above, predict class 1. Logistic regression is this pair: a linear score, then a sigmoid. It is still a linear decision in x. The curve you see is the probability, not a bent class boundary.
        </Block>
        <Block title="The cost">
          Binary cross-entropy, also called log loss, is the cost. For a true 1, loss = −log(p). For a true 0, loss = −log(1 − p). If the model is sure and wrong, p is near 0 when the label is 1, and −log(p) explodes. Squared error is a poor match here, because a probability is not a plain number on a line. The cost is the average of those log losses.
        </Block>
      </section>
      <BinaryLesson />
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
