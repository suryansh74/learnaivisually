import { LinearRegressionBench } from "@/components/LinearRegressionBench";
import { NextPage } from "@/components/NextPage";
import type { Metadata } from "next";
import Link from "next/link";

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
          A training example is one row: features in, target out. The feature is x. The target is y. The model does not see a new y. It guesses ŷ. The residual is y − ŷ, the vertical miss. Regression means the target is a number. Classification, on the next pages, means the target is a class.
        </Block>
        <Block title="The hypothesis">
          The hypothesis is the shape you allow. Here it is linear: ŷ = w x + b. w is the weight, also called the slope: if x grows by 1, the guess grows by w. b is the bias, also called the intercept: the guess when x is 0. Together they are the parameters. With a second feature, ŷ = w1 x1 + w2 x2 + b. That is a plane. x2 is the depth axis in the 3D view. Changing w2 tilts the plane along that axis.
        </Block>
        <Block title="Loss and cost">
          Loss is the penalty on one row. Cost, often written J, is the average loss on the table. People mix the words. On this page, loss is one miss and cost is the mean. Mean squared error squares the miss, so a far point pulls hard. Mean absolute error uses the size of the miss only. Huber is squared while the miss is small, then linear, so one outlier cannot own the fit. Training minimizes the cost.
        </Block>
        <Block title="How the numbers move">
          A gradient is the slope of the cost with respect to a parameter. Partial derivatives ∂J/∂w and ∂J/∂b say which way is uphill. Gradient descent steps the other way: parameter ← parameter − α × slope. α is the learning rate. One such nudge is a step. A pass over the data is an epoch. Too large an α jumps over the bottom. Too small and the line crawls. For one feature, least squares also has a closed form. Descent is the picture that still works when the formula does not.
        </Block>
        <Block title="What the line cannot do">
          A linear model cannot bend. If the cloud curves, the best line is still straight and the residuals keep a pattern. More features make a flat in a higher dimension, not a curve. If those features repeat each other, the weights get unstable. That is where PCA can help: it is not regression. It squeezes correlated axes into fewer directions, and then a line can be fit on those scores. <Link href="/pca" className="text-accent">Open the PCA side demo</Link>.
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
