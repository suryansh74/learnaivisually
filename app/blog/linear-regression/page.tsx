import { LinearRegressionDemo } from "@/components/LinearRegressionDemo";
import { Callout, Equation } from "@/components/Prose";
import { PostLayout } from "@/components/PostLayout";
import { getPost } from "@/lib/posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const post = getPost("linear-regression");

export const metadata: Metadata = {
  title: post?.title ?? "Linear regression",
  description: post?.description,
};

export default function LinearRegressionPage() {
  if (!post) notFound();

  return (
    <PostLayout post={post}>
      <div className="prose-measure space-y-5 text-[1.05rem] leading-8 text-ink-soft">
        <p>
          Linear regression answers a small question: if the input is a number x, what straight line
          should predict y? The line has two knobs. Slope w tilts it. Intercept b lifts it.
        </p>
        <Equation>ŷ = w x + b</Equation>
        <p>
          A guess is good when the vertical gaps between the points and the line are small. We square
          those gaps so a miss above the line and a miss below it both count, and so a large miss
          counts more than a small one. The average of those squares is the loss.
        </p>
        <Equation>L(w, b) = (1/n) Σ (w xᵢ + b − yᵢ)²</Equation>
      </div>

      <LinearRegressionDemo />

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4 text-[1.05rem] leading-8 text-ink-soft">
          <h2 className="font-display text-3xl text-ink">Closed form</h2>
          <p>
            For one input, the loss is a bowl. The bottom has a formula. Center the data, then slope
            is how x and y move together, divided by how much x moves. Intercept puts the line through
            the mean point.
          </p>
          <Equation>w = Σ (xᵢ − x̄)(yᵢ − ȳ) / Σ (xᵢ − x̄)²</Equation>
          <Equation>b = ȳ − w x̄</Equation>
          <p>
            The dashed line in the plot is that answer. Hit “Least squares” and the amber line should
            land on it. Nothing is being searched. The minimum is written down.
          </p>
        </section>
        <section className="space-y-4 text-[1.05rem] leading-8 text-ink-soft">
          <h2 className="font-display text-3xl text-ink">Gradient descent</h2>
          <p>
            The same bowl can be walked. The partial derivatives say which way is uphill. Subtract a
            small step, and the line moves toward the points.
          </p>
          <Equation>w ← w − α ∂L/∂w</Equation>
          <Equation>b ← b − α ∂L/∂b</Equation>
          <p>
            Start from the bad guess, slope near zero and intercept too high. One step nudges both
            knobs. Eighteen steps, at the default learning rate, should nearly meet the dashed line.
            If α is too large, the loss trail jumps instead of falling.
          </p>
        </section>
      </div>

      <Callout label="What to look at">
        The terracotta rectangles are the squared residuals, drawn to scale. Least squares is the
        line that makes the total area of those rectangles as small as it can be. Gradient descent
        does not know that formula. It only follows the slope of the loss.
      </Callout>

      <section className="prose-measure space-y-4 text-[1.05rem] leading-8 text-ink-soft">
        <h2 className="font-display text-3xl text-ink">What this does not do</h2>
        <p>
          One line cannot bend. If the cloud curves, a linear model will still draw the best straight
          compromise and leave a pattern in the residuals. Adding more inputs makes w a vector, but
          the picture is the same: predict a weighted sum, square the misses, descend or solve.
        </p>
        <p>
          The next essays stay on this page’s theme. Amber marks the thing being learned. Terracotta
          marks error. Ink is the closed form or the reference. New posts should not invent a second palette.
        </p>
      </section>
    </PostLayout>
  );
}
