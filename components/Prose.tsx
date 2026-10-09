export function Equation({ children }: { children: React.ReactNode }) {
  return <p className="equation text-[15px] leading-7">{children}</p>;
}

export function Callout({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="rounded-2xl border border-line bg-accent-soft/70 px-5 py-4 text-ink-soft">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{label}</p>
      <div className="mt-2 leading-7">{children}</div>
    </aside>
  );
}
