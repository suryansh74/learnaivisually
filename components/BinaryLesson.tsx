"use client";

import { NextPage } from "@/components/NextPage";
import { useMemo, useState } from "react";

const points = [
  { x: 0.4, y: 0 },
  { x: 1.1, y: 0 },
  { x: 1.8, y: 0 },
  { x: 2.4, y: 1 },
  { x: 3.1, y: 1 },
  { x: 3.8, y: 1 },
  { x: 4.4, y: 1 },
];

function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-z));
}

export function BinaryLesson() {
  const [w, setW] = useState(1.4);
  const [b, setB] = useState(-3.2);
  const [ask, setAsk] = useState("2.5");
  const rows = useMemo(
    () =>
      points.map((point) => {
        const z = w * point.x + b;
        const p = sigmoid(z);
        const loss = point.y === 1 ? -Math.log(Math.max(p, 1e-8)) : -Math.log(Math.max(1 - p, 1e-8));
        return { ...point, z, p, loss };
      }),
    [w, b],
  );
  const cost = rows.reduce((sum, row) => sum + row.loss, 0) / rows.length;
  const asked = Number(ask);
  const askedP = Number.isFinite(asked) ? sigmoid(w * asked + b) : null;

  return (
    <div className="space-y-8">
      <section className="rounded-[1.25rem] border border-line bg-paper-raised p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Sigmoid</p>
        <svg viewBox="0 0 640 280" className="mt-3 w-full rounded-xl bg-paper">
          <line x1="40" x2="620" y1="240" y2="240" stroke="var(--line)" />
          <line x1="40" x2="40" y1="20" y2="240" stroke="var(--line)" />
          <text x="8" y="28" fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">1</text>
          <text x="8" y="132" fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">0.5</text>
          <text x="8" y="244" fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">0</text>
          <path
            d={Array.from({ length: 80 }, (_, index) => {
              const x = index / 79 * 6;
              const y = sigmoid(w * x + b);
              const sx = 40 + (x / 6) * 580;
              const sy = 240 - y * 210;
              return `${index === 0 ? "M" : "L"}${sx},${sy}`;
            }).join(" ")}
            fill="none"
            stroke="var(--highlight)"
            strokeWidth="2.5"
          />
          {rows.map((row) => (
            <circle key={row.x} cx={40 + (row.x / 6) * 580} cy={240 - row.y * 210} r="5" fill={row.y ? "var(--accent)" : "var(--residual)"} />
          ))}
        </svg>
        <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
          <label className="text-sm text-muted">w<input className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono text-ink" value={w} onChange={(event) => setW(Number(event.target.value))} /></label>
          <label className="text-sm text-muted">b<input className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono text-ink" value={b} onChange={(event) => setB(Number(event.target.value))} /></label>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Predict a class</p>
          <label className="mt-3 block text-sm text-muted">
            x
            <input value={ask} onChange={(event) => setAsk(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono text-ink" />
          </label>
          <p className="mt-3 font-display text-4xl text-highlight">{askedP === null ? "—" : askedP.toFixed(3)}</p>
          <p className="text-ink-soft">{askedP === null ? "" : askedP >= 0.5 ? "class 1, because probability is at least 0.5" : "class 0, because probability is below 0.5"}</p>
        </div>
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Cost now</p>
          <p className="mt-3 font-display text-4xl text-residual">{cost.toFixed(3)}</p>
          <p className="text-ink-soft">Mean binary cross-entropy on the seven points. A confident wrong answer makes this large, because log of a tiny probability is a large negative.</p>
        </div>
      </section>
      <NextPage href="/categorical-cross-entropy" label="Categorical cross-entropy" />
    </div>
  );
}
