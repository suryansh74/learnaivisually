import { LinearRegressionBench } from "@/components/LinearRegressionBench";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linear regression",
  description: "A short lesson: theory, an editable line or plane, and a prediction box.",
};

export default function LinearRegressionPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Working page</p>
        <h1 className="mt-3 font-display text-4xl leading-none text-ink sm:text-6xl">Linear regression</h1>
        <p className="mt-4 max-w-prose text-lg leading-8 text-ink-soft">
          A straight guess for a number. One input draws a line. Two inputs draw a plane. Change the parameters and the drawing moves.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <TheoryCard title="The guess" body="Predict y from x. The guess is a line: ŷ = w x + b. w is how steep it is. b is the height when x is 0. With a second input, ŷ = w1 x1 + w2 x2 + b, which is a plane." />
        <TheoryCard title="The mistake" body="Loss is the average miss. MSE squares each miss, so a far point pulls hard. MAE uses the absolute miss. Huber squares small misses and then switches to a straight penalty." />
        <TheoryCard title="The update" body="Training starts from a bad w and b. Each step nudges them to shrink the loss. After training, the same w and b stay. A new input uses that line or plane. It does not bend." />
      </section>

      <LinearRegressionBench />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Teach it in five lines</p>
          <ol className="mt-4 space-y-3 text-ink-soft">
            <li>1. We want a number out, from one or two numbers in.</li>
            <li>2. The model is only slope and intercept. That is the whole line, or the whole plane.</li>
            <li>3. Loss says how wrong the current line is. Pick MSE, MAE, or Huber.</li>
            <li>4. Training walks the parameters downhill. The amber drawing is the current guess.</li>
            <li>5. Prediction is not a new fit. Type an input. The saved w and b answer.</li>
          </ol>
        </div>
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Later knobs</p>
          <ul className="mt-4 space-y-2 text-ink-soft">
            <li>Learning rate — already here. Too big and the line jumps.</li>
            <li>Steps — how long training runs.</li>
            <li>Regularization — a penalty so w cannot grow without reason.</li>
            <li>More inputs — the plane becomes a flat in higher dimension.</li>
            <li>A curve — only if we add x². A plain line cannot bend.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function TheoryCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[1.25rem] border border-line bg-paper-raised p-5">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="mt-2 leading-7 text-ink-soft">{body}</p>
    </article>
  );
}
