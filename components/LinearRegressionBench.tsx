"use client";

import { DetailedCalculation } from "@/components/DetailedCalculation";
import { Plot3D } from "@/components/Plot3D";
import { useEffect, useMemo, useState } from "react";

type LossName = "mse" | "mae" | "huber";
type Mode = "2d" | "3d";
type Row = { id: string; x: string; z: string; y: string };
type Point = { x: number; z: number; y: number };
type Hover = { label: string; left: number; top: number } | null;
type Step = { step: number; loss: number };

const LOSSES: { id: LossName; label: string; formula: string }[] = [
  { id: "mse", label: "MSE", formula: "(1/n) Σ (ŷ − y)²" },
  { id: "mae", label: "MAE", formula: "(1/n) Σ |ŷ − y|" },
  { id: "huber", label: "Huber", formula: "squared, then linear, δ = 1" },
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
  if (!points.length) return 0;
  const total = points.reduce((sum, point) => {
    const error = predict(point, w1, w2, bias, mode) - point.y;
    if (loss === "mae") return sum + Math.abs(error);
    if (loss === "huber") return sum + (Math.abs(error) <= 1 ? 0.5 * error * error : Math.abs(error) - 0.5);
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
  const count = 8 + Math.floor(Math.random() * 4);
  const w1 = 0.8 + Math.random() * 0.5;
  const w2 = 0.35 + Math.random() * 0.4;
  const bias = 1 + Math.random() * 1.4;
  return Array.from({ length: count }, (_, index) => {
    const x = 1 + (index * 7) / (count - 1);
    const z = 1 + Math.random() * 5;
    const y = w1 * x + (mode === "3d" ? w2 * z : 0) + bias + (Math.random() - 0.5) * 1.6;
    return { id: `rnd-${index}-${Math.random().toString(36).slice(2, 6)}`, x: x.toFixed(2), z: z.toFixed(2), y: y.toFixed(2) };
  });
}

export function LinearRegressionBench() {
  const [mode, setMode] = useState<Mode>("2d");
  const [rows, setRows] = useState<Row[]>(seedRows);
  const [loss, setLoss] = useState<LossName>("mse");
  const [model, setModel] = useState({ w1: 0.2, w2: 0.2, bias: 8 });
  const [rate, setRate] = useState(0.02);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<Step[]>([{ step: 0, loss: 0 }]);
  const [askX, setAskX] = useState("3");
  const [askZ, setAskZ] = useState("2");

  const points = useMemo(() => parsePoints(rows, mode), [rows, mode]);
  const currentLoss = lossOf(points, model.w1, model.w2, model.bias, loss, mode);
  const asked = predict(
    { x: Number(askX), z: Number(askZ), y: 0 },
    model.w1,
    model.w2,
    model.bias,
    mode,
  );
  const askReady = Number.isFinite(Number(askX)) && (mode === "2d" || Number.isFinite(Number(askZ)));

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
        setHistory((trail) => [...trail, { step: (trail.at(-1)?.step ?? 0) + 1, loss: lossOf(points, next.w1, next.w2, next.bias, loss, mode) }].slice(-24));
        return next;
      });
    }, 120);
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
    setHistory((trail) => [...trail, { step: (trail.at(-1)?.step ?? 0) + 1, loss: lossOf(points, next.w1, next.w2, next.bias, loss, mode) }].slice(-24));
  }

  function resetFit() {
    setPlaying(false);
    setModel({ w1: 0.2, w2: 0.2, bias: 8 });
    setHistory([{ step: 0, loss: lossOf(points, 0.2, 0.2, 8, loss, mode) }]);
  }

  function setParam(key: "w1" | "w2" | "bias", value: string) {
    const next = Number(value);
    if (!Number.isFinite(next)) return;
    setPlaying(false);
    setModel((current) => ({ ...current, [key]: next }));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl text-ink">Try it</h2>
        <div className="flex gap-2">
          {(["2d", "3d"] as Mode[]).map((item) => (
            <button key={item} type="button" onClick={() => { setMode(item); setPlaying(false); }} className={`rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${mode === item ? "bg-ink text-paper" : "border border-line text-muted"}`}>
              {item === "2d" ? "2D line" : "3D plane"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4 sm:p-5">
          {mode === "2d" ? (
            <Plot2D points={points} w1={model.w1} bias={model.bias} />
          ) : (
            <Plot3D points={points} w1={model.w1} w2={model.w2} bias={model.bias} />
          )}
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            {mode === "3d" ? "Drag the graph. Horizontal drag turns x2. Vertical drag tips the view." : "Hover for x, y, and the line value."} Amber is the current fit. It stays after you pause.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Parameters</p>
            <p className="mt-1 text-sm text-ink-soft">Type a value. The line or plane moves at once.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label={mode === "3d" ? "w1" : "w"} value={model.w1} onChange={(value) => setParam("w1", value)} />
              {mode === "3d" && <Field label="w2" value={model.w2} onChange={(value) => setParam("w2", value)} />}
              <Field label="b" value={model.bias} onChange={(value) => setParam("bias", value)} />
              <Field label="learning rate" value={rate} onChange={(value) => setRate(Number(value) || rate)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-raised">{playing ? "Pause" : "Train"}</button>
              <button type="button" onClick={stepOnce} className="rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper">One step</button>
              <button type="button" onClick={resetFit} className="rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Reset</button>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Predict</p>
            <p className="mt-1 text-sm text-ink-soft">Uses the parameters above. Training does not clear them.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm text-muted">
                {mode === "3d" ? "x1" : "x"}
                <input value={askX} onChange={(event) => setAskX(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono text-ink" />
              </label>
              {mode === "3d" && (
                <label className="block text-sm text-muted">
                  x2
                  <input value={askZ} onChange={(event) => setAskZ(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono text-ink" />
                </label>
              )}
            </div>
            <p className="mt-3 font-display text-3xl text-highlight">{askReady ? asked.toFixed(2) : "—"}</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">predicted y</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4 sm:p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Loss</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LOSSES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setLoss(item.id); setPlaying(false); }} className={`rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${loss === item.id ? "bg-accent text-paper-raised" : "border border-line text-ink"}`}>
                {item.label}
              </button>
            ))}
          </div>
          <p className="equation mt-4 text-sm">{LOSSES.find((item) => item.id === loss)?.formula}</p>
          <p className="mt-3 font-mono text-sm text-ink">now {currentLoss.toFixed(3)}</p>
          <LossHistory history={history} />
        </div>

        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Variable table</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setPlaying(false); setRows(randomRows(mode)); }} className="rounded-full bg-highlight px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">Random fill</button>
              <button type="button" onClick={() => setRows((current) => [...current, { id: `row-${Date.now()}`, x: "", z: "", y: "" }])} className="rounded-full border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink">Add row</button>
            </div>
          </div>
          <div className="mt-4 max-h-80 overflow-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="pb-2 pr-2">{mode === "3d" ? "x1" : "x"}</th>
                  {mode === "3d" && <th className="pb-2 pr-2">x2</th>}
                  <th className="pb-2 pr-2">y</th>
                  <th className="pb-2 pr-2">ŷ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const point = { x: Number(row.x), z: Number(row.z), y: Number(row.y) };
                  const usable = Number.isFinite(point.x) && Number.isFinite(point.y) && (mode === "2d" || Number.isFinite(point.z));
                  const guessed = usable ? predict(point, model.w1, model.w2, model.bias, mode) : null;
                  return (
                    <tr key={row.id} className="border-t border-line">
                      <td className="py-1.5 pr-2"><input value={row.x} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, x: event.target.value } : item))} className="w-16 rounded-lg border border-line bg-paper px-2 py-1" /></td>
                      {mode === "3d" && <td className="py-1.5 pr-2"><input value={row.z} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, z: event.target.value } : item))} className="w-16 rounded-lg border border-line bg-paper px-2 py-1" /></td>}
                      <td className="py-1.5 pr-2"><input value={row.y} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, y: event.target.value } : item))} className="w-16 rounded-lg border border-line bg-paper px-2 py-1" /></td>
                      <td className="py-1.5 pr-2 text-highlight">{guessed === null ? "—" : guessed.toFixed(2)}</td>
                      <td><button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="text-muted">remove</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DetailedCalculation points={points} w1={model.w1} w2={model.w2} bias={model.bias} rate={rate} loss={loss} mode={mode} />
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  const [text, setText] = useState(value.toFixed(3));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(value.toFixed(3));
  }, [value, focused]);
  return (
    <label className="block text-sm text-muted">
      {label}
      <input
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => {
          setText(event.target.value);
          onChange(event.target.value);
        }}
        className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono text-ink"
      />
    </label>
  );
}

