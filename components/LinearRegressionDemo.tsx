"use client";

import { useMemo, useState } from "react";

type Point = { x: number; y: number };

const POINTS: Point[] = [
  { x: 1.0, y: 2.2 },
  { x: 1.7, y: 2.8 },
  { x: 2.3, y: 4.6 },
  { x: 2.9, y: 4.1 },
  { x: 3.5, y: 5.7 },
  { x: 4.2, y: 6.4 },
  { x: 4.9, y: 7.6 },
  { x: 5.6, y: 8.0 },
  { x: 6.3, y: 9.5 },
  { x: 7.1, y: 10.1 },
  { x: 7.7, y: 11.4 },
  { x: 8.3, y: 11.0 },
];

const X_MIN = 0;
const X_MAX = 9.2;
const Y_MIN = 0;
const Y_MAX = 13;

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function leastSquares(points: Point[]) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xBar = mean(xs);
  const yBar = mean(ys);
  const variance = xs.reduce((sum, x) => sum + (x - xBar) ** 2, 0);
  const covariance = points.reduce((sum, point) => sum + (point.x - xBar) * (point.y - yBar), 0);
  const weight = covariance / variance;
  const bias = yBar - weight * xBar;
  return { weight, bias };
}

function lossOf(points: Point[], weight: number, bias: number) {
  const sse = points.reduce((sum, point) => sum + (weight * point.x + bias - point.y) ** 2, 0);
  return sse / points.length;
}

function gradients(points: Point[], weight: number, bias: number) {
  const n = points.length;
  let dw = 0;
  let db = 0;
  for (const point of points) {
    const error = weight * point.x + bias - point.y;
    dw += error * point.x;
    db += error;
  }
  return { dw: (2 / n) * dw, db: (2 / n) * db };
}

