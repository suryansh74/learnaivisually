"use client";

import { useEffect, useMemo, useState } from "react";

type LossName = "mse" | "mae" | "huber";
type Mode = "2d" | "3d";
type Row = { id: string; x: string; z: string; y: string };
type Point = { x: number; z: number; y: number };
type Hover = { label: string; left: number; top: number } | null;

const LOSSES: { id: LossName; label: string; formula: string; note: string }[] = [
  { id: "mse", label: "MSE", formula: "L = (1/n) Σ (ŷ − y)²", note: "Squares the miss. A far point pulls hard." },
  { id: "mae", label: "MAE", formula: "L = (1/n) Σ |ŷ − y|", note: "Counts the miss once. Outliers pull less." },
  { id: "huber", label: "Huber", formula: "L = (1/n) Σ ρ(ŷ − y), δ = 1", note: "Squared while small, then linear. δ is 1." },
];

function seedRows(): Row[] {
  return [
    { id: "r1", x: "1.0", z: "1.2", y: "2.4" },
    { id: "r2", x: "2.2", z: "1.8", y: "4.1" },
    { id: "r3", x: "3.1", z: "2.6", y: "5.6" },
    { id: "r4", x: "4.4", z: "3.1", y: "7.0" },
    { id: "r5", x: "5.6", z: "4.2", y: "8.8" },
    { id: "r6", x: "6.8", z: "4.8", y: "10.1" },
    { id: "r7", x: "8.0", z: "5.5", y: "11.6" },
  ];
}

