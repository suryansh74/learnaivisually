import { LinearRegressionBench } from "@/components/LinearRegressionBench";
import { NextPage } from "@/components/NextPage";
import { Term } from "@/components/Term";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linear regression",
  description: "Theory of the line and the plane, then a fit you can train and calculate.",
};

export default function LinearRegressionPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Theory, then the drawing</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink sm:text-6xl">Linear regression</h1>
        <p className="mt-4 max-w-prose text-lg leading-8 text-ink-soft">
          Supervised learning where the answer is a number. One input gives a line. Two inputs give a plane. The words below are the ones to say out loud before you touch the graph.
        </p>
      </header>

      <section className="max-w-prose space-y-8 text-[1.05rem] leading-8 text-ink-soft">
        <Block title="What you are predicting">
          A <Term>training example</Term> is one row: features in, target out. The <Term>feature</Term> is x. The <Term>target</Term> is y. The model guesses <Term>ŷ</Term>. The <Term>residual</Term> is y − ŷ. <Term>Regression</Term> means the target is a number. <Term>Classification</Term>, on the next pages, means the target is a class.
        </Block>
        <Block title="The hypothesis">
          The <Term>hypothesis</Term> is the shape you allow. Here it is linear: ŷ = w x + b. <Term>w</Term> is the weight, also called the slope. <Term>b</Term> is the bias, also called the intercept. Together they are the <Term>parameters</Term>. With a second feature, ŷ = w1 x1 + w2 x2 + b. That is a plane. x2 is the depth axis. Changing w2 tilts the plane along that axis.
        </Block>
        <Block title="Loss and cost">
          <Term>Loss</Term> is the penalty on one row. <Term>Cost</Term>, often written J, is the average loss on the table. <Term>Mean squared error</Term> squares the miss. <Term>Mean absolute error</Term> uses the size of the miss only. <Term>Huber</Term> is squared while the miss is small, then linear. Training minimizes the cost.
        </Block>
        <Block title="How the numbers move">
          A <Term>gradient</Term> is the slope of the cost. <Term>Partial derivatives</Term> ∂J/∂w and ∂J/∂b say which way is uphill. <Term>Gradient descent</Term> steps the other way. <Term>Learning rate</Term> α sets the step size. One nudge is a <Term>step</Term>. A pass over the data is an <Term>epoch</Term>. For one feature, <Term>least squares</Term> also has a closed form.
        </Block>
        <Block title="What the line cannot do">
          A linear model cannot bend. If the cloud curves, the best line is still straight and the residuals keep a pattern. More features make a flat in a higher dimension, not a curve.
        </Block>
      </section>

      <LinearRegressionBench />
      <NextPage href="/binary-cross-entropy" label="Binary cross-entropy" />
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
