"use client";

import { Plot3D } from "@/components/Plot3D";
import { useEffect, useMemo, useState } from "react";

type Mode = "2d" | "3d";
type Row = { id: string; x: string; z: string; y: string };
const names = ["setosa", "versicolor", "virginica"];

function softmax(scores: number[]) {
  const shifted = scores.map((score) => score - Math.max(...scores));
  const exps = shifted.map((score) => Math.exp(score));
  const sum = exps.reduce((total, value) => total + value, 0);
  return exps.map((value) => value / sum);
}

function seed(): Row[] {
  return [
    { id: "a", x: "1", z: "1.2", y: "0" },
    { id: "b", x: "1.4", z: "1.8", y: "0" },
    { id: "c", x: "3", z: "1.5", y: "1" },
    { id: "d", x: "3.4", z: "2.1", y: "1" },
    { id: "e", x: "2.2", z: "3.4", y: "2" },
    { id: "f", x: "2.8", z: "3.8", y: "2" },
  ];
}

export function CategoricalBench() {
  const [mode, setMode] = useState<Mode>("2d");
  const [rows, setRows] = useState<Row[]>(seed);
  const [weights, setWeights] = useState([[1.1, -0.2], [-0.4, 0.8], [-0.6, -0.5]]);
  const [bias, setBias] = useState([0.2, 0.1, -0.2]);
  const [rate, setRate] = useState(0.25);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<{ step: number; loss: number }[]>([{ step: 0, loss: 1 }]);
  const [askX, setAskX] = useState("2");
  const [askZ, setAskZ] = useState("2");
  const points = useMemo(() => rows.map((row) => ({ x: Number(row.x), z: Number(row.z), y: Number(row.y) })).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && point.y >= 0 && point.y <= 2 && (mode === "2d" || Number.isFinite(point.z))), [rows, mode]);

  function probs(x: number, z: number, nextWeights = weights, nextBias = bias) {
    return softmax(nextWeights.map((weight, index) => weight[0] * x + (mode === "3d" ? weight[1] * z : 0) + nextBias[index]));
  }
  function cost(nextWeights = weights, nextBias = bias) {
    if (!points.length) return 0;
    return points.reduce((sum, point) => sum - Math.log(Math.max(probs(point.x, point.z, nextWeights, nextBias)[point.y], 1e-8)), 0) / points.length;
  }
  const asked = probs(Number(askX), Number(askZ));
  const winner = asked.indexOf(Math.max(...asked));

  useEffect(() => {
    if (!playing || points.length < 2) return;
    const timer = window.setInterval(() => {
      setWeights((currentWeights) => {
        const nextWeights = currentWeights.map((row) => [...row]);
        const nextBias = [...bias];
        for (const point of points) {
          const p = probs(point.x, point.z, currentWeights, bias);
          for (let k = 0; k < 3; k += 1) {
            const slope = p[k] - (point.y === k ? 1 : 0);
            nextWeights[k][0] -= rate * slope * point.x / points.length;
            nextWeights[k][1] -= rate * slope * point.z / points.length;
            nextBias[k] -= rate * slope / points.length;
          }
        }
        setBias(nextBias);
        setHistory((trail) => [...trail, { step: (trail.at(-1)?.step ?? 0) + 1, loss: cost(nextWeights, nextBias) }].slice(-24));
        return nextWeights;
      });
    }, 160);
    return () => window.clearInterval(timer);
  }, [playing, points, rate, mode, bias]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl text-ink">Try it</h2>
        <div className="flex gap-2">
          {(["2d", "3d"] as Mode[]).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setPlaying(false); }} className={`rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${mode === item ? "bg-ink text-paper" : "border border-line text-muted"}`}>{item}</button>)}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
          {mode === "2d" ? <Scatter points={points} probs={probs} /> : <Plot3D points={points.map((point) => ({ ...point, y: probs(point.x, point.z)[point.y] }))} w1={0} w2={0} bias={0} colorFor={(point) => ["var(--accent)", "var(--highlight)", "var(--residual)"][points.find((item) => item.x === point.x)?.y ?? 0]} />}
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">3D height is the probability of the true class. Drag, or nudge X Y Z, then reset view.</p>
        </div>
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Predict</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-sm text-muted">x<input value={askX} onChange={(event) => setAskX(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono" /></label>
            {mode === "3d" && <label className="text-sm text-muted">x2<input value={askZ} onChange={(event) => setAskZ(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono" /></label>}
          </div>
          {names.map((name, index) => <p key={name} className="mt-2 font-mono text-sm">{name} {asked[index].toFixed(2)}</p>)}
          <p className="mt-2 text-ink-soft">predicted {names[winner]}</p>
          <button type="button" onClick={() => setPlaying((value) => !value)} className="mt-4 rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-raised">{playing ? "Pause" : "Train"}</button>
          <label className="mt-3 block text-sm text-muted">learning rate<input value={rate} onChange={(event) => setRate(Number(event.target.value) || rate)} className="mt-1 w-full rounded-lg border border-line bg-paper px-2 py-1 font-mono" /></label>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Categorical cross-entropy</p>
          <p className="equation mt-3 text-sm">−log(p of the true class)</p>
          <p className="mt-2 font-mono text-sm">cost {cost().toFixed(3)}</p>
          <div className="mt-2 max-h-24 overflow-auto font-mono text-[12px]">{history.slice().reverse().map((item) => <p key={item.step}>step {item.step} · loss {item.loss.toFixed(3)}</p>)}</div>
        </div>
        <div className="rounded-[1.25rem] border border-line bg-paper-raised p-4">
          <div className="flex justify-between"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Variable table</p><button type="button" onClick={() => setRows((current) => [...current, { id: `r-${Date.now()}`, x: "", z: "", y: "0" }])} className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Add row</button></div>
          <div className="mt-3 max-h-56 overflow-auto font-mono text-sm">
            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-4 gap-2 border-t border-line py-1">
                <input value={row.x} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, x: event.target.value } : item))} className="rounded border border-line bg-paper px-1" />
                <input value={row.z} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, z: event.target.value } : item))} className="rounded border border-line bg-paper px-1" />
                <input value={row.y} onChange={(event) => setRows((current) => current.map((item) => item.id === row.id ? { ...item, y: event.target.value } : item))} className="rounded border border-line bg-paper px-1" />
                <button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="text-muted">remove</button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">y is 0, 1, or 2. That is the class.</p>
        </div>
      </div>
    </section>
  );
}

function Scatter({ points, probs }: { points: { x: number; z: number; y: number }[]; probs: (x: number, z: number) => number[] }) {
  return (
    <svg viewBox="0 0 640 320" className="w-full rounded-xl bg-paper">
      {points.map((point) => {
        const guess = probs(point.x, point.z).indexOf(Math.max(...probs(point.x, point.z)));
        return <circle key={`${point.x}-${point.z}`} cx={40 + point.x * 90} cy={280 - point.z * 60} r="7" fill={["var(--accent)", "var(--highlight)", "var(--residual)"][point.y]} stroke={guess === point.y ? "transparent" : "var(--ink)"} />;
      })}
      <text x="16" y="24" fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">x across, x2 up, color is true class</text>
    </svg>
  );
}
