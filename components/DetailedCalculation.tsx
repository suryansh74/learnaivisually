"use client";

import { useState } from "react";

type Point = { x: number; z: number; y: number };
type LossName = "mse" | "mae" | "huber";
type Mode = "2d" | "3d";

function predict(point: Point, w1: number, w2: number, bias: number, mode: Mode) {
  return mode === "3d" ? w1 * point.x + w2 * point.z + bias : w1 * point.x + bias;
}

export function DetailedCalculation({
  points,
  w1,
  w2,
  bias,
  rate,
  loss,
  mode,
}: {
  points: Point[];
  w1: number;
  w2: number;
  bias: number;
  rate: number;
  loss: LossName;
  mode: Mode;
}) {
  const [open, setOpen] = useState(false);
  const shown = points.slice(0, 30);
  const hidden = Math.max(0, points.length - 30);
  const rows = shown.map((point, index) => {
    const guessed = predict(point, w1, w2, bias, mode);
    const error = guessed - point.y;
    const term = loss === "mae" ? Math.abs(error) : loss === "huber" ? (Math.abs(error) <= 1 ? 0.5 * error * error : Math.abs(error) - 0.5) : error * error;
    return { index, point, guessed, error, term };
  });
  const cost = rows.reduce((sum, row) => sum + row.term, 0) / (points.length || 1);
  let dw1 = 0;
  let dw2 = 0;
  let db = 0;
  for (const point of points) {
    const error = predict(point, w1, w2, bias, mode) - point.y;
    const slope = loss === "mae" ? (error === 0 ? 0 : Math.sign(error)) : loss === "huber" ? (Math.abs(error) <= 1 ? error : Math.sign(error)) : 2 * error;
    dw1 += slope * point.x;
    dw2 += slope * point.z;
    db += slope;
  }
  const n = points.length || 1;
  dw1 /= n;
  dw2 /= n;
  db /= n;

  return (
    <div className="rounded-[1.25rem] border border-line bg-paper-raised p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Detailed calculation</p>
          <p className="mt-1 text-ink-soft">Loss is one miss. Cost is the average of those misses. Open this to see the arithmetic.</p>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper">
          {open ? "Hide steps" : "Open detailed calculation"}
        </button>
      </div>
      {open && (
        <div className="mt-5 space-y-4 text-ink-soft">
          <p>Cost and loss are often used as the same word. Here, loss is the penalty on one row. Cost J is the mean of those penalties over the table. Training minimizes the cost.</p>
          <p className="equation text-sm">
            {loss === "mse" && "loss = (ŷ − y)²    cost = (1/n) Σ loss"}
            {loss === "mae" && "loss = |ŷ − y|    cost = (1/n) Σ loss"}
            {loss === "huber" && "loss = ½e² if |e|≤1, else |e|−½    cost = (1/n) Σ loss"}
          </p>
          <div className="overflow-x-auto font-mono text-[12px]">
            <table className="w-full text-left">
              <thead className="uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="pb-2 pr-3">#</th>
                  <th className="pb-2 pr-3">x</th>
                  {mode === "3d" && <th className="pb-2 pr-3">x2</th>}
                  <th className="pb-2 pr-3">y</th>
                  <th className="pb-2 pr-3">ŷ</th>
                  <th className="pb-2 pr-3">error</th>
                  <th className="pb-2">term</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.index} className="border-t border-line">
                    <td className="py-1 pr-3">{row.index + 1}</td>
                    <td className="py-1 pr-3">{row.point.x.toFixed(2)}</td>
                    {mode === "3d" && <td className="py-1 pr-3">{row.point.z.toFixed(2)}</td>}
                    <td className="py-1 pr-3">{row.point.y.toFixed(2)}</td>
                    <td className="py-1 pr-3">{row.guessed.toFixed(2)}</td>
                    <td className="py-1 pr-3">{row.error.toFixed(2)}</td>
                    <td className="py-1">{row.term.toFixed(3)}</td>
                  </tr>
                ))}
                {hidden > 0 && (
                  <tr className="border-t border-line text-muted">
                    <td className="py-2" colSpan={mode === "3d" ? 7 : 6}>… {hidden} more rows omitted after 30</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p>Add the term column and divide by n = {points.length}. Cost now = {cost.toFixed(4)}.</p>
          <p className="equation text-sm">∂J/∂w1 = {dw1.toFixed(3)}{mode === "3d" ? `    ∂J/∂w2 = ${dw2.toFixed(3)}` : ""}    ∂J/∂b = {db.toFixed(3)}</p>
          <p>One training step subtracts learning rate times that slope. The line or plane is the new parameters, not a new formula.</p>
          <p className="equation text-sm">
            w1 ← {(w1 - rate * dw1).toFixed(3)}
            {mode === "3d" ? `    w2 ← ${(w2 - rate * dw2).toFixed(3)}` : ""}
            {"    "}b ← {(bias - rate * db).toFixed(3)}
          </p>
        </div>
      )}
    </div>
  );
}