function LossHistory({ history }: { history: Step[] }) {
  const max = Math.max(...history.map((item) => item.loss), 0.1);
  const width = 320;
  const height = 88;
  const path = history.map((item, index) => {
    const x = (index / Math.max(history.length - 1, 1)) * (width - 36) + 32;
    const y = 12 + (1 - item.loss / max) * 58;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <div className="mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full rounded-xl bg-paper">
        <text x="4" y="16" fill="var(--muted)" fontSize="11" fontFamily="IBM Plex Mono, monospace">{max.toFixed(2)}</text>
        <text x="4" y="74" fill="var(--muted)" fontSize="11" fontFamily="IBM Plex Mono, monospace">0</text>
        <path d={path} fill="none" stroke="var(--residual)" strokeWidth="2" />
      </svg>
      <div className="mt-2 max-h-28 overflow-auto font-mono text-[12px] text-ink-soft">
        {history.slice().reverse().map((item) => (
          <p key={`${item.step}-${item.loss}`}>step {item.step} · loss {item.loss.toFixed(3)}</p>
        ))}
      </div>
    </div>
  );
}

function Plot2D({ points, w1, bias }: { points: Point[]; w1: number; bias: number }) {
  const width = 640;
  const height = 390;
  const pad = { left: 52, right: 16, top: 16, bottom: 34 };
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xMin = Math.min(0, ...xs) - 0.4;
  const xMax = Math.max(8, ...xs, 1) + 0.4;
  const yMin = Math.min(0, ...ys, bias) - 0.6;
  const yMax = Math.max(8, ...ys, bias) + 0.6;
  const sx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * (width - pad.left - pad.right);
  const sy = (y: number) => pad.top + (1 - (y - yMin) / (yMax - yMin)) * (height - pad.top - pad.bottom);
  const [hover, setHover] = useState<Hover>(null);
  const xTicks = [xMin, (xMin + xMax) / 2, xMax];
  const yTicks = [yMin, (yMin + yMax) / 2, yMax];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-xl bg-paper" onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / rect.width) * width;
        const py = ((event.clientY - rect.top) / rect.height) * height;
        const x = xMin + ((px - pad.left) / (width - pad.left - pad.right)) * (xMax - xMin);
        const y = yMin + (1 - (py - pad.top) / (height - pad.top - pad.bottom)) * (yMax - yMin);
        setHover({ label: `x ${x.toFixed(2)}   y ${y.toFixed(2)}   line ${(w1 * x + bias).toFixed(2)}`, left: event.clientX - rect.left + 12, top: event.clientY - rect.top + 12 });
      }} onMouseLeave={() => setHover(null)}>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={sy(tick)} y2={sy(tick)} stroke="var(--line)" />
            <text x="6" y={sy(tick) + 4} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">{tick.toFixed(1)}</text>
          </g>
        ))}
        {xTicks.map((tick) => <text key={tick} x={sx(tick) - 12} y={height - 8} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">{tick.toFixed(1)}</text>)}
        <path d={`M${sx(xMin)},${sy(w1 * xMin + bias)} L${sx(xMax)},${sy(w1 * xMax + bias)}`} fill="none" stroke="var(--highlight)" strokeWidth="2.6" />
        {points.map((point) => (
          <g key={`${point.x}-${point.y}`}>
            <line x1={sx(point.x)} x2={sx(point.x)} y1={sy(point.y)} y2={sy(w1 * point.x + bias)} stroke="var(--residual)" />
            <circle cx={sx(point.x)} cy={sy(point.y)} r="4.5" fill="var(--accent)" />
          </g>
        ))}
      </svg>
      {hover && <Tip hover={hover} />}
    </div>
  );
}

function Tip({ hover }: { hover: Exclude<Hover, null> }) {
  return <div className="pointer-events-none absolute z-10 rounded-lg border border-line bg-paper-raised px-2 py-1 font-mono text-[11px] text-ink" style={{ left: hover.left, top: hover.top }}>{hover.label}</div>;
}
