import { LinearRegressionBench } from "@/components/LinearRegressionBench";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linear regression",
  description: "Animated fit, variable table, and loss selection for a straight line.",
};

export default function LinearRegressionPage() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Working page</p>
      <h1 className="mt-3 font-display text-4xl leading-none text-ink sm:text-6xl">Linear regression</h1>
      <p className="mt-4 max-w-prose text-lg leading-8 text-ink-soft">
        Edit the table, or fill it at random. Pick a loss. In 2D the fit is a line. In 3D it is a plane. Hover the graph for coordinate values.
      </p>
      <div className="mt-8">
        <LinearRegressionBench />
      </div>
    </div>
  );
}
