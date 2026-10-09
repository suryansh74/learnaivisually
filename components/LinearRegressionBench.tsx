"use client";

import { useEffect, useMemo, useState } from "react";

type LossName = "mse" | "mae" | "huber";
type Row = { id: string; x: string; y: string };
type Point = { x: number; y: number };

const LOSSES: { id: LossName; label: string; formula: string; note: string }[] = [
  {
    id: "mse",
    label: "MSE",
    formula: "L = (1/n) Σ (ŷ − y)²",
    note: "Squares the miss. A far point pulls the line hard.",
  },
  {
    id: "mae",
    label: "MAE",
    formula: "L = (1/n) Σ |ŷ − y|",
    note: "Counts the miss once. Outliers pull less than in MSE.",
  },
  {
    id: "huber",
    label: "Huber",
    formula: "L = (1/n) Σ ρ(ŷ − y), δ = 1",
    note: "Squared while the miss is small, then linear. δ is 1.",
  },
];

const seedRows = (): Row[] => [
  { id: "r1", x: "1.0", y: "2.2" },
  { id: "r2", x: "2.2", y: "3.8" },
  { id: "r3", x: "3.1", y: "5.4" },
  { id: "r4", x: "4.4", y: "6.1" },
  { id: "r5", x: "5.6", y: "8.0" },
  { id: "r6", x: "6.8", y: "9.4" },
  { id: "r7", x: "8.0", y: "10.6" },
];