function parsePoints(rows: Row[], mode: Mode): Point[] {
  return rows
    .map((row) => ({ x: Number(row.x), z: mode === "3d" ? Number(row.z) : 0, y: Number(row.y) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && (mode === "2d" || Number.isFinite(point.z)));
}

function predict(point: Point, w1: number, w2: number, bias: number, mode: Mode) {
  return mode === "3d" ? w1 * point.x + w2 * point.z + bias : w1 * point.x + bias;
}

function lossOf(points: Point[], w1: number, w2: number, bias: number, loss: LossName, mode: Mode) {
  if (points.length === 0) return 0;
  const total = points.reduce((sum, point) => {
    const error = predict(point, w1, w2, bias, mode) - point.y;
    if (loss === "mae") return sum + Math.abs(error);
    if (loss === "huber") {
      const abs = Math.abs(error);
      return sum + (abs <= 1 ? 0.5 * error * error : abs - 0.5);
    }
    return sum + error * error;
  }, 0);
  return total / points.length;
}

function gradients(points: Point[], w1: number, w2: number, bias: number, loss: LossName, mode: Mode) {
  const n = points.length || 1;
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
  return { dw1: dw1 / n, dw2: dw2 / n, db: db / n };
}

function randomRows(mode: Mode): Row[] {
  const count = 8 + Math.floor(Math.random() * 5);
  const w1 = 0.7 + Math.random() * 0.7;
  const w2 = 0.4 + Math.random() * 0.6;
  const bias = 0.8 + Math.random() * 1.6;
  return Array.from({ length: count }, (_, index) => {
    const x = 1 + (index * 7) / (count - 1) + (Math.random() - 0.5) * 0.4;
    const z = 1 + Math.random() * 6;
    const y = w1 * x + (mode === "3d" ? w2 * z : 0) + bias + (Math.random() - 0.5) * 1.8;
    return {
      id: `rnd-${index}-${Math.random().toString(36).slice(2, 7)}`,
      x: x.toFixed(2),
      z: z.toFixed(2),
      y: y.toFixed(2),
    };
  });
}

function ticks(min: number, max: number, count = 5) {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => min + step * index);
}

export function LinearRegressionBench() {
  const [mode, setMode] = useState<Mode>("2d");
  const [rows, setRows] = useState<Row[]>(seedRows);
  const [loss, setLoss] = useState<LossName>("mse");
  const [model, setModel] = useState({ w1: 0.15, w2: 0.1, bias: 8 });
  const [rate, setRate] = useState(0.03);
  const [playing, setPlaying] = useState(false);
  const [angle, setAngle] = useState(0.7);
  const [history, setHistory] = useState<number[]>([1]);

  const points = useMemo(() => parsePoints(rows, mode), [rows, mode]);
  const currentLoss = lossOf(points, model.w1, model.w2, model.bias, loss, mode);
  const selected = LOSSES.find((item) => item.id === loss) ?? LOSSES[0];

  useEffect(() => {
    if (!playing || points.length < 2) return;
    const timer = window.setInterval(() => {
      setModel((current) => {
        const step = gradients(points, current.w1, current.w2, current.bias, loss, mode);
        const next = {
          w1: current.w1 - rate * step.dw1,
          w2: mode === "3d" ? current.w2 - rate * step.dw2 : current.w2,
          bias: current.bias - rate * step.db,
        };
        setHistory((trail) => [...trail, lossOf(points, next.w1, next.w2, next.bias, loss, mode)].slice(-48));
        return next;
      });
    }, 90);
    return () => window.clearInterval(timer);
  }, [playing, points, loss, rate, mode]);

  function stepOnce() {
    const step = gradients(points, model.w1, model.w2, model.bias, loss, mode);
    const next = {
      w1: model.w1 - rate * step.dw1,
      w2: mode === "3d" ? model.w2 - rate * step.dw2 : model.w2,
      bias: model.bias - rate * step.db,
    };
    setModel(next);
    setHistory((trail) => [...trail, lossOf(points, next.w1, next.w2, next.bias, loss, mode)].slice(-48));
  }

  function resetLine() {
    const nextBias = points.length ? Math.max(...points.map((point) => point.y)) : 8;
    setPlaying(false);
    setModel({ w1: 0.15, w2: 0.1, bias: nextBias });
    setHistory([lossOf(points, 0.15, 0.1, nextBias, loss, mode)]);
  }

  function fillRandom() {
    const next = randomRows(mode);
    setPlaying(false);
    setRows(next);
    setModel({ w1: 0.15, w2: 0.1, bias: 8 });
    setHistory([lossOf(parsePoints(next, mode), 0.15, 0.1, 8, loss, mode)]);
  }

  function updateRow(id: string, key: "x" | "z" | "y", value: string) {
    setPlaying(false);
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <section className="rounded-[1.25rem] border border-line bg-paper-raised p-4 shadow-sheet sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Demonstration</p>
            <h2 className="mt-1 font-display text-3xl text-ink">{mode === "2d" ? "The line learning the table" : "The plane learning the table"}</h2>
          </div>
          <div className="flex gap-2">
            {(["2d", "3d"] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setPlaying(false);
                }}
                className={`rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${
                  mode === item ? "bg-ink text-paper" : "border border-line text-muted"
                }`}
              >
                {item === "2d" ? "2D line" : "3D plane"}
              </button>
            ))}
          </div>
        </div>
        {mode === "2d" ? (
          <Plot2D points={points} w1={model.w1} bias={model.bias} />
        ) : (
          <Plot3D points={points} w1={model.w1} w2={model.w2} bias={model.bias} angle={angle} onAngle={setAngle} />
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-raised">
            {playing ? "Pause" : "Play animation"}
          </button>
          <button type="button" onClick={stepOnce} className="rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper">
            One step
          </button>
          <button type="button" onClick={resetLine} className="rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            Reset fit
          </button>
        </div>
        <label className="mt-4 block max-w-xs">
          <span className="flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            learning rate <span className="text-ink">{rate.toFixed(3)}</span>
          </span>
          <input className="mt-2 w-full accent-highlight" type="range" min={0.005} max={0.08} step={0.005} value={rate} onChange={(event) => setRate(Number(event.target.value))} />
        </label>
        <p className="mt-3 font-mono text-sm text-ink-soft">
          w1 {model.w1.toFixed(3)}
          {mode === "3d" ? ` · w2 ${model.w2.toFixed(3)}` : ""} · b {model.bias.toFixed(3)}
        </p>
        <p className="font-mono text-sm text-ink-soft">
          {selected.label} <span className="text-residual">{currentLoss.toFixed(3)}</span>
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
          <p className="equation mt-4 text-sm">{mode === "3d" ? "ŷ = w1 x1 + w2 x2 + b" : "ŷ = w x + b"}</p>
          <p className="equation mt-2 text-sm">{selected.formula}</p>
          <p className="mt-3 text-ink-soft">{selected.note}</p>
        </section>

        <section className="rounded-[1.25rem] border border-line bg-paper-raised p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Variable table</p>
              <h2 className="mt-1 font-display text-2xl text-ink">{mode === "3d" ? "x1, x2, y" : "x and y"}</h2>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={fillRandom} className="rounded-full bg-highlight px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">
                Random fill
              </button>
              <button
                type="button"
                onClick={() => setRows((current) => [...current, { id: `row-${Date.now()}`, x: "", z: "", y: "" }])}
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
                  <th className="pb-2 pr-3">{mode === "3d" ? "x1" : "x"}</th>
                  {mode === "3d" && <th className="pb-2 pr-3">x2</th>}
                  <th className="pb-2 pr-3">y</th>
                  <th className="pb-2 pr-3">ŷ</th>
                  <th className="pb-2"> </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const point = { x: Number(row.x), z: Number(row.z), y: Number(row.y) };
                  const usable = Number.isFinite(point.x) && Number.isFinite(point.y) && (mode === "2d" || Number.isFinite(point.z));
                  const predicted = usable ? predict(point, model.w1, model.w2, model.bias, mode) : null;
                  return (
                    <tr key={row.id} className="border-t border-line">
                      <td className="py-2 pr-3 text-muted">{index + 1}</td>
                      <td className="py-2 pr-3">
                        <input value={row.x} onChange={(event) => updateRow(row.id, "x", event.target.value)} className="w-16 rounded-lg border border-line bg-paper px-2 py-1 text-ink" inputMode="decimal" />
                      </td>
                      {mode === "3d" && (
                        <td className="py-2 pr-3">
                          <input value={row.z} onChange={(event) => updateRow(row.id, "z", event.target.value)} className="w-16 rounded-lg border border-line bg-paper px-2 py-1 text-ink" inputMode="decimal" />
                        </td>
                      )}
                      <td className="py-2 pr-3">
                        <input value={row.y} onChange={(event) => updateRow(row.id, "y", event.target.value)} className="w-16 rounded-lg border border-line bg-paper px-2 py-1 text-ink" inputMode="decimal" />
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
          <p className="mt-3 text-sm text-muted">{points.length} usable rows. Empty or non-numeric rows are ignored.</p>
        </section>
      </div>
    </div>
  );
}

function Plot2D({ points, w1, bias }: { points: Point[]; w1: number; bias: number }) {
  const width = 640;
  const height = 400;
  const pad = { left: 52, right: 18, top: 16, bottom: 36 };
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xMin = Math.min(0, ...xs) - 0.4;
  const xMax = Math.max(8, ...xs, 1) + 0.4;
  const yMin = Math.min(0, ...ys, bias) - 0.8;
  const yMax = Math.max(10, ...ys, bias) + 0.8;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * innerW;
  const sy = (y: number) => pad.top + (1 - (y - yMin) / (yMax - yMin)) * innerH;
  const [hover, setHover] = useState<Hover>(null);
  const xTicks = ticks(xMin, xMax);
  const yTicks = ticks(yMin, yMax);

  function onMove(event: React.MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * width;
    const py = ((event.clientY - rect.top) / rect.height) * height;
    if (px < pad.left || px > width - pad.right || py < pad.top || py > height - pad.bottom) {
      setHover(null);
      return;
    }
    const x = xMin + ((px - pad.left) / innerW) * (xMax - xMin);
    const y = yMin + (1 - (py - pad.top) / innerH) * (yMax - yMin);
    let nearest: Point | null = null;
    let best = 18;
    for (const point of points) {
      const distance = Math.hypot(sx(point.x) - px, sy(point.y) - py);
      if (distance < best) {
        best = distance;
        nearest = point;
      }
    }
    const predicted = w1 * x + bias;
    const label = nearest
      ? `point  x ${nearest.x.toFixed(2)}   y ${nearest.y.toFixed(2)}   ŷ ${(w1 * nearest.x + bias).toFixed(2)}`
      : `x ${x.toFixed(2)}   y ${y.toFixed(2)}   line ŷ ${predicted.toFixed(2)}`;
    setHover({ label, left: event.clientX - rect.left + 12, top: event.clientY - rect.top + 12 });
  }

  return (
    <div className="relative mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-xl bg-paper" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={pad.left} x2={width - pad.right} y1={sy(tick)} y2={sy(tick)} stroke="var(--line)" />
            <text x={6} y={sy(tick) + 4} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">
              {tick.toFixed(1)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text key={`x-${tick}`} x={sx(tick) - 12} y={height - 10} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">
            {tick.toFixed(1)}
          </text>
        ))}
        <text x={pad.left} y={14} fill="var(--muted)" fontSize="11" fontFamily="IBM Plex Mono, monospace">y</text>
        <text x={width - 28} y={height - 12} fill="var(--muted)" fontSize="11" fontFamily="IBM Plex Mono, monospace">x</text>
        <path d={`M${sx(xMin)},${sy(w1 * xMin + bias)} L${sx(xMax)},${sy(w1 * xMax + bias)}`} fill="none" stroke="var(--highlight)" strokeWidth="2.6" />
        {points.map((point) => (
          <g key={`${point.x}-${point.y}`}>
            <line x1={sx(point.x)} x2={sx(point.x)} y1={sy(point.y)} y2={sy(w1 * point.x + bias)} stroke="var(--residual)" strokeWidth="1.3" />
            <circle cx={sx(point.x)} cy={sy(point.y)} r="4.5" fill="var(--accent)" />
          </g>
        ))}
      </svg>
      {hover && <Tooltip hover={hover} />}
    </div>
  );
}

