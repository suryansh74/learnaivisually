"use client";

import { Plot3D } from "@/components/Plot3D";
import { useEffect, useMemo, useState } from "react";

type Mode = "2d" | "3d";
type Row = { id: string; x: string; z: string; y: string };
type Point = { x: number; z: number; y: number };

function sigmoid(z: number) {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
}

function seed(): Row[] {
  return [
    { id: "a", x: "0.6", z: "0.8", y: "0" },
    { id: "b", x: "1.2", z: "1.1", y: "0" },
    { id: "c", x: "1.8", z: "1.4", y: "0" },
    { id: "d", x: "2.8", z: "2.2", y: "1" },
    { id: "e", x: "3.4", z: "2.8", y: "1" },
    { id: "f", x: "4.1", z: "3.2", y: "1" },
  ];
}

function parse(rows: Row[], mode: Mode): Point[] {
  return rows
    .map((row) => ({ x: Number(row.x), z: mode === "3d" ? Number(row.z) : 0, y: Number(row.y) }))
    .filter((point) => Number.isFinite(point.x) && (point.y === 0 || point.y === 1) && (mode === "2d" || Number.isFinite(point.z)));
}

export function BinaryBench() {
  const [mode, setMode] = useState<Mode>("2d");
  const [rows, setRows] = useState<Row[]>(seed);
  const [model, setModel] = useState({ w1: 1.2, w2: 0.8, bias: -4 });
  const [rate, setRate] = useState(0.35);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<{ step: number; loss: number }[]>([{ step: 0, loss: 0.6 }]);
  const [askX, setAskX] = useState("2.4");
  const [askZ, setAskZ] = useState("2");
  const [open, setOpen] = useState(false);
  const points = useMemo(() => parse(rows, mode), [rows, mode]);

  function score(point: Point) {
    return mode === "3d" ? model.w1 * point.x + model.w2 * point.z + model.bias : model.w1 * point.x + model.bias;
  }
  function lossOf(next = model) {
    if (!points.length) return 0;
    return points.reduce((sum, point) => {
      const p = sigmoid(mode === "3d" ? next.w1 * point.x + next.w2 * point.z + next.bias : next.w1 * point.x + next.bias);
      return sum + (point.y ? -Math.log(Math.max(p, 1e-8)) : -Math.log(Math.max(1 - p, 1e-8)));
    }, 0) / points.length;
  }
  const cost = lossOf();
  const asked = Number(askX);
  const askedZ = Number(askZ);
  const askedP = Number.isFinite(asked) && (mode === "2d" || Number.isFinite(askedZ))
    ? sigmoid(mode === "3d" ? model.w1 * asked + model.w2 * askedZ + model.bias : model.w1 * asked + model.bias)
    : null;

  useEffect(() => {
    if (!playing || points.length < 2) return;
    const timer = window.setInterval(() => {
      setModel((current) => {
        let dw1 = 0;
        let dw2 = 0;
        let db = 0;
        for (const point of points) {
          const p = sigmoid(mode === "3d" ? current.w1 * point.x + current.w2 * point.z + current.bias : current.w1 * point.x + current.bias);
          const slope = p - point.y;
          dw1 += slope * point.x;
          dw2 += slope * point.z;
          db += slope;
        }
        const n = points.length;
        const next = { w1: current.w1 - rate * (dw1 / n), w2: mode === "3d" ? current.w2 - rate * (dw2 / n) : current.w2, bias: current.bias - rate * (db / n) };
        setHistory((trail) => [...trail, { step: (trail.at(-1)?.step ?? 0) + 1, loss: lossOf(next) }].slice(-24));
        return next;
      });
    }, 140);
    return () => window.clearInterval(timer);
  }, [playing, points, rate, mode]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl text-ink">Try it</h2>
        <div className="flex gap-2">
          {(["2d", "3d"] as Mode[]).map((item) => (
            <button key={item} type="button" onClick={() => { setMode(item); setPlaying(false); }} className={`rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${mode === item ? "bg-ink text-paper" : "border border-line text-muted"}`}>{item === "2d" ? "2D curve" : "3D plane"}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_320px]">
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
          {mode === "2d" ? <Curve points={points} w1={model.w1} bias={model.bias} /> : <Plot3D points={points.map((point) => ({ ...point, y: sigmoid(score(point)) }))} w1={0} w2={0} bias={0} colorFor={(point) => (points.find((item) => item.x === point.x)?.y ? "var(--accent)" : "var(--residual)")} />}
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Height in 3D is the sigmoid probability. Accent is class 1. Terracotta is class 0.</p>
        </div>
        <div className="space-y-4">
          <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Parameters</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Num label="w" value={model.w1} onChange={(value) => setModel((current) => ({ ...current, w1: value }))} />
              {mode === "3d" && <Num label="w2" value={model.w2} onChange={(value) => setModel((current) => ({ ...current, w2: value }))} />}
              <Num label="b" value={model.bias} onChange={(value) => setModel((current) => ({ ...current, bias: value }))} />
              <Num label="learning rate" value={rate} onChange={setRate} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-raised">{playing ? "Pause" : "Train"}</button>
              <button type="button" onClick={() => setPlaying(false)} className="rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Stop</button>
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Predict</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-sm text-muted">x<input value={askX} onChange={(event) => setAskX(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono text-ink" /></label>
              {mode === "3d" && <label className="text-sm text-muted">x2<input value={askZ} onChange={(event) => setAskZ(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono text-ink" /></label>}
            </div>
            <p className="mt-3 font-display text-3xl text-highlight">{askedP === null ? "—" : askedP.toFixed(3)}</p>
            <p className="text-sm text-ink-soft">{askedP === null ? "" : askedP >= 0.5 ? "class 1" : "class 0"}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Binary cross-entropy</p>
          <p className="equation mt-3 text-sm">−[ y log p + (1 − y) log(1 − p) ]</p>
          <p className="mt-2 font-mono text-sm">cost {cost.toFixed(3)}</p>
          <div className="mt-2 max-h-24 overflow-auto font-mono text-[12px] text-ink-soft">
            {history.slice().reverse().map((item) => <p key={item.step}>step {item.step} · loss {item.loss.toFixed(3)}</p>)}
          </div>
        </div>
        <ClassTable rows={rows} mode={mode} onChange={setRows} predict={(row) => sigmoid(score({ x: Number(row.x), z: Number(row.z), y: 0 }))} />
      </div>
      <div className="rounded-[1.25rem] border border-line bg-paper-raised p-5">
        <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-full bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper">{open ? "Hide steps" : "Open detailed calculation"}</button>
        {open && (
          <div className="mt-4 space-y-2 font-mono text-sm text-ink-soft">
            {points.slice(0, 30).map((point, index) => {
              const p = sigmoid(score(point));
              const term = point.y ? -Math.log(Math.max(p, 1e-8)) : -Math.log(Math.max(1 - p, 1e-8));
              return <p key={index}>{index + 1}. x {point.x.toFixed(2)} y {point.y} p {p.toFixed(3)} term {term.toFixed(3)}</p>;
            })}
            {points.length > 30 && <p>… {points.length - 30} more rows omitted after 30</p>}
            <p>cost = mean term = {cost.toFixed(4)}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function Curve({ points, w1, bias }: { points: Point[]; w1: number; bias: number }) {
  const path = Array.from({ length: 60 }, (_, index) => {
    const x = (index / 59) * 6;
    const y = sigmoid(w1 * x + bias);
    return `${index === 0 ? "M" : "L"}${40 + (x / 6) * 560},${240 - y * 200}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 640 270" className="w-full rounded-xl bg-paper">
      <text x="8" y="28" fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">1</text>
      <text x="8" y="136" fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">0.5</text>
      <text x="8" y="244" fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">0</text>
      <path d={path} fill="none" stroke="var(--highlight)" strokeWidth="2.4" />
      {points.map((point) => <circle key={`${point.x}-${point.y}`} cx={40 + (point.x / 6) * 560} cy={240 - point.y * 200} r="5" fill={point.y ? "var(--accent)" : "var(--residual)"} />)}
    </svg>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="text-sm text-muted">{label}<input value={value.toFixed(2)} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono text-ink" /></label>;
}

function ClassTable({ rows, mode, onChange, predict }: { rows: Row[]; mode: Mode; onChange: (rows: Row[]) => void; predict: (row: Row) => number }) {
  return (
    <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
      <div className="flex justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Variable table</p>
        <button type="button" onClick={() => onChange([...rows, { id: `r-${Date.now()}`, x: "", z: "", y: "0" }])} className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]">Add row</button>
      </div>
      <div className="mt-3 max-h-56 overflow-auto font-mono text-sm">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_1fr_70px_50px_60px] gap-2 border-t border-line py-1">
            <input value={row.x} onChange={(event) => onChange(rows.map((item) => item.id === row.id ? { ...item, x: event.target.value } : item))} className="rounded border border-line bg-paper px-1" />
            {mode === "3d" ? <input value={row.z} onChange={(event) => onChange(rows.map((item) => item.id === row.id ? { ...item, z: event.target.value } : item))} className="rounded border border-line bg-paper px-1" /> : <span />}
            <input value={row.y} onChange={(event) => onChange(rows.map((item) => item.id === row.id ? { ...item, y: event.target.value } : item))} className="rounded border border-line bg-paper px-1" />
            <span className="text-highlight">{Number.isFinite(Number(row.x)) ? predict(row).toFixed(2) : "—"}</span>
            <button type="button" onClick={() => onChange(rows.filter((item) => item.id !== row.id))} className="text-muted">remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