function parsePoints(rows: Row[]): Point[] {
  return rows
    .map((row) => ({ x: Number(row.x), y: Number(row.y) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function lossOf(points: Point[], weight: number, bias: number, loss: LossName) {
  if (points.length === 0) return 0;
  const total = points.reduce((sum, point) => {
    const error = weight * point.x + bias - point.y;
    if (loss === "mae") return sum + Math.abs(error);
    if (loss === "huber") {
      const abs = Math.abs(error);
      return sum + (abs <= 1 ? 0.5 * error * error : abs - 0.5);
    }
    return sum + error * error;
  }, 0);
  return total / points.length;
}

function gradients(points: Point[], weight: number, bias: number, loss: LossName) {
  const n = points.length || 1;
  let dw = 0;
  let db = 0;
  for (const point of points) {
    const error = weight * point.x + bias - point.y;
    if (loss === "mae") {
      const sign = error === 0 ? 0 : Math.sign(error);
      dw += sign * point.x;
      db += sign;
    } else if (loss === "huber") {
      const clipped = Math.abs(error) <= 1 ? error : Math.sign(error);
      dw += clipped * point.x;
      db += clipped;
    } else {
      dw += 2 * error * point.x;
      db += 2 * error;
    }
  }
  return { dw: dw / n, db: db / n };
}

function randomRows(): Row[] {
  const count = 8 + Math.floor(Math.random() * 5);
  const weight = 0.7 + Math.random() * 0.9;
  const bias = 0.6 + Math.random() * 2.4;
  return Array.from({ length: count }, (_, index) => {
    const x = 1 + (index * 7) / (count - 1) + (Math.random() - 0.5) * 0.45;
    const y = weight * x + bias + (Math.random() - 0.5) * 2.4;
    return { id: `rnd-${index}-${Math.random().toString(36).slice(2, 7)}`, x: x.toFixed(2), y: y.toFixed(2) };
  });
}

export function LinearRegressionBench() {
  const [rows, setRows] = useState<Row[]>(seedRows);
  const [loss, setLoss] = useState<LossName>("mse");
  const [model, setModel] = useState({ weight: 0.15, bias: 6 });
  const [rate, setRate] = useState(0.04);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<number[]>([lossOf(parsePoints(seedRows()), 0.15, 6, "mse")]);

  const points = useMemo(() => parsePoints(rows), [rows]);
  const currentLoss = lossOf(points, model.weight, model.bias, loss);
  const selected = LOSSES.find((item) => item.id === loss) ?? LOSSES[0];

  useEffect(() => {
    if (!playing || points.length < 2) return;
    const timer = window.setInterval(() => {
      setModel((current) => {
        const step = gradients(points, current.weight, current.bias, loss);
        const next = {
          weight: current.weight - rate * step.dw,
          bias: current.bias - rate * step.db,
        };
        setHistory((trail) => [...trail, lossOf(points, next.weight, next.bias, loss)].slice(-48));
        return next;
      });
    }, 90);
    return () => window.clearInterval(timer);
  }, [playing, points, loss, rate]);

  function stepOnce() {
    const step = gradients(points, model.weight, model.bias, loss);
    const next = {
      weight: model.weight - rate * step.dw,
      bias: model.bias - rate * step.db,
    };
    setModel(next);
    setHistory((trail) => [...trail, lossOf(points, next.weight, next.bias, loss)].slice(-48));
  }

  function resetLine() {
    const nextBias = points.length ? Math.max(...points.map((point) => point.y)) : 6;
    setPlaying(false);
    setModel({ weight: 0.15, bias: nextBias });
    setHistory([lossOf(points, 0.15, nextBias, loss)]);
  }

  function updateRow(id: string, key: "x" | "y", value: string) {
    setPlaying(false);
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }

  function fillRandom() {
    const next = randomRows();
    setPlaying(false);
    setRows(next);
    setModel({ weight: 0.15, bias: 8 });
    setHistory([lossOf(parsePoints(next), 0.15, 8, loss)]);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <section className="rounded-[1.25rem] border border-line bg-paper-raised p-4 shadow-sheet sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Demonstration</p>
            <h2 className="mt-1 font-display text-3xl text-ink">The line learning the table</h2>
          </div>
          <p className="font-mono text-sm text-ink-soft">
            {selected.label} <span className="text-residual">{currentLoss.toFixed(3)}</span>
          </p>
        </div>
        <Plot points={points} weight={model.weight} bias={model.bias} />
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-raised">
            {playing ? "Pause" : "Play animation"}
          </button>
          <button type="button" onClick={stepOnce} className="rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper">
            One step
          </button>
          <button type="button" onClick={resetLine} className="rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Reset line
          </button>
        </div>
        <label className="mt-4 block max-w-xs">
          <span className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            learning rate <span className="text-ink">{rate.toFixed(3)}</span>
          </span>
          <input className="mt-2 w-full accent-highlight" type="range" min={0.005} max={0.12} step={0.005} value={rate} onChange={(event) => setRate(Number(event.target.value))} />
        </label>
        <p className="mt-3 font-mono text-sm text-ink-soft">
          w {model.weight.toFixed(3)} · b {model.bias.toFixed(3)}
        </p>
        <LossSpark history={history} />
      </section>

      <div className="space-y-6">
        <section className="rounded-[1.25rem] border border-line bg-paper-raised p-4 sm:p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Loss function</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {LOSSES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setLoss(item.id);
                  setPlaying(false);
                }}
                className={`rounded-xl border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${
                  loss === item.id ? "border-accent bg-accent text-paper-raised" : "border-line text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="equation mt-4 text-sm">{selected.formula}</p>
          <p className="mt-3 text-ink-soft">{selected.note}</p>
        </section>

        <section className="rounded-[1.25rem] border border-line bg-paper-raised p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Variable table</p>
              <h2 className="mt-1 font-display text-2xl text-ink">x and y</h2>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={fillRandom} className="rounded-full bg-highlight px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                Random fill
              </button>
              <button
                type="button"
                onClick={() => setRows((current) => [...current, { id: `row-${Date.now()}`, x: "", y: "" }])}
                className="rounded-full border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink"
              >
                Add row
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left font-mono text-sm">
              <thead className="text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="pb-2 pr-3">#</th>
                  <th className="pb-2 pr-3">x</th>
                  <th className="pb-2 pr-3">y</th>
                  <th className="pb-2 pr-3">ŷ</th>
                  <th className="pb-2"> </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const x = Number(row.x);
                  const predicted = Number.isFinite(x) ? model.weight * x + model.bias : null;
                  return (
                    <tr key={row.id} className="border-t border-line">
                      <td className="py-2 pr-3 text-muted">{index + 1}</td>
                      <td className="py-2 pr-3">
                        <input value={row.x} onChange={(event) => updateRow(row.id, "x", event.target.value)} className="w-20 rounded-lg border border-line bg-paper px-2 py-1 text-ink" inputMode="decimal" />
                      </td>
                      <td className="py-2 pr-3">
                        <input value={row.y} onChange={(event) => updateRow(row.id, "y", event.target.value)} className="w-20 rounded-lg border border-line bg-paper px-2 py-1 text-ink" inputMode="decimal" />
                      </td>
                      <td className="py-2 pr-3 text-highlight">{predicted === null ? "—" : predicted.toFixed(2)}</td>
                      <td className="py-2">
                        <button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="text-muted hover:text-residual">
                          remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">{points.length} usable rows. Empty or non-numeric rows are ignored by the fit.</p>
        </section>
      </div>
    </div>
  );
}

function Plot({ points, weight, bias }: { points: Point[]; weight: number; bias: number }) {
  const width = 640;
  const height = 380;
  const pad = { left: 42, right: 16, top: 16, bottom: 32 };
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xMin = Math.min(0, ...xs, 0) - 0.4;
  const xMax = Math.max(8, ...xs, 1) + 0.4;
  const yMin = Math.min(0, ...ys, bias) - 0.8;
  const yMax = Math.max(10, ...ys, bias) + 0.8;
  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * (width - pad.left - pad.right);
  const sy = (y: number) => pad.top + (1 - (y - yMin) / (yMax - yMin)) * (height - pad.top - pad.bottom);
  const y0 = weight * xMin + bias;
  const y1 = weight * xMax + bias;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full rounded-xl bg-paper">
      <line x1={pad.left} x2={width - pad.right} y1={sy(0)} y2={sy(0)} stroke="#e3dacb" />
      <line x1={sx(0)} x2={sx(0)} y1={pad.top} y2={height - pad.bottom} stroke="#e3dacb" />
      <path d={`M${sx(xMin)},${sy(y0)} L${sx(xMax)},${sy(y1)}`} fill="none" stroke="#c9842a" strokeWidth="2.6" />
      {points.map((point) => (
        <g key={`${point.x}-${point.y}`}>
          <line x1={sx(point.x)} x2={sx(point.x)} y1={sy(point.y)} y2={sy(weight * point.x + bias)} stroke="#b55248" strokeWidth="1.3" />
          <circle cx={sx(point.x)} cy={sy(point.y)} r="4.5" fill="#1e4d6b" />
        </g>
      ))}
    </svg>
  );
}

function LossSpark({ history }: { history: number[] }) {
  const max = Math.max(...history, 0.1);
  const width = 280;
  const height = 52;
  const path = history
    .map((value, index) => {
      const x = (index / Math.max(history.length - 1, 1)) * width;
      const y = height - (value / max) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div className="mt-4 rounded-xl border border-line bg-paper px-3 py-2">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">loss trail</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-1 h-12 w-full">
        <path d={path} fill="none" stroke="#b55248" strokeWidth="2" />
      </svg>
    </div>
  );
}
