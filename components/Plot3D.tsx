"use client";

import { useRef, useState } from "react";

type Point = { x: number; z: number; y: number };
type Hover = { label: string; left: number; top: number } | null;

const start = { yaw: 0.85, pitch: 0.5, roll: 0 };

export function Plot3D({
  points,
  w1,
  w2,
  bias,
  colorFor,
}: {
  points: Point[];
  w1: number;
  w2: number;
  bias: number;
  colorFor?: (point: Point) => string;
}) {
  const width = 640;
  const height = 400;
  const yaw = useRef(start.yaw);
  const pitch = useRef(start.pitch);
  const roll = useRef(start.roll);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [, setFrame] = useState(0);
  const [hover, setHover] = useState<Hover>(null);

  const xs = points.map((point) => point.x);
  const zs = points.map((point) => point.z);
  const ys = points.map((point) => point.y);
  const xMin = Math.min(0, ...xs);
  const xMax = Math.max(8, ...xs, 1);
  const zMin = Math.min(0, ...zs);
  const zMax = Math.max(6, ...zs, 1);
  const yMin = Math.min(0, ...ys, bias);
  const yMax = Math.max(1, ...ys, bias, 1);

  function project(x: number, z: number, y: number) {
    let nx = (x - (xMin + xMax) / 2) / (xMax - xMin || 1);
    let ny = (y - (yMin + yMax) / 2) / (yMax - yMin || 1);
    let nz = (z - (zMin + zMax) / 2) / (zMax - zMin || 1);
    const cy = Math.cos(yaw.current);
    const sy = Math.sin(yaw.current);
    let x1 = nx * cy + nz * sy;
    let z1 = -nx * sy + nz * cy;
    const cp = Math.cos(pitch.current);
    const sp = Math.sin(pitch.current);
    let y2 = ny * cp - z1 * sp;
    let z2 = ny * sp + z1 * cp;
    const cr = Math.cos(roll.current);
    const sr = Math.sin(roll.current);
    const x3 = x1 * cr - y2 * sr;
    const y3 = x1 * sr + y2 * cr;
    return { x: 320 + x3 * 200 + z2 * 120, y: 205 - y3 * 155, depth: z2 };
  }

  function nudge(axis: "x" | "y" | "z", sign: number) {
    const step = sign * 0.16;
    if (axis === "x") pitch.current = Math.max(-1.1, Math.min(1.2, pitch.current + step));
    if (axis === "y") yaw.current += step;
    if (axis === "z") roll.current += step;
    setFrame((value) => value + 1);
  }

  function reset() {
    yaw.current = start.yaw;
    pitch.current = start.pitch;
    roll.current = start.roll;
    setFrame((value) => value + 1);
  }

  const ticks = [0, 0.5, 1];
  const plane = ticks.flatMap((t) => {
    const x = xMin + t * (xMax - xMin);
    const z = zMin + t * (zMax - zMin);
    return [
      [project(x, zMin, w1 * x + w2 * zMin + bias), project(x, zMax, w1 * x + w2 * zMax + bias)],
      [project(xMin, z, w1 * xMin + w2 * z + bias), project(xMax, z, w1 * xMax + w2 * z + bias)],
    ];
  });
  const origin = project(xMin, zMin, yMin);
  const xEnd = project(xMax, zMin, yMin);
  const zEnd = project(xMin, zMax, yMin);
  const yEnd = project(xMin, zMin, yMax);

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full touch-none cursor-grab rounded-xl bg-paper active:cursor-grabbing"
          onPointerDown={(event) => {
            drag.current = { x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerMove={(event) => {
            if (drag.current) {
              yaw.current += (event.clientX - drag.current.x) * 0.012;
              pitch.current = Math.max(-1.1, Math.min(1.2, pitch.current - (event.clientY - drag.current.y) * 0.01));
              drag.current = { x: event.clientX, y: event.clientY };
              setFrame((value) => value + 1);
            }
            const rect = event.currentTarget.getBoundingClientRect();
            const px = ((event.clientX - rect.left) / rect.width) * width;
            const py = ((event.clientY - rect.top) / rect.height) * height;
            const nearest = points
              .map((point) => ({ point, screen: project(point.x, point.z, point.y) }))
              .sort((a, b) => Math.hypot(a.screen.x - px, a.screen.y - py) - Math.hypot(b.screen.x - px, b.screen.y - py))[0];
            const close = nearest && Math.hypot(nearest.screen.x - px, nearest.screen.y - py) < 22;
            setHover({
              label: close ? `x1 ${nearest.point.x.toFixed(2)}  x2 ${nearest.point.z.toFixed(2)}  y ${nearest.point.y.toFixed(2)}` : "drag to orbit",
              left: event.clientX - rect.left + 12,
              top: event.clientY - rect.top + 12,
            });
          }}
          onPointerLeave={() => {
            drag.current = null;
            setHover(null);
          }}
        >
          <line x1={origin.x} y1={origin.y} x2={xEnd.x} y2={xEnd.y} stroke="var(--ink)" />
          <line x1={origin.x} y1={origin.y} x2={zEnd.x} y2={zEnd.y} stroke="var(--accent)" strokeWidth="1.6" />
          <line x1={origin.x} y1={origin.y} x2={yEnd.x} y2={yEnd.y} stroke="var(--residual)" />
          <text x={xEnd.x + 4} y={xEnd.y} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">x1</text>
          <text x={zEnd.x + 4} y={zEnd.y} fill="var(--accent)" fontSize="12" fontFamily="IBM Plex Mono, monospace">x2</text>
          <text x={yEnd.x - 16} y={yEnd.y - 6} fill="var(--residual)" fontSize="12" fontFamily="IBM Plex Mono, monospace">y</text>
          {plane.map((line, index) => (
            <line key={index} x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} stroke="var(--highlight)" strokeWidth="1.5" />
          ))}
          {points.map((point) => {
            const screen = project(point.x, point.z, point.y);
            const fit = project(point.x, point.z, w1 * point.x + w2 * point.z + bias);
            return (
              <g key={`${point.x}-${point.z}-${point.y}`}>
                <line x1={screen.x} y1={screen.y} x2={fit.x} y2={fit.y} stroke="var(--line)" />
                <circle cx={screen.x} cy={screen.y} r="4.5" fill={colorFor ? colorFor(point) : "var(--accent)"} />
              </g>
            );
          })}
        </svg>
        {hover && <div className="pointer-events-none absolute z-10 rounded-lg border border-line bg-paper-raised px-2 py-1 font-mono text-[11px] text-ink" style={{ left: hover.left, top: hover.top }}>{hover.label}</div>}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <AxisNudge label="X" onMinus={() => nudge("x", -1)} onPlus={() => nudge("x", 1)} />
        <AxisNudge label="Y" onMinus={() => nudge("y", -1)} onPlus={() => nudge("y", 1)} />
        <AxisNudge label="Z" onMinus={() => nudge("z", -1)} onPlus={() => nudge("z", 1)} />
        <button type="button" onClick={reset} className="rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Reset view</button>
        <span className="font-mono text-[11px] text-muted">
          x {((pitch.current * 180) / Math.PI).toFixed(0)}° · y {((yaw.current * 180) / Math.PI).toFixed(0)}° · z {((roll.current * 180) / Math.PI).toFixed(0)}°
        </span>
      </div>
    </div>
  );
}

function AxisNudge({ label, onMinus, onPlus }: { label: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line px-1 py-1">
      <button type="button" onClick={onMinus} className="px-2 font-mono text-xs text-ink" aria-label={`${label} minus`}>←</button>
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">{label}</span>
      <button type="button" onClick={onPlus} className="px-2 font-mono text-xs text-ink" aria-label={`${label} plus`}>→</button>
    </span>
  );
}
