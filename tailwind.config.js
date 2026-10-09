/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-raised": "var(--paper-raised)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        line: "var(--line)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        highlight: "var(--highlight)",
        residual: "var(--residual)",
        good: "var(--good)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        sheet: "0 1px 0 var(--line), 0 18px 40px rgba(48, 36, 18, 0.06)",
      },
      maxWidth: {
        prose: "42rem",
        sheet: "72rem",
      },
    },
  },
  plugins: [],
};
