"use client";

import { useRef, useState } from "react";

type Point = { x: number; z: number; y: number };
type Hover = { label: string; left: number; top: number } | null;

export function Plot3D({
  points,
  w1,
  w2,
  bias,
}: {
  points: Point[];
  w1: number;
  w2: number;
  bias: number;
}) {
  const width = 640;
  const height = 420;
  const yaw = useRef(0.9);
  const pitch = useRef(0.55);
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
  const yMax = Math.max(10, ...ys, bias, 1);

  function project(x: number, z: number, y: number) {
    const nx = (x - (xMin + xMax) / 2) / (xMax - xMin || 1);
    const nz = (z - (zMin + zMax) / 2) / (zMax - zMin || 1);
    const ny = (y - (yMin + yMax) / 2) / (yMax - yMin || 1);
    const cy = Math.cos(yaw.current);
    const sy = Math.sin(yaw.current);
    const x1 = nx * cy - nz * sy;
    const z1 = nx * sy + nz * cy;
    const cp = Math.cos(pitch.current);
    const sp = Math.sin(pitch.current);
    const y2 = ny * cp - z1 * sp;
    const z2 = ny * sp + z1 * cp;
    return { x: 320 + x1 * 210 + z2 * 150, y: 210 - y2 * 170, depth: z2 };
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
  const floor = ticks.flatMap((t) => {
    const x = xMin + t * (xMax - xMin);
    const z = zMin + t * (zMax - zMin);
    return [
      [project(x, zMin, yMin), project(x, zMax, yMin)],
      [project(xMin, z, yMin), project(xMax, z, yMin)],
    ];
  });
  const origin = project(xMin, zMin, yMin);
  const xEnd = project(xMax, zMin, yMin);
  const zEnd = project(xMin, zMax, yMin);
  const yEnd = project(xMin, zMin, yMax);

  return (
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
            yaw.current += (event.clientX - drag.current.x) * 0.01;
            pitch.current = Math.max(-0.2, Math.min(1.3, pitch.current + (event.clientY - drag.current.y) * 0.008));
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
            label: close
              ? `x1 ${nearest.point.x.toFixed(2)}  x2 ${nearest.point.z.toFixed(2)}  y ${nearest.point.y.toFixed(2)}  ŷ ${(w1 * nearest.point.x + w2 * nearest.point.z + bias).toFixed(2)}`
              : "drag to orbit x1 and x2",
            left: event.clientX - rect.left + 12,
            top: event.clientY - rect.top + 12,
          });
        }}
        onPointerLeave={() => {
          drag.current = null;
          setHover(null);
        }}
      >
        {floor.map((line, index) => (
          <line key={`f-${index}`} x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} stroke="var(--line)" />
        ))}
        <line x1={origin.x} y1={origin.y} x2={xEnd.x} y2={xEnd.y} stroke="var(--ink)" strokeWidth="1.4" />
        <line x1={origin.x} y1={origin.y} x2={zEnd.x} y2={zEnd.y} stroke="var(--accent)" strokeWidth="1.6" />
        <line x1={origin.x} y1={origin.y} x2={yEnd.x} y2={yEnd.y} stroke="var(--ink)" strokeWidth="1.4" />
        <text x={xEnd.x + 6} y={xEnd.y} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">x1 {xMax.toFixed(1)}</text>
        <text x={zEnd.x + 6} y={zEnd.y} fill="var(--accent)" fontSize="12" fontFamily="IBM Plex Mono, monospace">x2 {zMax.toFixed(1)}</text>
        <text x={yEnd.x - 36} y={yEnd.y - 6} fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">y {yMax.toFixed(1)}</text>
        {plane.map((line, index) => (
          <line key={`p-${index}`} x1={line[0].x} y1={line[0].y} x2={line[1].x} y2={line[1].y} stroke="var(--highlight)" strokeWidth="1.6" />
        ))}
        {points.map((point) => {
          const screen = project(point.x, point.z, point.y);
          const fit = project(point.x, point.z, w1 * point.x + w2 * point.z + bias);
          return (
            <g key={`${point.x}-${point.z}-${point.y}`}>
              <line x1={screen.x} y1={screen.y} x2={fit.x} y2={fit.y} stroke="var(--residual)" />
              <circle cx={screen.x} cy={screen.y} r="4.5" fill="var(--accent)" />
            </g>
          );
        })}
      </svg>
      {hover && (
        <div className="pointer-events-none absolute z-10 rounded-lg border border-line bg-paper-raised px-2 py-1 font-mono text-[11px] text-ink" style={{ left: hover.left, top: hover.top }}>
          {hover.label}
        </div>
      )}
    </div>
  );
}
