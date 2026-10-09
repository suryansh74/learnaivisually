import Link from "next/link";

export function NextPage({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex justify-end border-t border-line pt-6">
      <Link href={href} className="rounded-full bg-accent px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-paper-raised">
        Next · {label}
      </Link>
    </div>
  );
}