export function LinearRegressionDemo() {
  const fit = useMemo(() => leastSquares(POINTS), []);
  const [weight, setWeight] = useState(0.2);
  const [bias, setBias] = useState(8);
  const [rate, setRate] = useState(0.02);
  const [showSquares, setShowSquares] = useState(true);
  const [showFit, setShowFit] = useState(true);
  const [history, setHistory] = useState<number[]>([lossOf(POINTS, 0.2, 8)]);

  const loss = lossOf(POINTS, weight, bias);
  const bestLoss = lossOf(POINTS, fit.weight, fit.bias);
  const grads = gradients(POINTS, weight, bias);

  function remember(nextWeight: number, nextBias: number) {
    setHistory((current) => [...current, lossOf(POINTS, nextWeight, nextBias)].slice(-40));
  }

  function step() {
    const nextWeight = weight - rate * grads.dw;
    const nextBias = bias - rate * grads.db;
    setWeight(nextWeight);
    setBias(nextBias);
    remember(nextWeight, nextBias);
  }

  function play() {
    let w = weight;
    let b = bias;
    const nextHistory = [...history];
    for (let i = 0; i < 18; i += 1) {
      const g = gradients(POINTS, w, b);
      w -= rate * g.dw;
      b -= rate * g.db;
      nextHistory.push(lossOf(POINTS, w, b));
    }
    setWeight(w);
    setBias(b);
    setHistory(nextHistory.slice(-40));
  }

  function resetGuess() {
    setWeight(0.2);
    setBias(8);
    setHistory([lossOf(POINTS, 0.2, 8)]);
  }

  function snap() {
    setWeight(fit.weight);
    setBias(fit.bias);
    remember(fit.weight, fit.bias);
  }

  return (
    <section className="rounded-[1.25rem] border border-line bg-paper-raised p-4 shadow-sheet sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Demonstration</p>
          <h2 className="mt-1 font-display text-3xl text-ink">Drag the line. Watch the squares.</h2>
        </div>
        <p className="font-mono text-sm text-ink-soft">
          MSE <span className="text-residual">{loss.toFixed(3)}</span>
          <span className="text-muted"> / best {bestLoss.toFixed(3)}</span>
        </p>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Plot
          weight={weight}
          bias={bias}
          fit={fit}
          showSquares={showSquares}
          showFit={showFit}
        />
        <div className="space-y-4">
          <Slider label="slope w" value={weight} min={-0.4} max={2.4} step={0.01} onChange={setWeight} />
          <Slider label="intercept b" value={bias} min={-2} max={10} step={0.05} onChange={setBias} />
          <Slider label="learning rate" value={rate} min={0.002} max={0.05} step={0.001} onChange={setRate} />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={step} className="rounded-full bg-accent px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-raised">
              One step
            </button>
            <button type="button" onClick={play} className="rounded-full bg-ink px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper">
              Run 18 steps
            </button>
            <button type="button" onClick={snap} className="rounded-full border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
              Least squares
            </button>
            <button type="button" onClick={resetGuess} className="rounded-full border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Bad guess
            </button>
          </div>
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <input type="checkbox" checked={showSquares} onChange={(event) => setShowSquares(event.target.checked)} />
            residual squares
          </label>
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <input type="checkbox" checked={showFit} onChange={(event) => setShowFit(event.target.checked)} />
            closed-form line
          </label>
          <LossSpark history={history} />
          <p className="font-mono text-[12px] leading-5 text-ink-soft">
            ∂L/∂w = {grads.dw.toFixed(2)} · ∂L/∂b = {grads.db.toFixed(2)}
          </p>
        </div>
      </div>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        Amber is your line. Dashed ink is the least-squares line. Terracotta squares are squared error.
      </p>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
        <span className="text-ink">{value.toFixed(2)}</span>
      </span>
      <input
        className="mt-2 w-full accent-highlight"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function LossSpark({ history }: { history: number[] }) {
  const max = Math.max(...history, 0.1);
  const width = 240;
  const height = 56;
  const path = history
    .map((value, index) => {
      const x = (index / Math.max(history.length - 1, 1)) * width;
      const y = height - (value / max) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-line bg-paper px-3 py-2">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">loss trail</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-1 h-14 w-full">
        <path d={path} fill="none" stroke="#b55248" strokeWidth="2" />
      </svg>
    </div>
  );
}

function Plot({
  weight,
  bias,
  fit,
  showSquares,
  showFit,
}: {
  weight: number;
  bias: number;
  fit: { weight: number; bias: number };
  showSquares: boolean;
  showFit: boolean;
}) {
  const width = 640;
  const height = 420;
  const pad = { left: 42, right: 16, top: 16, bottom: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const sx = (x: number) => pad.left + ((x - X_MIN) / (X_MAX - X_MIN)) * innerW;
  const sy = (y: number) => pad.top + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * innerH;

  const linePath = (w: number, b: number) => {
    const y0 = w * X_MIN + b;
    const y1 = w * X_MAX + b;
    return `M${sx(X_MIN)},${sy(y0)} L${sx(X_MAX)},${sy(y1)}`;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-xl bg-paper">
      {[0, 2, 4, 6, 8, 10, 12].map((tick) => (
        <g key={tick}>
          <line x1={pad.left} x2={width - pad.right} y1={sy(tick)} y2={sy(tick)} stroke="#e3dacb" />
          <text x={8} y={sy(tick) + 4} className="fill-muted" fontSize="11" fontFamily="IBM Plex Mono, monospace">
            {tick}
          </text>
        </g>
      ))}
      {[0, 2, 4, 6, 8].map((tick) => (
        <text key={tick} x={sx(tick) - 4} y={height - 12} fontSize="11" className="fill-muted" fontFamily="IBM Plex Mono, monospace">
          {tick}
        </text>
      ))}
      {showSquares &&
        POINTS.map((point) => {
          const predicted = weight * point.x + bias;
          const top = Math.min(sy(point.y), sy(predicted));
          const size = Math.abs(sy(point.y) - sy(predicted));
          return (
            <rect
              key={`sq-${point.x}`}
              x={sx(point.x)}
              y={top}
              width={size}
              height={size}
              fill="#b55248"
              opacity="0.16"
            />
          );
        })}
      {POINTS.map((point) => (
        <line
          key={`res-${point.x}`}
          x1={sx(point.x)}
          x2={sx(point.x)}
          y1={sy(point.y)}
          y2={sy(weight * point.x + bias)}
          stroke="#b55248"
          strokeWidth="1.4"
        />
      ))}
      {showFit && (
        <path d={linePath(fit.weight, fit.bias)} fill="none" stroke="#1c1915" strokeDasharray="5 5" strokeWidth="1.6" />
      )}
      <path d={linePath(weight, bias)} fill="none" stroke="#c9842a" strokeWidth="2.6" />
      {POINTS.map((point) => (
        <circle key={`pt-${point.x}`} cx={sx(point.x)} cy={sy(point.y)} r="4.5" fill="#1e4d6b" />
      ))}
    </svg>
  );
}
