import { theme } from "@/lib/theme";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-sheet flex-col gap-2 px-5 py-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>Theme: {theme.name}</span>
        <span>New essays inherit these tokens. Do not restyle a post from scratch.</span>
      </div>
    </footer>
  );
}
