"use client";

import { useEffect, useState } from "react";

type ThemeChoice = "light" | "dark" | "system";

const storageKey = "learnaivisually-theme";

function applyTheme(choice: ThemeChoice) {
  if (choice === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = choice;
}

export function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const next: ThemeChoice = saved === "light" || saved === "dark" ? saved : "system";
    setChoice(next);
    applyTheme(next);
  }, []);

  function choose(next: ThemeChoice) {
    setChoice(next);
    applyTheme(next);
    if (next === "system") window.localStorage.removeItem(storageKey);
    else window.localStorage.setItem(storageKey, next);
  }

  return (
    <div className="flex items-center rounded-full border border-line bg-paper-raised p-1" aria-label="Color theme">
      {(["light", "dark", "system"] as ThemeChoice[]).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => choose(item)}
          className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
            choice === item ? "bg-accent text-paper-raised" : "text-muted hover:text-ink"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