function Plot3D({
  points,
  w1,
  w2,
  bias,
  angle,
  onAngle,
}: {
  points: Point[];
  w1: number;
  w2: number;
  bias: number;
  angle: number;
  onAngle: (angle: number) => void;
}) {
  const width = 640;
  const height = 420;
  const xs = points.map((point) => point.x);
  const zs = points.map((point) => point.z);
  const ys = points.map((point) => point.y);
  const xMin = Math.min(0, ...xs);
  const xMax = Math.max(8, ...xs, 1);
  const zMin = Math.min(0, ...zs);
  const zMax = Math.max(6, ...zs, 1);
  const yMax = Math.max(10, ...ys, bias, 1);
  const [hover, setHover] = useState<Hover>(null);

  function project(x: number, z: number, y: number) {
    const nx = (x - xMin) / (xMax - xMin) - 0.5;
    const nz = (z - zMin) / (zMax - zMin) - 0.5;
    const ny = y / yMax;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const px = nx * c - nz * s;
    const pz = nx * s + nz * c;
    return {
      x: 320 + px * 250 + pz * 40,
      y: 300 - ny * 230 + pz * 90,
      depth: pz,
    };
  }

  const grid = [0, 0.25, 0.5, 0.75, 1];
  const planeLines = grid.flatMap((t) => {
    const x = xMin + t * (xMax - xMin);
    const z = zMin + t * (zMax - zMin);
    const alongX = [project(x, zMin, w1 * x + w2 * zMin + bias), project(x, zMax, w1 * x + w2 * zMax + bias)];
    const alongZ = [project(xMin, z, w1 * xMin + w2 * z + bias), project(xMax, z, w1 * xMax + w2 * z + bias)];
    return [alongX, alongZ];
  });
  const projected = points
    .map((point) => ({ point, screen: project(point.x, point.z, point.y), fit: project(point.x, point.z, w1 * point.x + w2 * point.z + bias) }))
    .sort((a, b) => a.screen.depth - b.screen.depth);
  const xAxis = [project(xMin, zMin, 0), project(xMax, zMin, 0)];
  const zAxis = [project(xMin, zMin, 0), project(xMin, zMax, 0)];
  const yAxis = [project(xMin, zMin, 0), project(xMin, zMin, yMax)];

  function onMove(event: React.MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * width;
    const py = ((event.clientY - rect.top) / rect.height) * height;
    let nearest: (typeof projected)[number] | null = null;
    let best = 20;
    for (const item of projected) {
      const distance = Math.hypot(item.screen.x - px, item.screen.y - py);
      if (distance < best) {
        best = distance;
        nearest = item;
      }
    }
    if (!nearest) {
      setHover(null);
      return;
    }
    const predicted = w1 * nearest.point.x + w2 * nearest.point.z + bias;
    setHover({
      label: `x1 ${nearest.point.x.toFixed(2)}   x2 ${nearest.point.z.toFixed(2)}   y ${nearest.point.y.toFixed(2)}   ŷ ${predicted.toFixed(2)}`,
      left: event.clientX - rect.left + 12,
      top: event.clientY - rect.top + 12,
    });
  }

  return (
    <div className="relative mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-xl bg-paper" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <line x1={xAxis[0].x} y1={xAxis[0].y} x2={xAxis[1].x} y2={xAxis[1].y} stroke="var(--line)" />
        <line x1={zAxis[0].x} y1={zAxis[0].y} x2={zAxis[1].x} y2={zAxis[1].y} stroke="var(--line)" />
        <line x1={yAxis[0].x} y1={yAxis[0].y} x2={yAxis[1].x} y2={yAxis[1].y} stroke="var(--line)" />
        <text x={xAxis[1].x + 6} y={xAxis[1].y} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">x1 {xMax.toFixed(1)}</text>
        <text x={zAxis[1].x + 6} y={zAxis[1].y} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">x2 {zMax.toFixed(1)}</text>
        <text x={yAxis[1].x - 46} y={yAxis[1].y - 6} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">y {yMax.toFixed(1)}</text>
        <text x={xAxis[0].x - 18} y={xAxis[0].y + 16} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">0</text>
        {planeLines.map((line, index) => (
          <line key={index} x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} stroke="var(--highlight)" strokeOpacity="0.75" />
        ))}
        {projected.map((item) => (
          <g key={`${item.point.x}-${item.point.z}`}>
            <line x1={item.screen.x} y1={item.screen.y} x2={item.fit.x} y2={item.fit.y} stroke="var(--residual)" strokeWidth="1.3" />
            <circle cx={item.screen.x} cy={item.screen.y} r="4.5" fill="var(--accent)" />
          </g>
        ))}
      </svg>
      {hover && <Tooltip hover={hover} />}
      <label className="mt-2 block max-w-xs">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">rotate plane</span>
        <input className="mt-1 w-full accent-highlight" type="range" min={-1.2} max={2.2} step={0.02} value={angle} onChange={(event) => onAngle(Number(event.target.value))} />
      </label>
    </div>
  );
}

function Tooltip({ hover }: { hover: Exclude<Hover, null> }) {
  return (
    <div className="pointer-events-none absolute z-10 rounded-lg border border-line bg-paper-raised px-2 py-1 font-mono text-[11px] text-ink" style={{ left: hover.left, top: hover.top }}>
      {hover.label}
    </div>
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
        <path d={path} fill="none" stroke="var(--residual)" strokeWidth="2" />
      </svg>
    </div>
  );
}
