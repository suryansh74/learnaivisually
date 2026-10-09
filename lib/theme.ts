/**
 * Single source of truth for Learn AI Visually.
 * New essays must use these tokens (via Tailwind classes or CSS variables).
 * Do not introduce a one-off palette, font, or radius inside a post.
 */
export const theme = {
  name: "Ink & Paper",
  description:
    "Editorial paper, deep ink, one amber mark for the thing being learned, and terracotta for error.",
  colors: {
    paper: "#f3eee4",
    paperRaised: "#fffdf8",
    ink: "#1c1915",
    inkSoft: "#3d3832",
    muted: "#6e675e",
    line: "#e3dacb",
    accent: "#1e4d6b",
    accentSoft: "#e6f0f4",
    highlight: "#c9842a",
    residual: "#b55248",
    good: "#2d6a4f",
  },
  fonts: {
    display: "Fraunces",
    body: "Source Serif 4",
    mono: "IBM Plex Mono",
  },
  radius: {
    card: "1.25rem",
    chip: "999px",
  },
  rules: [
    "Body copy uses font-body. Titles use font-display. Math and code use font-mono.",
    "Page background is bg-paper. Cards are bg-paper-raised with border-line.",
    "The thing being learned (the fitted line, the answer) is text-highlight / stroke highlight.",
    "Error, residuals, and loss are text-residual. A correct or converged state is text-good.",
    "Links and section labels use text-accent. Do not add a second accent color.",
    "Wrap every essay in PostLayout. Do not restyle the header, footer, or prose measure.",
  ],
} as const;

export type Theme = typeof theme;
