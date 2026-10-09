"use client";

const cloud = [
  [1.2, 1.0],
  [1.8, 1.5],
  [2.4, 2.2],
  [3.0, 2.6],
  [3.5, 3.3],
  [4.1, 3.6],
  [4.6, 4.4],
  [2.2, 1.2],
  [3.2, 2.1],
  [4.0, 3.0],
];

export function PcaDemo() {
  const meanX = cloud.reduce((sum, point) => sum + point[0], 0) / cloud.length;
  const meanY = cloud.reduce((sum, point) => sum + point[1], 0) / cloud.length;
  const direction = { x: 0.72, y: 0.69 };
  const scores = cloud.map(([x, y]) => (x - meanX) * direction.x + (y - meanY) * direction.y);
  const sx = (x: number) => 40 + x * 70;
  const sy = (y: number) => 320 - y * 60;

  return (
    <section className="rounded-[1.25rem] border border-line bg-paper-raised p-4 sm:p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">First component</p>
      <svg viewBox="0 0 420 340" className="mt-3 w-full max-w-xl rounded-xl bg-paper">
        <line x1={sx(meanX - direction.x * 4)} y1={sy(meanY - direction.y * 4)} x2={sx(meanX + direction.x * 4)} y2={sy(meanY + direction.y * 4)} stroke="var(--highlight)" strokeWidth="2" />
        {cloud.map(([x, y], index) => {
          const score = scores[index];
          const px = meanX + score * direction.x;
          const py = meanY + score * direction.y;
          return (
            <g key={`${x}-${y}`}>
              <line x1={sx(x)} y1={sy(y)} x2={sx(px)} y2={sy(py)} stroke="var(--residual)" />
              <circle cx={sx(x)} cy={sy(y)} r="4.5" fill="var(--accent)" />
              <circle cx={sx(px)} cy={sy(py)} r="3" fill="var(--highlight)" />
            </g>
          );
        })}
        <text x="16" y="24" fill="var(--muted)" fontSize="12" fontFamily="IBM Plex Mono, monospace">amber axis keeps the spread</text>
      </svg>
      <p className="mt-3 font-mono text-sm text-ink-soft">scores {scores.map((score) => score.toFixed(1)).join(", ")}</p>
    </section>
  );
}
